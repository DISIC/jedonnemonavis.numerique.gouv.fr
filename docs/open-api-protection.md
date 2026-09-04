# Journal d'audit et protection des open API

Ce document décrit ce qui protège les points d'accès `/api/open-api/*` : le journal
qui enregistre chaque appel, le plafonnement par clé, et la garde contre les
tentatives d'authentification répétées.

Il ne concerne **que** les open API. L'API tRPC interne du backoffice
(`/api/trpc/*`) a son propre journal, la table `UserEvent`.

## État

| Volet                           | État          | Branche                    |
| ------------------------------- | ------------- | -------------------------- |
| Journal d'audit + purge         | **Livré**     | `feat/open-api-audit-log`  |
| Quota par clé et par route      | À implémenter | `feat/open-api-rate-limit` |
| Garde anti-force brute (ban IP) | À implémenter | `feat/open-api-rate-limit` |
| Coupure manuelle d'une clé      | À implémenter | `feat/open-api-rate-limit` |

---

## 1. Vue d'ensemble

Tout passe par un point unique : le wrapper HTTP
`webapp-backoffice/src/pages/api/open-api/[...trpc].ts`. C'est le seul goulot par
lequel transitent toutes les open API — celle adossée à Elasticsearch comme les
suivantes.

```
requête
   │
   ├─ 1. IP bannie ?  ──────────────────► rejet immédiat (403)
   │       avant createContext : inutile de payer une session
   │       et un client Elasticsearch pour un attaquant
   │
   ├─ 2. authentification (isKeyAllowed)
   │       ├─ clé coupée manuellement ──► 403
   │       ├─ échec 401 ────────────────► incrémente le compteur d'échecs de l'IP
   │       │                              puis bannit au seuil
   │       └─ succès
   │
   ├─ 3. quota (clé, route) dépassé ? ──► 429 + Retry-After
   │
   ├─ 4. handler de l'endpoint
   │
   └─ 5. journalisation (toujours, quelle que soit l'issue)
```

Le point 5 alimente le point 2 : le compteur d'échecs est incrémenté au moment
où le journal constate un 401. Il n'y a donc **pas de second point
d'observation** à maintenir, et aucun risque de divergence entre ce qui est
journalisé et ce qui est compté.

### Pourquoi le wrapper HTTP et pas un middleware tRPC

Un middleware tRPC ne voit ni les 404 de route inconnue, ni les erreurs de
validation levées par l'adaptateur `trpc-openapi`, et il faudrait le brancher
sur `protectedApiProcedure` — ce qui laisserait de côté `/health` et toute
procédure future qui ne l'utiliserait pas.

Conséquence pratique : **aucun endpoint n'a à se protéger ni à se journaliser
lui-même**. Un endpoint ajouté au routeur est couvert d'office.

---

## 2. Journal d'audit — livré

### Ce qui est enregistré

Une ligne dans `ApiKeyLog` par appel, **succès ou échec** :

| Colonne                        | Contenu                                               |
| ------------------------------ | ----------------------------------------------------- |
| `ip`, `user_agent`             | Origine de l'appel                                    |
| `key_hash`                     | SHA-256 du Bearer présenté                            |
| `apikey_id`, `user_id`         | Clé résolue et son porteur, `null` si l'auth a échoué |
| `method`, `route`, `url`       | Route templatée + chemin réel avec query              |
| `request_body`                 | Corps JSON, ou paramètres de query en GET             |
| `status_code`, `error_message` | Issue de l'appel                                      |
| `response_body`                | Selon la politique de la route                        |
| `duration_ms`, `created_at`    | Métrique et horodatage                                |

`apikey_id` est **nullable** et en `ON DELETE SET NULL` : on journalise les
appels sans clé valide, et supprimer une clé ne doit pas effacer la piste
d'audit qui la concerne. Le `key_hash` conserve la corrélation entre les appels
d'un même appelant, y compris pour une clé inexistante ou supprimée depuis.

### `route` n'est pas `url`

