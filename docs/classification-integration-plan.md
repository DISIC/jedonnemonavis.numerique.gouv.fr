# Classification IA des verbatims — plan d'intégration

> Périmètre de ce document : **Phase 1 — classification uniquement**. La vectorisation
> (embeddings + kNN + RAG) est volontairement hors champ ici et fera l'objet d'un plan
> séparé. Les décisions prises ci-dessous laissent toutefois la porte ouverte à la
> vectorisation (mêmes index Elastic, même worker, même client Albert).
>
> Ce document mappe le brief « Intégration IA sur JDMA » sur le code réel du dépôt. Il
> suit la convention de `docs/alerts-architecture.md` : décisions + ancrage dans les
> fichiers existants, pas de pseudo-code spéculatif.

---

## 0. TL;DR

On classe chaque verbatim selon un **référentiel à facettes défini par JDMA** — trois axes
indépendants : **objets** (spécifiques au produit), **thématiques site** (globales) et
**polarité** (positif/negatif, multi-valeur) — via un appel **chat Albert** (compatible
OpenAI, sortie JSON structurée), avec `pourquoi` + `confiance`. Le résultat est :

1. **écrit dans Postgres** : `ReviewClassification` (transverse : polarité, confiance,
   justification, statut) + `ReviewClassificationFacet` (une ligne par facette assignée,
   `source = predicted | validated`) — source de vérité + boucle de validation humaine ;
2. **dénormalisé dans Elastic**, sur l'index `jdma-answers` existant (`objets`, `thematiques`,
   `polarite`…), pour alimenter les stats Kibana et l'exploration par facette.

Deux chemins d'alimentation, **un seul worker** :

- **Temps réel** : à chaque avis créé, on enfile un job sur une nouvelle queue
  `classification` (producteur dans `webapp-form`, exactement comme `form-alerts`).
- **Backfill** : un script batch rejoue l'historique (~16 M) en groupant les verbatims
  par paquets pour tenir dans le quota Albert de 50 000 req/jour.

L'infra nécessaire (BullMQ + Redis + worker + health server + shutdown) **existe déjà**
depuis la feature « alertes ». On la duplique, on n'en réinvente rien.

---

## 1. Points d'accroche dans le code existant

Tout est déjà en place pour brancher la classification sans toucher au chemin critique.

### 1.1 Le hook temps réel existe

`webapp-form/src/server/routers/review/utils.ts` → `createReview()` appelle déjà, en
fire-and-forget, juste après l'insertion :

```ts
void onReviewCreated(prisma, newReview.form_id); // ligne 270
```

C'est exactement le point où l'on ajoutera `void onReviewClassify(prisma, reviewId, createdAt)`.
Le `void` + try/catch interne garantit qu'un incident IA **ne casse jamais** la soumission
d'avis. Même garantie que pour les alertes.

> Note : il existe aussi `dynamicCreateReviewMutation` (`review/dynamic-create.ts`) pour les
> formulaires « dynamiques ». Les **deux** chemins de création devront appeler le hook —
> comme c'est déjà le cas pour `onReviewCreated`. À vérifier au moment de l'implémentation.

### 1.2 Le verbatim est déjà identifié et indexé

- Le verbatim est l'`Answer` avec `field_code === 'verbatim'` (`utils.ts:110`). Sa présence
  passe `review.has_verbatim = true`.
- Chaque `Answer` est **déjà indexée dans Elastic** : `index: 'jdma-answers'`, document de
  type `ElkAnswer` (`webapp-form/src/utils/types.ts:157`), id = `answer.id`.

Conséquence : ajouter `objets` / `thematiques` / `polarite` à l'index `jdma-answers`
revient à **enrichir un mapping existant**, pas à créer un index parallèle. Les stats
agrègent déjà cet index par `term`/`range` (cf. `answer/utils.ts` `queryCountByFieldCode`),
donc une agrégation `terms` sur `thematiques` ou `objets` s'y insère sans nouvelle plomberie.

