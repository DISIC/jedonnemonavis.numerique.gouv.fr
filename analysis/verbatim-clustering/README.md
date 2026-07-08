# Découverte de catégories de verbatims (clustering non-supervisé)

Exploration **offline** : découvrir les catégories de verbatims *depuis les données*
(et non depuis le catalogue métier JDMA), sur une démarche dense — **déclaration de
revenus**, 6 derniers mois (~200 K verbatims).

Chaîne : `embeddings (Albert bge-m3) → UMAP → HDBSCAN → c-TF-IDF → nommage LLM`.

> ⚠️ **Données personnelles** : les verbatims sont des textes d'usagers. Le dossier
> `data/`, le cache et les sorties sont gitignorés. Ne jamais committer de verbatim brut.

## Prérequis

- L'environnement est géré par **uv** avec un Python 3.11 épinglé (cf. `.python-version`).
- Une clé Albert : copier `.env.example` en `.env` et renseigner `ALBERT_API_KEY`
  (mêmes valeurs que `webapp-backoffice/.env`).

## Installation

```powershell
# depuis analysis/verbatim-clustering/
uv sync          # crée .venv en Python 3.11 et installe les dépendances
```

## Données

Exporter les verbatims depuis DBeaver (prod) dans `data/` au format CSV (UTF-8,
quoting activé). Requête type :

```sql
SELECT r.id AS review_id, r.created_at AS review_created_at, r.product_id,
       a.intention, a.answer_text AS verbatim
FROM "Review" r
JOIN "Answer" a ON a.review_id = r.id AND a.review_created_at = r.created_at
WHERE r.product_id IN (/* id(s) déclaration de revenus */)
  AND a.field_code = 'verbatim'
  AND r.created_at >= now() - interval '6 months'
  AND a.answer_text IS NOT NULL
  AND length(trim(a.answer_text)) >= 5;
```

## Pipeline

```powershell
uv run python -m src.clean                 # 1. nettoie + dédup -> cache/<demarche>/clean.parquet
uv run python -m src.embed --limit 3000    # 2. (dry-run sample) embeddings Albert
uv run python -m src.embed                 # 2. run complet (reprenable, checkpoints)
uv run python -m src.cluster               # 3. UMAP+HDBSCAN -> out/<demarche>/clusters.md + clusters_raw.csv + scatter.html
uv run python -m src.name_clusters         # 4. nommage LLM -> out/<demarche>/catalog_candidate.csv
uv run python -m src.consolidate           # 5. consolidation thèmes LLM -> catalog_2level.*
uv run python -m src.explore_page          # 6. explore.html + 3 CSV Grist (themes/problematiques/verbatims)
```

### Un dossier par démarche

Toutes les sorties sont rangées par démarche : `out/<demarche>/…` et `cache/<demarche>/…`.
Le slug est **dérivé du `product_id`** du CSV par `src.clean` (ex. `product-3059`) et
mémorisé dans `cache/active_demarche.txt`. Les étapes suivantes reprennent **cette démarche
active** par défaut ; pour en cibler une autre déjà sur le disque, surcharger avec la variable
`DEMARCHE` :

```powershell
$env:DEMARCHE = "product-3059"   # sinon = dernière démarche nettoyée
```

`clean.parquet` / `embeddings.npy` décrivent le *jeu de données* (pas la granularité) : ils
restent partagés au sein de la démarche. Les lecteurs prennent le fichier taggé d'un
sous-ensemble s'il existe (ex. `clean_noise500.parquet`), sinon le corpus complet.

### Itérer sur la granularité

Le nombre/finesse des clusters se règle surtout via HDBSCAN. L'embedding est mis en
cache, donc seules les étapes 3-4 se rejouent :

```powershell
uv run python -m src.cluster --min-cluster-size 500   # moins de clusters, plus gros
uv run python -m src.cluster --min-cluster-size 100   # plus de clusters, plus fins
```

### Garder plusieurs runs côte à côte (RUN_TAG)

