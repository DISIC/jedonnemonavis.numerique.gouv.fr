# Provisioning d'un service JDMA depuis Démarches Numériques

## But

Automatiser la création d'un service (`Product`) et de son formulaire JDMA lorsqu'une
démarche est créée sur **Démarches Numériques** (DN, anciennement « Démarches
Simplifiées »). Objectif : supprimer la rupture de parcours (l'usager n'a plus besoin de
se connecter/créer un compte sur JDMA pour apposer un formulaire) et la double saisie
(nom de démarche, organisation).

Le principe : DN appelle une API JDMA en server-to-server au moment où une démarche est
créée. JDMA crée tout ce qu'un porteur ferait aujourd'hui à la main, puis renvoie à DN le
code d'intégration à afficher en fin de démarche ainsi que les liens d'inscription des
admins.

## Vue d'ensemble du parcours

```
Démarches Numériques                         JDMA
      │                                        │
      │  POST /demarches-numeriques/services   │
      │  (external_id, nom démarche, orga,     │
      │   creator_email, admin_emails)         │
      │───────────────────────────────────────▶│
      │                                        │ 1. idempotence sur external_id
      │                                        │ 2. rattache à l'orga tampon
      │                                        │ 3. crée le Product (source=DN)
      │                                        │ 4. crée le Form (template observatoire)
      │                                        │ 5. publie le formulaire (FormConfig)
      │                                        │ 6. crée le lien d'intégration (Button)
      │                                        │ 7. crée les droits admin + invitations
      │  { product_id, form_id,                │ 8. envoie les mails (créateur + autres)
      │    integration_code, invitations }     │
      │◀───────────────────────────────────────│
      │                                        │
      │  affiche le bouton en fin de démarche   │
```

## Authentification

- L'accès partenaire réutilise `protectedApiProcedure` : en-tête
  `Authorization: Bearer <clé>` (middleware `isKeyAllowed`, `src/server/trpc.ts`).
- Une **clé partenaire dédiée** est émise par JDMA et portée par un **compte de service**
  (un `User` dédié, rôle `user`). La responsabilité des créations reste côté JDMA.
- La clé partenaire est marquée sur le modèle `ApiKey` (`is_partner = true`,
  `partner_source = demarches_numeriques`). Les endpoints DN vérifient ce marqueur — on
  n'utilise **pas** le rôle `admin`/`superadmin` (trop large) pour autoriser un partenaire.
- La clé partenaire n'est **pas** créée par le parcours self-service (`apiKey.create` force
  `scope: 'user'`) mais par une route réservée aux superadmins (ou un seed).

> **TODO sécurité** : les clés API sont aujourd'hui stockées et comparées **en clair**
> (`apiKey.findFirst({ where: { key } })`). On laisse ce fonctionnement pour l'instant ;
> une itération ultérieure devra durcir au moins la clé partenaire (hash en base,
> éventuellement allowlist d'IP).

## Modèle de données

Modifications de schéma (à répercuter dans **`webapp-backoffice/prisma/schema.prisma`
et `webapp-form/prisma/schema.prisma`**, puis `prisma generate` dans les deux apps).

### `Product` — marqueur d'origine + idempotence

```prisma
enum ProductSource {
  manual
  demarches_numeriques
}

model Product {
  // …
  source      ProductSource @default(manual)
  external_id String?       // identifiant de la démarche côté DN

  @@unique([source, external_id])
}
```

- `source` matérialise « service marqué comme issu de DN ».
- `external_id` + la contrainte `@@unique([source, external_id])` servent de **clé
  d'idempotence** : un rejeu de l'appel (retry réseau, double soumission) ne crée pas de
  doublon — on retrouve et renvoie le service existant.

### `ApiKey` — clé partenaire

```prisma
model ApiKey {
  // …
  is_partner     Boolean        @default(false)
  partner_source ProductSource?
}
```

## Organisation tampon

Il n'existe pas de notion d'organisation par défaut dans JDMA (`Entity` a un `name`
unique et un `acronym` obligatoire). Tous les services créés depuis DN atterrissent dans
**une entité tampon unique** (seedée une fois, ex. « Démarches Numériques (à réaffecter) »).

- Le `organisation_name` fourni par DN est conservé sur le service pour permettre à un
  admin JDMA de **réaffecter** ensuite le service vers la vraie organisation.
- Ce choix évite de polluer l'espace de noms des `Entity` avec des noms non vérifiés et
  contourne le problème de l'`acronym` manquant côté DN.

## Endpoints API

Exposés sous `/api/open-api/*` via `trpc-openapi`, câblés dans
`src/server/routers/open-api/index.ts` (même mécanique que `/services`, `/statistiques`,
`/setTop250`).

### `POST /demarches-numeriques/services` — provisionner un service (composite)

Un unique appel, atomique, qui crée l'ensemble.

**Entrée**

| Champ | Type | Description |
|---|---|---|
| `external_id` | string | Identifiant de la démarche côté DN (idempotence) |
| `demarche_name` | string | Devient le titre du service JDMA |
| `organisation_name` | string | Nom de l'organisation DN (conservé pour réaffectation) |
| `creator_email` | string (email) | Créateur de la démarche — reçoit le mail spécifique DN×JDMA |
| `admin_emails` | string[] | Autres admins — reçoivent le mail d'invitation classique |
| `integration_type` | `button` \| `link` | Type de code d'intégration renvoyé (défaut `button`) |

**Traitement** (transaction Prisma)

1. **Idempotence** : si un `Product` existe déjà pour `(demarches_numeriques,
   external_id)`, on le renvoie tel quel (`already_existed: true`).
2. Résolution de l'`entity_id` de l'orga tampon.
3. `Product` créé avec `title = demarche_name`, `source = demarches_numeriques`,
   `external_id`, rattaché à l'orga tampon.
4. `Form` créé sur le **template observatoire** (`FormTemplate.slug = 'root'`). Le verrou
   « démarche essentielle » existant (un seul form `isTop250` par service) reste valable.
5. Publication du formulaire : création d'un `FormConfig` `status = 'published'`
   (`version = 0`), pour que le formulaire soit immédiatement exploitable — comme le fait
   l'UI à la publication. *(à confirmer au développement : dépendance exacte du formulaire
   public à un `FormConfig` publié.)*