### 1.3 L'infra worker/queue existe (feature alertes)

| Brique | Fichier de référence (alertes) | Ce qu'on en fait |
| --- | --- | --- |
| Connexion Redis | `webapp-form/src/lib/redis.ts`, `webapp-backoffice/src/lib/redis.ts` | Réutilisé tel quel (même singleton). |
| Déclaration de queue (producteur) | `webapp-form/src/lib/queue.ts` (`formAlertQueue`) | Nouvelle `classificationQueue`. |
| Worker (consommateur) | `webapp-backoffice/src/workers/alert-worker.ts` | Nouveau `classification-worker.ts`. |
| Bootstrap multi-workers | `webapp-backoffice/src/workers/run-all.ts` | On ajoute `startClassificationWorker()`. |
| Health + shutdown | `webapp-backoffice/src/workers/shared.ts` | Réutilisé tel quel. |
| Scripts npm | `worker:alert:*`, `worker:export:*` dans `package.json` | On ajoute `worker:classify:*`. |

La leçon d'archi déjà documentée dans `alerts-architecture.md` (§2-§4) s'applique
intégralement : producteur léger côté form, worker côté backoffice, contrat = (même Redis,
même nom de queue, même shape de payload). On ne refait pas ce débat.

### 1.4 Une feature d'analyse de verbatims existe déjà (à étendre, pas à dupliquer)

`webapp-backoffice/src/server/routers/answer/get-keywords.ts` extrait déjà des mots-clés des
verbatims (agrégation Elastic), exposés via les filtres `ReviewKeywordFilters` dans l'onglet
« avis ». La classification est la suite logique : là où les mots-clés sont du non-supervisé
brut, la classe est une catégorie contrôlée. **L'UI d'exploration par catégorie réutilisera
les composants de filtres existants** (`ReviewFilterTags`, `ReviewKeywordFilters`,
`ReviewFiltersModal`) plutôt que d'en créer de nouveaux.

---

## 2. Le référentiel de classes — modèle à FACETTES

> **Évolution depuis le brief initial** (retour PO DGFiP, cf. `docs/clustering-progress.md`) :
> on abandonne la **classe unique hiérarchique** (`thème → problématique`) au profit de
> **trois axes indépendants** (« facettes »). Un verbatim porte **0..n valeurs par axe** —
> c'est plus fidèle au réel (un même avis parle souvent de plusieurs choses) et ça évite le
> fourre-tout « Autre » et les classements forcés.

- **Axe A — Objet(s)** : de QUOI parle l'usager. **Spécifique au produit** (ex. impôts :
  « déclaration de revenus », « prélèvement à la source »…). Découvert hors-ligne par le
  pipeline de clustering (`analysis/verbatim-clustering/`) et **importé par produit**.
- **Axe B — Thématique(s) site** : nature de la difficulté sur l'**outil** (connexion, bugs,
  clarté, complexité ressentie…). **Globales** — partagées par tous les produits.
- **Axe C — Polarité** : `positif` / `negatif`, **multi-valeur** (`[]` = neutre,
  `[positif, negatif]` = mitigé). Enum figé, **pas de table**.
- Chaque classification porte aussi `pourquoi` (justification citant le texte) et `confiance`
  (0..1) — aide à prioriser la validation humaine.

### Où vit le référentiel ?

**En base** (table `ClassificationFacet`), avec un **scope produit** porté par `product_id` :

- `product_id` **non nul** = facette propre à un produit → les **objets** ;
- `product_id` **nul** = facette **globale** → les **thématiques site**.

Le prompt liste le référentiel du produit concerné (objets du produit + thématiques globales) ;
l'UI de validation et les filtres le lisent via `classification.getCatalogue`.