Pour qu'une nouvelle granularité **n'écrase pas** la précédente, définir `RUN_TAG` : il
suffixe toutes les sorties dépendantes de la granularité (`clustered_<tag>.parquet`,
`catalog_candidate_<tag>.csv`, `catalog_2level_<tag>.*`, `explore_<tag>.html`,
`scatter_<tag>.html`, `clusters_<tag>.md`). `clean.parquet` et `embeddings.npy` restent
partagés (indépendants de la granularité). Exemple (PowerShell) :

```powershell
$env:RUN_TAG = "mcs500"
python -m src.cluster --min-cluster-size 500
python -m src.name_clusters ; python -m src.consolidate ; python -m src.explore_page
# -> out/<demarche>/catalog_2level_mcs500.*, explore_mcs500.html, themes_mcs500.csv, etc.
```

Salves actuelles disponibles : **`_mcs500`** (11 thèmes / 28 problématiques, la plus
aboutie) et **`_mcs200`** (11 thèmes / 77 problématiques, plus fine).

### Contexte de la démarche (option, libellés plus fins)

Donner un contexte factuel au LLM améliore le **nommage** des clusters (jargon, sigles : 2044,
Visale, CESU+, « le 17 »…) **sans biaiser la découverte** : les clusters sont déjà figés par
HDBSCAN avant l'intervention du LLM. Le contexte n'agit donc que sur `name_clusters` et
`consolidate` — pas sur l'embedding (le préfixer dégraderait les vecteurs) ni le clustering.

1. Créer `contexts/<demarche>.txt` (3-5 lignes factuelles : ce que fait le service + sigles).
   ⚠️ Factuel et neutre, **pas** une liste de catégories attendues.
2. Lancer les étapes LLM avec `CTX=1` :
   ```powershell
   $env:CTX = "1"
   python -m src.name_clusters ; python -m src.consolidate ; python -m src.explore_page
   ```
3. Les sorties dépendantes du contexte sont **suffixées `_ctx`** (`catalog_2level_<tag>_ctx.*`,
   `themes_<tag>_ctx.csv`, etc.) → comparables côte à côte avec la version sans contexte. Le
   clustering (`clustered`/`clusters_raw`/`scatter`) est partagé : **inutile de re-clusteriser**,
   on rejoue juste les 3 étapes ci-dessus.

## Sorties (toutes sous `out/<demarche>/`, suffixées `_<tag>`)

- **`clusters_raw_<tag>.csv`** — résultat **brut, AVANT tout LLM** : 1 ligne/cluster
  (`product_id`, `run_tag`, `cluster`, `n_answers`, `n_unique`, `pct_answers`, `top_terms`,
  `example_1..8`). Le matériau de découverte sans interprétation.
- `clusters_<tag>.md` — même contenu, lisible.
- `scatter_<tag>.html` — carte UMAP 2-D interactive (sanity-check visuel).
- `catalog_candidate_<tag>.csv` — catalogue candidat (1 ligne/cluster, libellé/desc/thème LLM).
- `catalog_2level_<tag>.{csv,md}` — taxonomie 2 niveaux consolidée (LLM).
- `explore_<tag>.html` — explorateur verbatims↔catégories (hors-ligne).
- **`themes_<tag>.csv` / `problematiques_<tag>.csv` / `verbatims_<tag>.csv`** — résultat final
  en **3 tables liées pour Grist** (voir ci-dessous).

### Export Grist (3 tables liées)

`explore_page.py` produit le pendant tabulaire de l'explorateur HTML, conçu pour Grist :

| CSV | Clés | Colonnes |
|---|---|---|
| `themes_<tag>.csv` | `theme_code` | `theme_label`, `theme_description`, `nb_problematiques`, `nb_reponses`, `nb_verbatims_uniques` |
| `problematiques_<tag>.csv` | `cluster`, `theme_code`→Thèmes | `label`, `description`, `top_terms`, `nb_reponses`, `nb_verbatims_uniques` |
| `verbatims_<tag>.csv` | `cluster`→Problématiques | `theme_code`, `theme_label`, `problematique`, `verbatim`, `dup_count`, `intention`, `representativite`, `rang` |

