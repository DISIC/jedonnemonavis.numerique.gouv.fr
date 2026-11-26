# Classification IA — journal d'avancement

> Suivi vivant du chantier « classification des verbatims » (Phase 1). À lire en
> complément du plan : [`classification-integration-plan.md`](./classification-integration-plan.md).
> Mettre à jour ce fichier à chaque étape livrée.

- **Branche** : `feat/verbatim-classification` (partie de `main`).
- **Périmètre Phase 1** : classification temps réel, avis par avis. Pas de backfill
  historique pour l'instant (attend la clé Albert de prod). Vectorisation = Phase 2.

---

## ✅ Livré

### 1. Garde-fou Redis — dégradation gracieuse sans Redis
Permet de déployer sur un environnement **sans addon Redis** (dev) sans bruit ni crash.
- `webapp-backoffice/src/lib/redis.ts` & `webapp-form/src/lib/redis.ts` : le client est
  `null` si `REDIS_URL` n'est pas défini (suppression du fallback `localhost:6379` qui
  causait une boucle `ECONNREFUSED` + buffering mémoire).
- `webapp-backoffice/src/lib/queue.ts` & `webapp-form/src/lib/queue.ts` : queues `null`
  quand pas de Redis.
- Producteurs : `webapp-form/.../alerts/on-review-created.ts` → no-op si pas de queue ;
  `webapp-backoffice/.../export/create.ts` → `TRPCError` claire (export impossible sans worker).
- Workers : `alert-worker.ts` & `export-worker.ts` → ne démarrent pas (warning) sans Redis.
- **Effet de bord positif** : assainit aussi le pipeline d'alertes en dev. Comportement
  prod inchangé.
- Type-check OK dans les deux apps sur les fichiers touchés.

### 2. Modèle de données (Postgres = source de vérité)
Schéma : `webapp-backoffice/prisma/schema.prisma` (⚠️ `webapp-form/prisma/schema.prisma`
est un **symlink** vers celui-ci — un seul fichier, pas de duplication).
- `enum ClassificationStatus { predicted, validated, corrected, failed }`
- `model ClassificationCategory` : arbre auto-référent thème(1)→problématique(2), `code`
  unique stable, `label`, `description`, `active`, `position`.
- `model ReviewClassification` : 1 par avis (`@@unique([review_id, review_created_at])`),
  stocke la prédiction (`predicted_code`, `predicted_score`, `model_name`, `prompt_version`)
  **et** la validation humaine (`validated_code`, `validated_by`, `validated_at`, `status`).
  Relations vers `Review` (composite key, onDelete Cascade) et `User` (onDelete SetNull).
- Migration **`20260609214503_add_review_classification`** générée par Prisma (zéro drift)
  et appliquée. Back-relations ajoutées sur `Review` et `User`.

### 3. Catalogue d'exemple v1 + seed idempotent
⚠️ Catalogue **illustratif**, à remplacer par la liste métier JDMA.
- `webapp-backoffice/prisma/seeds/classification-catalog.ts` : **9 thèmes → 21
  problématiques**, dont un thème **« Sollicitation directe »** (`sollicitation_demande_aide`
  / `_question` / `_suivi_dossier` — demandes directes à l'administration, très fréquentes en
  prod) et un thème **« Autre » → `autre_inclassable`** (vrai bruit / hors-sujet non-sollicitation
  ; réservoir de la future découverte de catégories). Données + `seedClassificationCatalog`
  (upsert par `code`).
- `webapp-backoffice/scripts/seed-classification-catalog.ts` : runner standalone.
- Script npm : **`yarn db:seed-classification`** (sur `tsx`, cross-platform).
- Testé : idempotent (2 passages → 26 lignes, 0 doublon).

### 4. Spike client Albert ✅ (concluant)
- `webapp-backoffice/src/lib/albert.ts` : client minimal OpenAI-compatible. `classifyVerbatim`
  → `POST /v1/chat/completions` avec `response_format: json_schema` (enum des codes du
  catalogue → code toujours valide) + `score` de confiance. `CLASSIFICATION_PROMPT_VERSION`.
  `isAlbertConfigured()`. Réutilisable tel quel par le futur worker.