```prisma
enum FacetAxis {
  objet
  thematique_site
}

model ClassificationFacet {
  id          Int       @id @default(autoincrement())
  axis        FacetAxis // objet (spécifique produit) | thematique_site (global)
  code        String    // identifiant stable injecté dans le prompt
  label       String
  description String?   // aide la désambiguïsation par le LLM
  product_id  Int?      // null = global (thématiques) ; non nul = objets d'un produit
  product     Product?  @relation(fields: [product_id], references: [id], onDelete: Cascade)
  active      Boolean   @default(true)
  position    Int       @default(0)
  assignments ReviewClassificationFacet[]
  created_at  DateTime  @default(now())

  @@unique([product_id, axis, code])
  @@index([product_id, axis, active])
}
```

> Le **`code`** (pas le label) est ce qu'on demande au LLM de renvoyer et ce qu'on stocke :
> robuste aux reformulations de libellé, et stable dans le temps pour les stats. On retire
> une facette avec `active = false` plutôt que de la supprimer.

**Seed vs import** : les **thématiques site** (globales) sont versionnées dans un seed dédié
(`prisma/seeds/classification-catalog.ts`, idempotent). Les **objets** (par produit) sont
**importés depuis les catalogues de clustering** (avec `product_id` non nul) et ne sont pas
dans le seed.

---

## 3. Modèle de données — où stocke-t-on quoi ?

Décision clé : **double stockage assumé**, chacun pour ce qu'il fait de mieux.

### 3.1 Postgres = source de vérité + boucle de validation

Une ligne `ReviewClassification` par avis classé (la classification porte sur **le verbatim de
l'avis**, donc on l'attache à `Review`), + une table de liaison
`ReviewClassificationFacet` (une ligne par facette assignée, sur n'importe quel axe) :

```prisma
model ReviewClassification {
  id                Int      @id @default(autoincrement())
  review            Review   @relation(fields: [review_id, review_created_at], references: [id, created_at])
  review_id         Int
  review_created_at DateTime

  // Résultat transverse (les facettes objet/thématique sont dans la table de liaison)
  polarite       Polarite[] // [] = neutre, [positif, negatif] = mitigé
  pourquoi       String?    // justification citant le texte
  confiance      Float?     // confiance LLM (0..1)
  model_name     String     // modèle Albert utilisé — traçabilité
  prompt_version String     // versionne le couple (prompt + référentiel)

  // Validation humaine (boucle de qualité)
  validated_by   Int?
  validated_at   DateTime?

  status         ClassificationStatus @default(predicted) // predicted | validated | corrected | failed
  facets         ReviewClassificationFacet[]
  created_at     DateTime @default(now())
  updated_at     DateTime @updatedAt

  @@unique([review_id, review_created_at]) // une classif courante par avis
  @@index([status])
}

model ReviewClassificationFacet {
  id                Int                  @id @default(autoincrement())
  classification    ReviewClassification @relation(fields: [classification_id], references: [id], onDelete: Cascade)
  classification_id Int
  facet             ClassificationFacet  @relation(fields: [facet_id], references: [id], onDelete: Cascade)
  facet_id          Int
  axis              FacetAxis            // dénormalisé pour requêter sans jointure
  code              String               // idem
  source            ClassificationStatus @default(predicted) // predicted | validated

  @@unique([classification_id, facet_id])
  @@index([axis, code])
}
```

Pourquoi garder les lignes `predicted` **ET** `validated` côte à côte : la correction humaine
devient à la fois une **mesure de qualité** (taux de correction) et le **jeu d'entraînement**
d'un futur « plan B » (petit modèle FR type CamemBERT/SetFit). La validation remplace les
lignes `source = 'validated'` sans toucher aux lignes `predicted`.

### 3.2 Elastic = lecture analytique (stats + exploration)

On **dénormalise** les facettes courantes (validées si dispo, sinon prédites) sur les documents
`jdma-answers` du verbatim concerné. Champs ajoutés au mapping (cf.
`scripts/es-classification-mapping.ts`) :

```jsonc
{
  "objets":        { "type": "keyword" },  // codes objets (axe A), multi-valeur
  "thematiques":   { "type": "keyword" },  // codes thématiques site (axe B), multi-valeur
  "polarite":      { "type": "keyword" },  // ['positif'] / ['negatif'] / les deux / []
  "pourquoi":      { "type": "text" },
  "confiance":     { "type": "float" },
  "classe_source": { "type": "keyword" }   // "predicted" | "validated"
}
```

> Important : on n'écrit **pas** un index séparé. On reste sur `jdma-answers`, ce qui :
> (a) évite une jointure côté lecture, (b) permet le filtrage hybride futur
> (facettes + similarité quand la vectorisation arrivera), (c) réutilise toute la couche
> stats existante.

**Cohérence des deux stores** : Postgres est maître. Toute écriture (prédiction worker,
correction humaine) écrit Postgres puis met à jour Elastic dans la foulée — même pattern que
`createOrUpdateAnswers`. En cas d'échec ES, on log et on réindexe depuis Postgres (le script de
backfill sert aussi de filet de réindexation).