Les **non catégorisés** forment un thème + une problématique `bruit` synthétiques (cluster `-1`)
pour que toutes les références résolvent. **1 ligne = 1 verbatim unique** (`dup_count` = ×N).

**Mise en place Grist (procédure testée, UI FR) :**

1. **Importer les 3 CSV** : Add New → *Import from file* → chaque fichier → Destination
   **New Table** → Import. Renommer : `Themes`, `Problematiques`, `Verbatims`.
2. **Colonnes Reference** (le cœur) :
   - `Problematiques.theme_code` → type **Reference** → table `Themes` → *Show column* =
     **`theme_code`** (apparie sur la clé), puis bascule l'affichage sur `theme_label`.
   - `Verbatims.cluster` → type **Reference** → table `Problematiques` → *Show column* =
     **`cluster`**, puis bascule sur `label`.
   - 🔑 Apparier d'abord sur la clé (code / numéro), **ensuite** changer l'affichage.
3. **Page** : Add New → *Ajouter une page* → `Themes` (une seule fois) ; puis Add New →
   *Ajouter un widget à la page* pour `Problematiques`, puis pour `Verbatims`.
4. **Cascade** : section → panneau droit → onglet **Table** → **Données sources** →
   **Sélectionner par** : `Problematiques`→`THEMES`, `Verbatims`→`PROBLEMATIQUES`.
5. Finitions : trier `Verbatims` par `rang` ; masquer `theme_code`/`top_terms` ; vue **fiche**
   sur `Verbatims` pour lire les textes longs. Les volumes sont pré-calculés.

**Automatisation via l'API Grist (au lieu du manuel) :** deux scripts font tout, sans clic.
Pré-requis dans `.env` : `GRIST_BASE_URL`, `GRIST_DOC_ID`, `GRIST_API_KEY` (Profil → API key).

```powershell
$env:DEMARCHE="product-3059"; $env:RUN_TAG="mcs200"   # (+ $env:CTX="1" pour la variante _ctx)
uv run python -m src.grist_push     # crée Themes/Problematiques/Verbatims_<tag> + données + colonnes Reference
uv run python -m src.grist_page     # crée la page à 3 sections liées (cascade Thème->Problématique->Verbatim)
```

- `grist_push` : tables + lignes (lots de 500 — Grist limite la taille des requêtes) + références
  `Problematiques.theme_ref`→Themes et `Verbatims.prob_ref`→Problematiques (la valeur stockée est
  le rowId, résolu par le script). `--replace` recrée les 3 tables si elles existent déjà.
- `grist_page` : page + 3 sections + linking via les *user actions* (`CreateViewSection`,
  `linkSrcSectionRef`/`linkTargetColRef`). Validé sur grist.numerique.gouv.fr.
- Les tables sont nommées `<Base>_<tag>` (ex. `Themes_mcs200`, `Themes_mcs200_ctx`), donc
  plusieurs runs/variantes cohabitent dans le même doc pour comparaison.

## Étapes

| # | Script | Entrée | Sortie (sous `<demarche>/`) |
|---|--------|--------|--------|
| 1 | `clean.py` | `data/*.csv` | `cache/clean.parquet` (+ `active_demarche.txt`) |
| 2 | `embed.py` | clean.parquet | `cache/embeddings.npy` (+ checkpoints `cache/emb/`) |
| 3 | `cluster.py` | embeddings + clean | `cache/clustered_<tag>.parquet`, `out/clusters_<tag>.md`, `out/clusters_raw_<tag>.csv`, `out/scatter_<tag>.html` |
| 4 | `name_clusters.py` | clustered + embeddings | `out/catalog_candidate_<tag>.csv` |
| 5 | `consolidate.py` | catalog_candidate | `out/catalog_2level_<tag>.{csv,md}` |
| 6 | `explore_page.py` | clustered + catalog_2level | `out/explore_<tag>.html`, `out/{themes,problematiques,verbatims}_<tag>.csv` |