`route` est le chemin **templaté**
(`/demarches-numeriques/services/{external_id}/admins`), résolu depuis le
document OpenAPI généré par `trpc-openapi`. C'est lui qui permet d'agréger les
appels d'une même API — pour le suivi comme pour le plafonnement. `url` garde le
chemin réel et sa query.

### Ce qui est réellement stocké, route par route

Deux raisons de ne pas tout garder partout :

1. **Données personnelles.** Le corps de `POST /demarches-numeriques/services`
   contient des adresses e-mail d'agents ; la réponse de `GET /avis` contient des
   verbatims citoyens. Les recopier intégralement, c'est créer un second
   traitement, moins protégé que l'original.
2. **Volumétrie.** Une lecture paginée d'avis peut peser plusieurs mégaoctets.
   Le journal deviendrait plus lourd que la base qu'il observe.

D'où l'arbitrage : **corps complets sur les mutations**, **résumé sur les
lectures**. Le mode `summary` garde la _forme_ de la réponse, pas son contenu :
`{"data":{"_array_length":250},"next_cursor":"eyJ0…"}` dit que 250 avis sont
sortis et avec quel curseur, sans stocker un seul verbatim.

Deux règles passent au-dessus de la politique :

- **Toute réponse d'erreur (≥ 400) est conservée en entier.** Elles sont courtes
  et c'est tout leur intérêt en cas d'incident.
- **Les secrets sont toujours masqués** (`key`, `password`, `token`, `otp`,
  `authorization`…), dans le corps comme dans l'URL, avant écriture.

Plafond de 16 Ko par corps : au-delà, un aperçu remplace le tout.

### Rétention et purge

Chaque route déclare sa durée de conservation. La purge tourne toutes les nuits
à 3 h 30 UTC via `clevercloud/cron.json` → `clevercloud/purge-api-logs.sh` →
`npm run logs:purge`.

Sans purge, le journal grossit indéfiniment et on manque au principe de
limitation de la conservation — il contient des IP et des corps de requête
porteurs de données personnelles.

```bash
DRY_RUN=1 npm run logs:purge   # compte sans supprimer
```

> **Attention au premier passage en production.** Les lignes antérieures à ce
> journal n'ont pas de `route` renseignée : elles relèvent donc de la politique
> par défaut et seront purgées au-delà de 180 jours dès la première exécution.

---

## 3. Quota par clé — à implémenter

### Principe

Un plafond glissant par **couple (clé, route)**. Dépassement → `429` avec
`Retry-After` et les en-têtes `X-RateLimit-Limit` / `X-RateLimit-Remaining` /
`X-RateLimit-Reset`.

Le quota se répare tout seul à l'expiration de la fenêtre. Un partenaire qui le
dépasse n'est **jamais** banni : il a une clé valide, il est simplement bavard.

### Où c'est appliqué

Après résolution de la clé, dans `isKeyAllowed` — c'est le seul endroit où l'on
sait de qui il s'agit. `TRPCError` de code `TOO_MANY_REQUESTS`, que
`trpc-openapi` traduit en 429.

### Seuils de départ

À corriger dès qu'on aura des chiffres réels. Aujourd'hui personne ne sait ce
qu'est un trafic normal sur ces API — voir le mode observation plus bas.

| Endpoint                           | Quota    | Motif                                            |
| ---------------------------------- | -------- | ------------------------------------------------ |
| `GET /avis`                        | 60 / min | Extraction paginée, le partenaire enchaîne       |
| `GET /services`                    | 60 / min | Léger                                            |
| `POST /statistiques`               | 30 / min | Requête lourde côté Elasticsearch                |
| `POST /demarches-numeriques/*`     | 30 / min | Appelé à la création d'une démarche              |
| `POST /setTop250`, `/triggerMails` | 5 / min  | Administration, rare par nature                  |
| `GET /health`                      | aucun    | **Exempté** : la supervision l'appelle en boucle |

---

## 4. Garde anti-force brute — à implémenter

### Principe

Compte les **401 uniquement**, par IP, sur une fenêtre glissante. Au-delà du
seuil, l'IP est bannie temporairement et rejetée avant toute authentification.