- `webapp-backoffice/scripts/albert-classify-spike.ts` (script `yarn albert:spike`) : charge
  le catalogue depuis la base, classe 8 verbatims représentatifs.
- **Résultat : 8/8 dans la catégorie attendue**, latence ~150–260 ms (modèle `openweight-small`
  / Ministral-3-8B). Le bruit (« azerty azerty ») → `autre_inclassable` score 0.10 (le score
  reflète bien l'incertitude). Sortie JSON structurée 100 % fiable.
- **Conclusions** : small suffit pour ~20 classes hiérarchiques ; `response_format` json_schema
  fiable ; score exploitable pour prioriser la validation humaine.
- Albert : base `/v1`, modèles confirmés (`openweight-small/medium/large`,
  `openweight-embeddings`=bge-m3, `openweight-rerank`=bge-reranker-v2-m3). Clé test dans
  `.env` (gitignored).

### 5. Pipeline temps réel (Postgres) ✅ (validé e2e)
Périmètre : **Postgres uniquement** (écriture Elasticsearch = lot suivant).
- Queue `classification` ajoutée dans les deux `queue.ts` (nullable, `classificationJobId`).
- **Producteur** `webapp-form/src/server/services/classification/on-review-created.ts`
  (`enqueueReviewClassification`) : enfile seulement si l'avis a un verbatim ; no-op sans Redis.
  ⚠️ **Hook placé dans `createOrUpdateAnswers`** (utils.ts), quand un verbatim est créé/màj —
  PAS dans createReview. Raison : le formulaire est multi-étapes, `createReview` s'exécute
  avant que le verbatim existe (`has_verbatim` encore false → skip). `createOrUpdateAnswers`
  est le point de passage **unique** des 4 chemins (create, dynamic-create, insert-or-update,
  dynamic-insert-or-update), donc le verbatim y est garanti présent. jobId stable = idempotent.
- **Service** `webapp-backoffice/src/server/services/classification/classify-review.ts`
  (`classifyReview`) : charge le verbatim → `classifyVerbatim` (Albert) → upsert
  `ReviewClassification`. Sans dépendance transport (réutilisable worker/backfill/test).
  Cache catalogue in-process (TTL 60s). `catalog.ts` : `loadActiveCatalogue`.
- **Worker** `webapp-backoffice/src/workers/classification-worker.ts` : consommateur fin
  BullMQ (limiter `ALBERT_CLASSIFY_RPM`/min, concurrency `WORKER_CLASSIFY_CONCURRENCY`),
  ne démarre pas sans Redis ni sans Albert. Branché dans `run-all.ts` + `run-classify.ts`.
  Scripts `worker:classify:dev`/`:start`.
- **Validation e2e** (sans Redis) : `yarn classify:check`
  (`scripts/classification-pipeline-check.ts`) crée un avis+verbatim de test, appelle la
  vraie `classifyReview`, relit la ligne, nettoie. Résultat : avis → `auth_franceconnect`
  (0.95) → `ReviewClassification` écrit. EXIT 0, propre.
- **Round-trip BullMQ réel validé** ✅ : `yarn classify:roundtrip`
  (`scripts/classification-roundtrip-check.ts`) enfile un job → le worker (process séparé) le
  pioche dans Redis → classe (`ux_formulaire_complexe`) → écrit en base. Redis monté en local
  via une image custom `alpine + apk add redis` (le CDN Docker Hub ne servait pas l'image
  redis ; voir Setup).
- **Fix DX worker** : `import 'dotenv/config'` ajouté en tête des 4 entrypoints
  (`run-all`/`run-classify`/`run-alert`/`run-export`) — un script `tsx` standalone ne charge
  pas `.env` (no-op en prod où les vars sont injectées). Sans ça les workers ne démarrent pas
  en local.
- `.env.example` (backoffice) documenté : `ALBERT_*`, `WORKER_CLASSIFY_CONCURRENCY`,
  `ALBERT_CLASSIFY_RPM`. Type-check OK (2 apps).

### 6. Enrichissement Elasticsearch ✅ (code) / ⏳ (test live à faire)
Dénormalisation de la classe sur l'index `jdma-answers` pour stats Kibana / exploration.
- `webapp-backoffice/src/lib/elk.ts` : client ES singleton hors contexte tRPC (worker/scripts),
  calqué sur `trpc.ts` (TLS via `./certs/ca/ca.crt` + fallback). Nullable si `ES_ADDON_URI`
  absent. Exporte `JDMA_ANSWERS_INDEX`.
- `src/server/services/classification/es.ts` (`writeAnswerClasse`) : update **best-effort**
  du doc verbatim (`id` = `Answer.id`) avec `classe`/`classe_theme`/`classe_score`/
  `classe_source`. **Ne throw jamais** (PG = source de vérité ; log + swallow).
- `classify-review.ts` : après l'upsert PG, appelle `writeAnswerClasse` (dérive `classe_theme`
  = code du thème parent via le catalogue). Le type `ClassificationCategoryLite` gagne
  `theme_code` (+ `catalog.ts`, spike mis à jour).