6. `Button` créé selon `integration_type`, avec le style de bouton par défaut du template
   (`FormTemplateButton.isDefault`).
7. Droits & invitations : pour chaque email (créateur + admins), création d'un
   `AccessRight` `carrier_admin` (réutilise la logique de `accessRight.create`) ; un
   `UserInviteToken` est généré si le compte n'existe pas encore.
8. **Après commit** (effets de bord) : envoi des mails, journalisation `ApiKeyLog` et
   `UserEvent`.

**Sortie**

```jsonc
{
  "product_id": 42,
  "form_id": 108,
  "button_id": 7,
  "integration_code": "<a href=\"…/Demarches/42?button=7\" …><img …/></a>",
  "integration_url": "https://…/Demarches/42?button=7",
  "invitations": [
    {
      "email": "createur@culture.gouv.fr",
      "account_existed": false,
      "register_url": "https://…/register?email=…&inviteToken=…"
    }
  ],
  "already_existed": false
}
```

> Le code d'intégration (`getButtonCode` / `getButtonUrl`) est aujourd'hui généré côté
> client (`src/utils/tools.ts`). Pour cet endpoint, cette génération est **portée côté
> serveur** (elle ne dépend que de `NEXT_PUBLIC_FORM_APP_URL`). Format de l'URL publique
> pour le template observatoire : `${NEXT_PUBLIC_FORM_APP_URL}/Demarches/{product_id}?button={button_id}`.

### `POST /demarches-numeriques/services/{external_id}/admins` — ajouter des admins

Ajoute des admins à un service DN existant (besoin « API Ajout d'un admin »).

**Entrée** : `{ external_id, admin_emails: string[] }` — résout le `Product` via
`(demarches_numeriques, external_id)`, puis boucle sur `accessRight.create`.

**Sortie** :

```jsonc
{ "results": [ { "email": "agent@culture.gouv.fr", "status": "invited" } ] }
```

`status` ∈ `invited` (invitation envoyée), `already_admin` (déjà admin), `error`.

## Formulaire utilisé

Pour l'instant, **le formulaire de l'Observatoire** (template `slug = 'root'`) est utilisé
systématiquement. Quand le nouveau formulaire (Guillaume Gronier) sera disponible, l'API
sera modifiée pour l'utiliser par défaut.

Conséquence utile : comme le template observatoire est forcé, **toute démarche du top 250
utilise bien le formulaire de l'observatoire** par construction (exigence « démarche
essentielle »). Cette garantie devra être réexaminée le jour où un choix de formulaire
sera ouvert.

## Emails

- **Créateur de la démarche** : un **nouveau template** react-email dédié au parcours
  DN×JDMA (`webapp-backoffice/emails/`), l'invitant à créer/activer son compte JDMA.
- **Autres admins invités** : le template d'invitation classique existant
  (`renderUserInviteEmail`).
- Mécanique réutilisée : `sendMail`, `UserInviteToken`, lien
  `${baseUrl}/register?email=…&inviteToken=…`. À l'inscription,
  `makeRelationFromUserInvite` convertit l'invitation (email seul) en droits réels.

> **Contrainte domaine** : l'inscription (`register`) n'autorise que les domaines
> whitelistés ou en `.gouv.fr` (`checkUserDomain`). Les admins DN hors `.gouv.fr` devront
> voir leur domaine whitelisté.

## Journalisation

- `ApiKeyLog` : chaque appel des endpoints partenaire est journalisé (comme
  `/services`).
- `UserEvent` : les créations sont tracées (service, formulaire, bouton, invitations) au
  nom du compte de service, avec `source = demarches_numeriques` dans les métadonnées.

## Points ouverts (décisions produit)

Ces points sont hors périmètre technique et doivent être tranchés côté produit :

1. **Backfill** : provisionne-t-on uniquement les nouvelles démarches, ou aussi les
   démarches existantes ? *(décision Kevin)*
2. **Choix du type de formulaire** et garantie top250 le jour où le formulaire Gronier
   remplace l'observatoire. *(Clément / Yoann / Victoria)*
3. **Réaffectation** des services depuis l'orga tampon vers la vraie organisation : qui,
   quand, comment.
4. **Récréation annuelle** (cas Ministère de la Culture, qui recrée ses démarches chaque
   année) : un nouvel `external_id` = un nouveau service JDMA (statistiques repartant de
   zéro). À confirmer ou prévoir une continuité.
5. **Affichage des réponses JDMA côté DN** (besoin #8) : envisagé en v2. Les endpoints
   `GET /services` et `POST /statistiques` existent déjà mais renvoient une liste vide si
   la clé n'est liée ni à un service ni à une organisation ; il faudra une branche
   partenaire filtrant par `source` / `external_id`.

## TODO techniques

- [ ] Durcir le stockage de la clé partenaire (hash en base, éventuellement allowlist
      d'IP) — laissé en clair pour l'instant.
- [ ] Confirmer la dépendance du formulaire public à un `FormConfig` publié (étape 5).
- [ ] Vérifier le chemin du widget flottant (`getModalCode` pointe vers
      `…/static/jdma-modal-widget.js`, le fichier vit sous `…/assets/`) si l'intégration
      `modal` est un jour proposée à DN.