---

## 4. Le client Albert

Albert est **compatible OpenAI**. On crée un module mince, partagé via la convention du repo
(re-déclaré par app comme `redis.ts`/`queue.ts`, cf. `alerts-architecture.md` §3) :

- `src/lib/albert.ts` (côté backoffice, où tourne le worker — c'est là que les appels chat
  se font). Le `webapp-form` n'appelle **pas** Albert directement : il ne fait qu'enfiler des
  jobs. → un seul point d'appel Albert = backoffice/worker.
- Wrapper minimal autour de `fetch` (ou du SDK `openai` pointé sur `baseURL` Albert). On
  évite d'embarquer une grosse dépendance si un `fetch` suffit.

Responsabilités du module :

- `classifyVerbatim(text, catalogPromptVersion): { code, score }`
- Gestion du **format de sortie structuré** (`response_format` JSON schema OU tool calling —
  **à confirmer avec Albert**, cf. §9 questions ouvertes).
- **Rate limiting / retry** aligné sur les quotas (voir §7) : la queue BullMQ porte déjà
  `attempts: 3` + backoff exponentiel ; on ajoute un limiteur de débit applicatif pour ne pas
  dépasser 100 req/min.
- Modèle par défaut : le référentiel à facettes (multi-label sur 3 axes) est plus exigeant que
  du mono-label ; on démarre donc sur **`openweight-medium`** (cf. `albert.ts`), `small` en
  repli si le débit prime. Le `model_name` est stocké par classification → A/B mesurable.

### Variables d'environnement (à ajouter aux `.env.example`)

```ini
# Albert API (classification)
ALBERT_API_BASE_URL=https://albert.api.etalab.gouv.fr/v1   # à confirmer
ALBERT_API_KEY=
ALBERT_CHAT_MODEL=Ministral-3-8B                            # alias openweight-small
ALBERT_CLASSIFY_RPM=90                                      # marge sous le plafond 100/min
ALBERT_CLASSIFY_BATCH_SIZE=15                               # verbatims groupés par requête (backfill)
WORKER_CLASSIFY_CONCURRENCY=4
```

> Côté worker uniquement (backoffice). Pas de clé Albert dans `webapp-form`.

---

## 4 bis. Environnements & dégradation gracieuse sans Redis

**Contexte** : Redis n'existe **qu'en prod**, pas sur les environnements de dév déployés. On
veut pouvoir pousser en dev avant qu'un addon Redis n'y soit provisionné.

**Décision** : la classification se dégrade **gracieusement** en l'absence de Redis →
**no-op silencieux**. Pas de queue, pas d'appel Albert, pas de log d'erreur ; l'app et la
soumission d'avis fonctionnent normalement, la classification est juste inactive. On testera
la classif en local via le Redis du `docker-compose`, et elle s'activera en dev/prod dès que
`REDIS_URL` y est défini.