- `scripts/es-classification-mapping.ts` (`yarn es:classify-mapping`) : PUT mapping idempotent
  des 4 champs (`keyword`×3 + `float`) sur `jdma-answers` (no-op si l'index n'existe pas encore ;
  ajout de champs = pas de reindex requis).
- Validé : `classify:check` toujours vert avec ES indisponible → écriture ES loggée
  « (non-fatal) », classif OK (EXIT 0). Type-check OK.
- **À faire** : test d'écriture contre un ES réel (nécessite le bootstrap ELK complet :
  `.env` racine, build image ES custom, certifs TLS). Non fait car registry Docker instable
  (couches redis/ES qui EOFent par intermittence).

### 7. UI backoffice — affichage + back de validation ✅ (back) / ⏳ (rendu à vérifier visuellement)
- **Router `classification`** (`src/server/routers/classification/`) enregistré dans `root.ts` :
  - `getCatalogue` (query) : catégories actives (flat + `parent_id`) pour résoudre code→libellé,
    le menu de correction et le futur filtre.
  - `validate` (mutation protégée) : écrit `validated_code`/`validated_by`/`validated_at` +
    `status` (`validated`/`corrected`), contrôle d'accès via `checkRightToProceed`, re-écrit la
    classe dans ES en `source='validated'`. Upsert : crée une ligne « manuelle » si pas de
    prédiction préalable.
- **Liste d'avis** : `review.getList` inclut désormais `classification`.
- **Front (affichage)** : `tabs/reviews.tsx` charge le catalogue et construit une map
  code→{label, themeLabel} (problématique + thème parent), passée à `ReviewTableRow`, qui
  affiche un **badge `Thème › Problématique`** sous le verbatim (vert=validé, orange=prédiction
  <0.5, bleu=prédiction sûre ; ✓ si validé). Type-check OK (les 2 apps).
- **Correction humaine** ✅ : `Reviews/ClassificationEditor.tsx` dans le `ReviewDrawer`.
  Sémantique : la prédiction IA n'est PAS auto-validée (badge bleu) ; l'humain peut
  **confirmer la prédiction** (bouton actif même sans changement → badge vert) OU **corriger
  puis valider**. `canSave = code !== '' && code !== validated_code`. Appelle
  `classification.validate` → invalide `review.getList`. `key={review.id}` reset navigation.
- **Filtre par catégorie dans la modal « Plus de filtres »** ✅ : `classes: string[]` ajouté à
  `ReviewFiltersType` (+ défaut FiltersContext). Section « Catégorie » (checkboxes groupées par
  thème) dans `ReviewFiltersModalRoot` ET `ReviewFiltersModal`. Tags retirables dans
  `ReviewFilterTags`. `get-list` accepte `classes[]` et filtre par classe EFFECTIVE (validée
  sinon prédite). Plus de Select standalone.
- Badge liste : vert=validé, bleu=prédiction (orange=prédiction <0.5, sous-cas non validé).
- Rendu UI à confirmer visuellement dans le backoffice (qui tourne en local).

### Docs
- `docs/classification-integration-plan.md` : plan d'intégration complet.
- `docs/classification-progress.md` : ce fichier.

---

