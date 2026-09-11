# Journal d'audit et protection des open API

Ce document décrit ce qui protège les points d'accès `/api/open-api/*` : le journal
qui enregistre chaque appel, le plafonnement par clé, et la garde contre les
tentatives d'authentification répétées.

Il ne concerne **que** les open API. L'API tRPC interne du backoffice
(`/api/trpc/*`) a son propre journal, la table `UserEvent`.

## État

| Volet                           | État      | Branche                    |
| ------------------------------- | --------- | -------------------------- |
| Journal d'audit + purge         | **Livré** | `feat/open-api-audit-log`  |
| Quota par clé et par route      | **Livré** | `feat/open-api-rate-limit` |
| Garde anti-force brute (ban IP) | **Livré** | `feat/open-api-rate-limit` |
| Coupure manuelle d'une clé      | **Livré** | `feat/open-api-rate-limit` |

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

## 2. Journal d'audit

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

## 3. Quota par clé

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

> **Recette en cours :** la constante `RECETTE_MAX` dans `policy.ts` ramène
> temporairement **tous** ces plafonds à 5 / min, pour qu'ils soient atteignables
> à la main. Les valeurs nominales ci-dessus restent écrites dans le code
> (`perMinute(60)`) : repasser `RECETTE_MAX` à `null` les rétablit toutes.

---

## 4. Garde anti-force brute

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

### Une connexion Redis dédiée, distincte de celle de BullMQ

`src/lib/redis.ts` est configuré pour BullMQ avec `maxRetriesPerRequest: null`,
ce qui met les commandes en file d'attente **indéfiniment** quand la connexion
est perdue, au lieu de les faire échouer. C'est ce que BullMQ exige, et c'est
exactement ce qu'il ne faut pas sur un chemin de requête : une commande qui ne
rejette jamais, c'est une requête HTTP qui ne se termine jamais.

Le plafonnement ouvre donc sa propre connexion
(`src/server/open-api-log/redis.ts`) avec trois précautions :
`enableOfflineQueue: false`, `maxRetriesPerRequest: 1`, et un délai maximal dur
de 150 ms autour de chaque commande — parce qu'une socket morte qu'`ioredis`
croit encore vivante ne produit ni erreur ni réponse.

Deux connexions dans le processus, donc, et c'est voulu : un client de
plafonnement en difficulté ne doit pas entraîner la file d'alertes avec lui.

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

### Recetter sans rien bloquer

Le plafonnement et la garde anti-force brute se vérifient **entièrement en
base**, drapeaux à `0`. Aucun appel n'est refusé, tout est enregistré. Les
quatre requêtes ci-dessous ont été éprouvées sur un jeu d'appels réel.

**Ce qui aurait été bloqué, par endpoint et par motif :**

```sql
SELECT route, block_reason, count(*) AS rejets
FROM "ApiKeyLog"
WHERE would_block AND created_at > now() - interval '1 day'
GROUP BY 1, 2 ORDER BY 3 DESC;
```

**Qui serait touché :**

```sql
SELECT apikey_id, ip, route, block_reason, count(*) AS rejets
FROM "ApiKeyLog"
WHERE would_block AND created_at > now() - interval '1 day'
GROUP BY 1, 2, 3, 4 ORDER BY 5 DESC LIMIT 20;
```

**Bannissements qui auraient été prononcés :**

```sql
SELECT ip, strike, reason, created_by, expires_at
FROM "ApiIpBan" ORDER BY created_at DESC LIMIT 20;
```

**Tentatives d'authentification échouées, par IP :**

```sql
SELECT ip, count(*) AS echecs, count(DISTINCT key_hash) AS cles_essayees,
       min(created_at) AS debut, max(created_at) AS fin
FROM "ApiKeyLog"
WHERE status_code = 401 AND apikey_id IS NULL
  AND created_at > now() - interval '1 day'
GROUP BY 1 ORDER BY 2 DESC;
```

> **Avant de passer les drapeaux à `1`, purger les traces de recette.** Les
> bannissements et les compteurs de récidive sont créés **même en mode
> observation** : ils ne sont simplement pas appliqués. Si on active sans faire
> le ménage, les bans de recette encore valides s'appliquent immédiatement, et
> l'escalade repart au rang atteint pendant les tests — le premier vrai
> bannissement pourrait donc durer 24 h au lieu de 15 min.
>
> ```sql
> UPDATE "ApiIpBan" SET lifted_at = now(), lifted_by = 'fin de recette'
> WHERE lifted_at IS NULL;
> ```
>
> ```bash
> redis-cli --scan --pattern 'ban:*'     | xargs -r redis-cli DEL
> redis-cli --scan --pattern 'strikes:*' | xargs -r redis-cli DEL
> ```

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
   devient lui-même le vecteur d'abus. On journalise le premier rejet, puis un
   sur vingt.
4. **Le premier motif de rejet l'emporte.** Plusieurs mécanismes peuvent vouloir
   rejeter le même appel — une IP bannie qui dépasse aussi son quota. C'est le
   plus en amont, celui qui aurait effectivement coupé l'appel, qui reste au
   journal (`markWouldBlock`). Sans cette règle, la mesure d'impact attribue les
   rejets au mauvais mécanisme.
5. **Le 401 ne doit rien révéler.** Le message ne dit pas si la clé existe.
6. **Une panne du journal ne casse jamais un appel.** `flushApiLog` n'échoue
   jamais vers l'appelant ; un échec est bruyant dans les logs applicatifs.

---

## 9. Ce qui n'est pas couvert

- L'API tRPC interne du backoffice (`/api/trpc/*`) — voir `UserEvent`.
- Un écran d'exploration du journal dans le backoffice. Aujourd'hui la lecture
  se fait en SQL. L'écran des clés n'affiche que la dernière utilisation.
- La déclaration du traitement au registre RGPD : IP et corps de requête sont
  des données personnelles. À faire avant la mise en production.

---

## 10. Ce qui a été vérifié en local

| Cas                               | Résultat                                                      |
| --------------------------------- | ------------------------------------------------------------- |
| Clé coupée à la main              | `403 FORBIDDEN`                                               |
| En-têtes sur appel normal         | `X-RateLimit-Limit/Remaining/Reset` posés                     |
| Quota épuisé (60/min)             | `429` + `Retry-After`, `Remaining: 0`                         |
| 10 clés invalides                 | bannissement au 11ᵉ appel                                     |
| IP bannie avec une clé **valide** | `403` — c'est l'IP qui est bloquée, pas la clé                |
| Échantillonnage des rejets        | 14 requêtes rejetées → 1 ligne au journal                     |
| Mode observation                  | rien n'est bloqué, tout est marqué `would_block`              |
| Escalade                          | 1ᵉʳ ban 900 s, 2ᵉ ban 3600 s                                  |
| Redis éteint                      | `200` en ~50 ms — dégradation ouverte, aucune requête ne pend |
| IP exemptée                       | 14 échecs, aucun bannissement                                 |

Reste hors périmètre : l'écran d'exploration du journal dans le backoffice, et
une route d'administration pour poser ou lever un bannissement à la main
(`banIp` / `liftBan` existent, ils ne sont simplement pas exposés).