**Mise en œuvre** — le garde-fou doit vivre au niveau du singleton **partagé** `redis.ts`,
pas seulement dans le code de classification :

- `src/lib/redis.ts` (les **deux** apps) : ne créer le client `IORedis` **que si `REDIS_URL`
  est défini** ; sinon exporter `null`. Ajouter `lazyConnect: true` + `enableOfflineQueue:
  false` pour échouer vite plutôt que bufferiser à l'infini.
- `src/lib/queue.ts` : si `redis === null`, ne pas instancier la `Queue` (export `null`).
- Producteurs (`alerts/on-review-created.ts` **et** `classification/on-review-created.ts`) :
  `if (!queue) return;` en tête → enqueue = no-op.

> **Effet de bord assumé et positif** : ce correctif assainit aussi le pipeline d'**alertes**
> en dev (qui a aujourd'hui le même défaut : `redis.ts` ouvre la connexion dès l'import →
> spam `ECONNREFUSED` sur un env sans Redis). Comportement prod inchangé. C'est un petit
> changement sur un fichier partagé, à faire avec soin et à mirrorer dans les deux apps.

État actuel constaté (avant correctif) : sans Redis, la soumission d'avis **n'est pas
bloquée** (`void` + try/catch), mais IORedis se reconnecte en boucle (logs d'erreur continus)
et les jobs se bufferisent en mémoire sans jamais partir. D'où le garde-fou ci-dessus.

---

## 5. Pipeline temps réel

```
  webapp-form (producteur)                 webapp-backoffice (worker)
        │                                          ▲
  createReview() / dynamicCreate()                 │  new Worker('classification', fn)
        │  void onReviewClassify(...)              │
        │  classificationQueue.add('classify',     │  → loadVerbatim(reviewId)
        │     { reviewId, reviewCreatedAt })        │  → albert.classifyVerbatim(text)
        └──────────►   REDIS  ◄────────────────────┘  → upsert ReviewClassification (PG)
                  (queue: 'classification')            → update jdma-answers (ES)
```

Détails :

- **Producteur** (`webapp-form/src/server/services/classification/on-review-created.ts`,
  jumeau de `alerts/on-review-created.ts`) : enfile **seulement si l'avis a un verbatim**
  (`has_verbatim`), inutile de classer un avis sans texte libre. Pas de debounce ici (chaque
  avis est une unité indépendante), contrairement aux alertes.
- **Job payload** : `{ reviewId: number, reviewCreatedAt: string }` — clé composite car
  `Review` a une PK composite `[id, created_at]`.
- **Worker** (`webapp-backoffice/src/workers/classification-worker.ts`) : charge le verbatim,
  appelle Albert, upsert Postgres, met à jour ES. `removeOnComplete`/`removeOnFail` comme la
  queue alertes. Idempotent : `@@unique([review_id, review_created_at])` → un re-run écrase
  proprement.
- **Volumétrie temps réel** : ~6 000 avis/j, pics 60–80 req/min. Tient sous le quota chat prod
  (100 req/min, 50 000 req/j) avec marge, mais **les pics frôlent le plafond** → le limiteur
  applicatif lisse, et la queue absorbe naturellement (les jobs patientent quelques secondes).

---

## 6. Pipeline de backfill (historique ~16 M)

Le goulot est le quota **chat = 50 000 req/jour**. Levier : **grouper plusieurs verbatims par
requête** (le brief vise 10–20/req → ~16 à 32 jours de backfill en continu).

- Script dédié : `webapp-backoffice/scripts/backfill-classification.ts` (même esprit que
  `scripts/recompute_title_formatted.ts` déjà présent).
- Lit les avis avec verbatim **non encore classés** (`LEFT JOIN ReviewClassification IS NULL`),
  par curseur sur `(created_at, id)` pour rester stable sur 16 M de lignes.
- Groupe N verbatims (`ALBERT_CLASSIFY_BATCH_SIZE`) en **une** requête chat (prompt « classe
  chacun des verbatims suivants », sortie = tableau JSON aligné sur les ids). À valider :
  fiabilité de la sortie multi-items (§9).
- Respecte le quota jour : compteur persistant, s'arrête à ~49 000 req/j, reprend le lendemain
  (idempotent grâce au `IS NULL`).
- Réutilise **le même** `albert.classifyVerbatim` / store que le worker → zéro divergence de
  logique entre batch et temps réel.

> Le brief mentionne un **plan B** (petit modèle FR local) uniquement si le débit du backfill
> est insuffisant. Ce n'est pas une décision Phase 1 : on démarre LLM-only, on mesure le débit
> réel, on tranche ensuite. Les classifications LLM produites servent alors de jeu
> pré-annoté pour entraîner ce modèle. À garder en tête, à ne pas implémenter maintenant.

> Un vrai endpoint **batch asynchrone** (`/v1/batches`) côté Albert changerait
> radicalement l'économie du backfill → question prioritaire pour l'atelier (§9).

---

## 7. Quotas Albert → garde-fous applicatifs

| Limite (chat, prod) | Valeur | Garde-fou côté JDMA |
| --- | --- | --- |
| Requêtes / min | 100 | Limiteur applicatif à ~90 (`ALBERT_CLASSIFY_RPM`) + lissage par la queue |
| Requêtes / jour | 50 000 | Compteur jour dans le backfill ; le temps réel (~6 000/j) reste très en deçà |
| Tokens / min | 246k | Verbatims courts → non contraignant ; surveillé en logs |

L'**expérimentation** (1 000 req/j) ne suffit pas pour le flux : il faut le **passage en prod**
Albert. → à demander dès l'atelier (§9). En dev/local, on tournera contre un **mock Albert**
(réponses déterministes) pour ne pas brûler le quota et pour les tests Cypress.

---

## 8. Surfaces UI (Phase 1, minimal)

Priorité décroissante — on ne livre pas tout d'un coup :

1. **Affichage des facettes** dans la liste des avis (`Form/tabs/reviews.tsx`,
   `ReviewTableRow.tsx`) : des tags (objets + thématiques + polarité) à côté du verbatim.
2. **Correction humaine** : sur un avis, l'éditeur `ClassificationEditor` permet de
   valider/corriger les facettes (objets + thématiques en multi-sélection, polarité) → écrit
   des lignes `source = 'validated'` dans `ReviewClassificationFacet` + met à jour la polarité
   + réindexe ES. Procédure tRPC `classification.validate` (protégée, droits d'accès au produit
   comme les autres routes review).
3. **Exploration par facette** : filtre par code de facette dans l'onglet avis, en
   **réutilisant** la mécanique de filtres existante (`ReviewFiltersModal` / `ReviewFilterTags`,
   via `input.classes` → `facets.some(code in …)`).
4. **Stats Kibana** : agrégation `terms` sur `objets` / `thematiques` / `polarite` (dashboards
   gérés côté Kibana, pas de code applicatif — juste les champs exposés dans `jdma-answers`).

Un **axe de drill-down** (objet × thématique, ou thématique × polarité) est un livrable de
confort qui vient après ; le modèle à facettes dénormalisées dans ES le rend possible sans
refonte.

---

## 9. Questions ouvertes pour l'atelier Albert

Reprises du brief, à confirmer avant de figer le client (§4) et le backfill (§6) :

1. **Sortie structurée fiable** : `response_format` (JSON schema) vs tool calling — lequel est
   supporté et stable sur le modèle retenu ?
2. **Sortie multi-items fiable** (classer N verbatims en une requête) — indispensable au débit
   du backfill.
3. **Passage en prod + relèvement éventuel du RPM** pour absorber les pics 60–80/min : délais ?
4. **Le `small` suffit-il** pour le multi-label à 3 facettes, ou faut-il `medium` ? (on
   instrumente `model_name` pour trancher sur données réelles).
5. **Comportement sur verbatims très courts / ironie** : taux de facettes vides attendu ?
6. **Endpoint batch asynchrone** (`/v1/batches`) + quota dédié soutenu pour le backfill 16 M ?

Déjà tranché par la doc Albert (ne pas reposer) : gratuité État, accès par formulaire, quotas
embeddings distincts (utile en Phase 2 vectorisation).

---

## 10. Clés API Albert à créer (action côté JDMA)

D'après le brief, l'accès Albert est dispo. Pour démarrer la Phase 1 il faut :

- **1 clé chat** (modèle `small`/`medium`) pour le worker de classification (temps réel +
  backfill partagent la même clé au début ; on pourra séparer si on veut isoler les quotas).
- Vérifier le **tier** : l'expérimentation (1 000 req/j) suffit pour le **spike de validation**
  du prompt, mais le **flux temps réel exige le tier prod** (50 000 req/j). Demander le prod
  dès que le prompt est validé.

La clé va dans `ALBERT_API_KEY` (backoffice uniquement, jamais committée).

---

## 11. Ordre de travail proposé

1. **Référentiel v1** : thématiques site globales (seed) + import des objets par produit
   depuis le clustering. Table `ClassificationFacet`.
2. **Spike client Albert** : `albert.ts` + script qui classe 10 verbatims réels → valide
   format de sortie (3 facettes), prompt, choix de modèle. (Tier expérimentation suffit.)
3. **Schéma Prisma** : `ClassificationFacet` + `ReviewClassification` +
   `ReviewClassificationFacet` (schéma partagé via symlink `webapp-form` → `webapp-backoffice`,
   migration, `prisma generate` dans les 2 apps — cf. CLAUDE.md).
4. **Mapping Elastic** : ajout des champs `objets` / `thematiques` / `polarite` / `pourquoi` /
   `confiance` / `classe_source` sur `jdma-answers` (`yarn es:classify-mapping`).
5. **Worker temps réel** : queue + producteur (`webapp-form`) + worker (`webapp-backoffice`) +
   branchement dans les deux chemins de `createReview`.
6. **UI** : affichage classe → correction humaine → filtre par catégorie.
7. **Backfill** : script de rejeu de l'historique (après passage prod Albert).
8. **Stats Kibana** : dashboards sur le champ `classe`.

Étapes 1-2 sont indépendantes et peuvent démarrer en parallèle. 3-4 posent les fondations.
5 délivre la valeur temps réel. 7 traite le stock.

---

## 12. Risques & points de vigilance

- **Double chemin de création d'avis** (`createReview` + `dynamicCreateReviewMutation`) :
  oublier d'en brancher un → trou de classification silencieux. À tester explicitement.
- **Cohérence PG↔ES** : une mise à jour ES qui échoue après écriture PG laisse Elastic en
  retard. Mitigation : le backfill/réindexation depuis PG est le filet ; loguer les échecs ES.
- **Schéma Prisma dupliqué** : toute évolution doit être mirroir dans les deux apps + double
  `prisma generate` (piège classique du repo, déjà documenté dans CLAUDE.md).
- **Coût de réindexation ES** sur 16 M de documents lors de l'ajout du mapping : prévoir un
  plan de réindexation (alias + nouvel index) plutôt qu'un update massif en place.
- **Quota chat partagé** entre temps réel et backfill : si le backfill consomme tout le quota
  jour, le temps réel prend du retard (la queue absorbe, mais latence accrue). → cloisonner via
  deux clés ou prioriser la queue temps réel.
- **Dérive du catalogue** : v1 figé. Toute évolution passe par l'humain (pas d'auto-découverte
  en Phase 1). La table `active` permet de retirer une classe sans perdre l'historique.
```