## 🧰 Setup environnement local (fait sur le PC de dev)
- Conteneur **Postgres** monté via `docker compose up -d postgres` → port hôte **5433**,
  base `jdma`, historique de migrations appliqué.
- `webapp-backoffice/.env` (gitignored) ajusté : `POSTGRESQL_ADDON_URI` port **5433** +
  ajout `REDIS_URL=redis://localhost:6379`.
- `yarn install` relancé dans les deux apps (node_modules périmés après le gros pull `main`).
- **Redis** monté en local (conteneur `jdma-redis` sur 6379) via une image custom
  `alpine + apk add redis` — le CDN Docker Hub refusait de servir les images redis/ES/valkey
  (EOF cloudfront sur les couches), seul `alpine` passait. Reproductible :
  `docker build -t jdma-redis-local` (Dockerfile : `FROM alpine; RUN apk add --no-cache redis`).
- **Elasticsearch monté** ✅ : image officielle `docker.elastic.co/elasticsearch/elasticsearch:8.7.1`
  (registry Elastic, qui répond ≠ Docker Hub). Conteneur `jdma-es` single-node, sécurité on,
  `ELASTIC_PASSWORD=ES_ADDON_PASSWORD` (aligné `.env`), https + `rejectUnauthorized:false`
  côté app. Build custom du repo PAS utilisé (base `ubuntu:20.04` impossible à pull).
- **Pipeline complet validé sur la vraie stack** ✅ : avis soumis via le form → indexé ES →
  classifié → `ReviewClassification` (PG) + champs `classe*` sur le doc `jdma-answers`
  (vérifié : `classe=auth_franceconnect`, `classe_theme=acces_authentification`, score 1).
- **Form URL** : basePath `/Demarches` → `http://localhost:3001/Demarches/<product_id>?button=<id>`.
  Login backoffice : `admin@example.com` / `jdma`.
- Utilitaire `tsx scripts/classify-review-by-id.ts <id>` : (re)classer un avis existant.

### ⚠️ Caveats connus
- **Symlink schéma cassé sous Windows** : `webapp-form/prisma/schema.prisma` est matérialisé
  en fichier texte (git core.symlinks). Conséquence : `prisma generate` **échoue côté form
  en local Windows** (le `postinstall` du form aussi → installer avec `--ignore-scripts`).
  Sans impact en dev/prod Linux où le symlink résout. À régler si besoin de lancer l'app
  form localement (recréer un vrai symlink NTFS, ou WSL).
- **Redis non pullé** : l'image `redis:8.6-alpine` n'a pas pu être tirée (coupure réseau).
  Non bloquant (garde-fou no-op). À retenter pour tester le pipeline complet en local.
- **CLAUDE.md imprécis** : dit que le schéma Prisma est « duplicated » → c'est en réalité
  un symlink. (À corriger un jour.)

---

## ⏭️ Prochaines étapes (ordre proposé)
1. ~~Spike client Albert~~ ✅ **fait** (« Livré » §4).
2. ~~Worker temps réel (Postgres)~~ ✅ **fait** (« Livré » §5).
3. ~~Enrichissement Elasticsearch (code)~~ ✅ **fait** (« Livré » §6) — reste le test live
   contre un ES réel (bootstrap ELK + registry coopératif).
4. **UI** : affichage classe → correction humaine (`classification.validate`) → filtre par
   catégorie (réutiliser `ReviewKeywordFilters`/`ReviewFilterTags`).
5. **Backfill historique** (après clé prod) + **stats Kibana**.

> Note test : impossible de pull l'image Redis pour l'instant (registry Docker injoignable),
> donc le round-trip BullMQ réel n'a pas été exécuté localement — mais la logique métier du
> worker est validée via `yarn classify:check`, et le wiring BullMQ est un calque exact du
> worker d'alertes (en prod). Sur un env dev sans Redis, le pipeline no-op (par design).

## ❓ À obtenir / décider
- Clé(s) API Albert (expérimentation pour le spike, prod pour le flux).
- Catalogue v1 métier définitif (remplace l'exemple).
- Questions atelier Albert : sortie structurée, multi-items, RPM prod, modèle suffisant
  (voir plan §9).