Les 404 ne comptent pas : un scanner qui tape des chemins au hasard n'est pas
une tentative de deviner une clé.

### Escalade

Bannissement progressif à la récidive : 15 minutes, puis 1 heure, puis 24 heures.

### Ce que ça protège vraiment

Soyons lucides : deviner une clé de 44 caractères aléatoires par force brute
n'arrivera pas. La garde sert à faire taire les scanners et surtout à **donner
le signal qu'on te cherche**. C'est déjà une bonne raison, mais ce n'est pas une
protection cryptographique.

### Exemptions

Les partenaires publics sortent souvent derrière une IP d'égressage unique de
ministère. Bannir cette IP couperait tout le monde. D'où une liste d'exemption
`OPEN_API_EXEMPT_IPS`, sur le modèle de `LIMITER_ALLOWED_IPS` côté webapp-form.

---

## 5. Stockage : Redis pour la décision, Postgres pour la vérité

| Où           | Quoi                                             | Pourquoi là                                |
| ------------ | ------------------------------------------------ | ------------------------------------------ |
| **Redis**    | compteurs, « cette IP est-elle bannie ? »        | rapide, TTL natif, partagé entre instances |
| **Postgres** | `ApiIpBan` — bans durables, auditables, manuels  | survit à un redémarrage de Redis           |
| **Postgres** | `ApiKey.blocked_at` — coupure manuelle d'une clé | décision humaine, pas un compteur          |
| **Postgres** | `ApiKeyLog` — le journal                         | historique et analyse                      |

Redis est déjà dans le projet : `ioredis`, singleton `src/lib/redis.ts`,
variable `REDIS_URL`, utilisé par BullMQ pour les alertes. Pas de nouvelle
dépendance, pas de nouvel addon.

### Clés Redis

```
rl:<api_key_id>:<route>   compteur de quota,        TTL = fenêtre
bf:<ip>                   compteur d'échecs d'auth, TTL = fenêtre
ban:<ip>                  présence = banni,          TTL = durée du ban
```

### Pourquoi pas le limiteur en mémoire déjà présent

`webapp-backoffice/src/server/utils/rate-limit.ts` (arrivé avec la PR #561)
stocke ses compteurs dans une `Map` de processus. Sur Clever Cloud, avec
plusieurs instances, cela donne un plafond effectif de N × la limite — approximatif
mais tolérable pour un quota. En revanche **un ban en mémoire ne bannit rien** :
l'attaquant retombe sur une autre instance au coup suivant. Il reste tout à fait
adapté à son usage actuel (procédures d'authentification du backoffice).

### Si Redis est indisponible : on laisse passer

Décision assumée. Une API partenaire ne doit pas s'arrêter parce que le cache
est éteint. L'incident est journalisé, le risque est borné à la durée de la
panne.

**La coupure manuelle d'une clé échappe à cette dégradation** : elle est lue
dans `isKeyAllowed`, où la clé est déjà chargée depuis Postgres. Même Redis
éteint, on garde le moyen de couper immédiatement une clé compromise.

---

## 6. Configuration

### Un seul fichier

`webapp-backoffice/src/server/open-api-log/policy.ts`.

Ce qui est **par route** vit dans la même table que la politique de
journalisation : une entrée = tout ce qu'on sait d'un endpoint. Deux tables
indexées à l'identique finiraient par diverger, avec un endpoint déclaré dans
l'une et oublié dans l'autre.

```ts
export type EndpointPolicy = {
  requestBody: boolean;
  responseBody: "none" | "summary" | "full";
  retentionDays: number;
  /** Quota par clé et par route. `null` = pas de plafond. */
  rateLimit: { max: number; windowMs: number } | null;
};
```

Ce qui est **global** ne peut pas être par route :

```ts
export const AUTH_GUARD = {
  maxFailures: 10, // 401 tolérés
  windowMs: 10 * 60_000, // sur 10 minutes
  banMinutes: [15, 60, 1440], // récidive : 15 min, 1 h, 24 h
  exemptIps: (process.env.OPEN_API_EXEMPT_IPS || "").split(",").filter(Boolean),
};
```

Les clés sont au format `MÉTHODE /chemin/templaté`, exactement tel que déclaré
dans le `.meta({ openapi: { path } })` du routeur, paramètres compris.

Un endpoint absent de la table est **quand même journalisé** : il retombe sur
`DEFAULT_POLICY`. Une entrée est donc un choix explicite, jamais une obligation.

> Une clé mal orthographiée ne provoque **aucune erreur** : elle est simplement
> ignorée et l'endpoint retombe sur le défaut. C'est le seul piège du fichier.

### Variables d'environnement

| Variable                  | Défaut | Rôle                                         |
| ------------------------- | ------ | -------------------------------------------- |
| `OPEN_API_QUOTA_ENFORCE`  | `0`    | Applique les quotas (sinon : observation)    |
| `OPEN_API_BAN_ENFORCE`    | `0`    | Applique les bans (sinon : observation)      |
| `OPEN_API_EXEMPT_IPS`     | vide   | IP jamais bannies, séparées par des virgules |
| `PURGE_API_LOGS_DISABLED` | `0`    | Désactive la purge sur cet environnement     |
| `REDIS_URL`               | —      | Déjà utilisée par BullMQ                     |

Deux drapeaux distincts, volontairement : tu peux activer les quotas quand tu es
à l'aise avec les seuils et laisser le ban en observation plus longtemps.

---

## 7. Mode observation

Tant qu'un drapeau est à `0`, le mécanisme **compte, journalise
`would_block: true` dans la ligne d'audit, et laisse passer**.

C'est le vrai apport du journal livré en phase 1 : quelques semaines de trafic
réel, puis on ouvre le journal, on regarde qui aurait été bloqué et à quel
volume, on ajuste les seuils, et seulement ensuite on active. Aucun risque de
couper un partenaire le jour du déploiement.

---

## 8. Décisions de conception à ne pas défaire

1. **L'IP doit rester infalsifiable.** `getClientIp`
   (`src/server/utils/client-ip.ts`) prend le **dernier** hop de la chaîne de
   proxy, seul écrit par un proxy de confiance. Prendre la première entrée
   laisserait un attaquant faire bannir l'IP de quelqu'un d'autre — un outil de
   déni de service clés en main.
2. **Quota et ban sont deux mécanismes séparés.** Un dépassement de quota ne
   doit jamais mener à un ban.
3. **Le rejet doit rester peu coûteux.** Une IP bannie qui martèle ne doit pas
   provoquer une écriture Postgres par requête, sinon le mécanisme anti-abus
   devient lui-même le vecteur d'abus. On journalise le premier rejet, puis on
   échantillonne.
4. **Le 401 ne doit rien révéler.** Le message ne dit pas si la clé existe.
5. **Une panne du journal ne casse jamais un appel.** `flushApiLog` n'échoue
   jamais vers l'appelant ; un échec est bruyant dans les logs applicatifs.

---

## 9. Ce qui n'est pas couvert

- L'API tRPC interne du backoffice (`/api/trpc/*`) — voir `UserEvent`.
- Un écran d'exploration du journal dans le backoffice. Aujourd'hui la lecture
  se fait en SQL. L'écran des clés n'affiche que la dernière utilisation.
- La déclaration du traitement au registre RGPD : IP et corps de requête sont
  des données personnelles. À faire avant la mise en production.

---

## 10. Plan d'implémentation de la phase 2

1. `rateLimit` dans `EndpointPolicy`, `AUTH_GUARD`, les deux drapeaux
2. `open-api-log/limits.ts` — compteurs Redis, dégradation ouverte si Redis est absent
3. Branchement aux trois points du wrapper, en-têtes `429` / `Retry-After` / `X-RateLimit-*`
4. Migration : `ApiIpBan`, `ApiKey.blocked_at` / `blocked_reason`, `ApiKeyLog.would_block`
5. Vérification locale : quota atteint, ban déclenché, escalade, exemption, Redis coupé
