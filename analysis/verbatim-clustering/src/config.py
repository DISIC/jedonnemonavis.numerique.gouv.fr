"""Central configuration and shared paths for the verbatim-clustering pipeline.

All tunables live here (or are overridable via env / CLI). Paths are resolved
relative to the project root so scripts can be launched from anywhere.

Two independent dimensions key the artefacts:

  * DEMARCHE  — a subfolder per démarche (e.g. `product-3059`), so running the
    pipeline on several démarches never mixes/overwrites results. The slug is
    derived from the `product_id`(s) of the CSV by `src.clean`, which records it
    in `cache/active_demarche.txt`. Downstream steps reuse the active démarche by
    default; override with the `DEMARCHE` env var when juggling several on disk.

  * RUN_TAG   — suffixes the granularity-DEPENDENT artefacts (e.g. `mcs500`,
    `mcs200`, or a `noise500` re-clustering of the residual) so several runs of
    the SAME démarche coexist. `clean.parquet` / `embeddings.npy` describe the
    *dataset*, not the granularity: they stay shared (un-tagged) for the full
    corpus, and only carry a tag for an explicit SUBSET built by
    `src.extract_subset` (e.g. `clean_noise500.parquet`). Readers therefore use
    the tagged dataset file when it exists and fall back to the shared full
    corpus otherwise.
"""

from __future__ import annotations

import os
import re
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")

# --- Base directories (all gitignored, see .gitignore) -----------------------
DATA_DIR = ROOT / "data"          # raw CSV exported from DBeaver (shared; pick one with --csv)
BASE_CACHE_DIR = ROOT / "cache"   # per-démarche intermediates live in cache/<demarche>/
BASE_OUT_DIR = ROOT / "out"       # per-démarche reports live in out/<demarche>/
ACTIVE_FILE = BASE_CACHE_DIR / "active_demarche.txt"  # slug of the last cleaned démarche

for _d in (DATA_DIR, BASE_CACHE_DIR, BASE_OUT_DIR):
    _d.mkdir(parents=True, exist_ok=True)

# --- RUN_TAG (granularity / subset re-pass) ----------------------------------
RUN_TAG = os.environ.get("RUN_TAG", "").strip()
_SFX = f"_{RUN_TAG}" if RUN_TAG else ""

# --- DEMARCHE_CONTEXT (contexte factuel injecté dans les étapes LLM) ----------
# Améliore la finesse des libellés SANS biaiser la découverte : les clusters sont déjà
# figés en amont (clustering sans contexte), le LLM ne fait que les NOMMER. Quand CTX est
# vrai, le fichier `contexts/<demarche>.txt` est injecté dans name_clusters/consolidate, ET
# les sorties dépendantes du contexte sont suffixées `_ctx` pour comparer un run avec/sans
# contexte côte à côte (notamment les CSV Grist). Les artefacts de clustering
# (clustered/clusters_raw/scatter) sont indépendants du contexte et gardent le tag simple.
CONTEXTS_DIR = ROOT / "contexts"
CONTEXTS_DIR.mkdir(parents=True, exist_ok=True)


def _truthy(v: str) -> bool:
    return str(v).strip().lower() in {"1", "true", "yes", "on", "oui"}


CONTEXT_ON = _truthy(os.environ.get("CTX", ""))
_VSFX = "_ctx" if CONTEXT_ON else ""


# --- DEMARCHE (subfolder per démarche) ---------------------------------------
def _resolve_demarche() -> str:
    """Active démarche: DEMARCHE env > cache/active_demarche.txt > none."""
    env = os.environ.get("DEMARCHE", "").strip()
    if env:
        return env
    if ACTIVE_FILE.exists():
        return ACTIVE_FILE.read_text(encoding="utf-8").strip()
    return ""


def slugify_demarche(ids) -> str:
    """Folder slug from one or more product_id values, e.g. ['3059'] -> 'product-3059'."""
    clean = sorted({str(i).strip() for i in ids if str(i).strip()})
    if not clean:
        return ""
    joined = "_".join(clean)
    joined = re.sub(r"[^0-9A-Za-z._-]+", "-", joined)
    return f"product-{joined}"


# Path globals — filled by _apply_paths(), refreshed by use_demarche().
DEMARCHE = _resolve_demarche()
DEMARCHE_CONTEXT: str = ""    # factual blurb for this démarche (contexts/<demarche>.txt), if any
CACHE_DIR: Path
OUT_DIR: Path
EMB_BATCH_DIR: Path
FULL_EMBEDDINGS_NPY: Path
CLEAN_PARQUET: Path          # write target (dataset clean)
EMBEDDINGS_NPY: Path         # write target (dataset embeddings)
CLEAN_PARQUET_READ: Path     # tagged dataset file if present, else shared full corpus
EMBEDDINGS_NPY_READ: Path
CLUSTERED_PARQUET: Path
CLUSTERS_MD: Path
CLUSTERS_RAW_CSV: Path       # raw per-cluster results BEFORE any LLM naming
SCATTER_HTML: Path
CATALOG_CANDIDATE_CSV: Path
CATALOG_2LEVEL_CSV: Path
CATALOG_2LEVEL_MD: Path
EXPLORE_HTML: Path
GRIST_THEMES_CSV: Path           # 3 linked tables for Grist (thème -> problématique -> verbatim)
GRIST_PROBLEMATIQUES_CSV: Path
GRIST_VERBATIMS_CSV: Path
FACETS_MD: Path                  # faceted referential (objets de la démarche / thématiques site)
FACETS_CSV: Path


def _apply_paths() -> None:
    """(Re)compute every path global from DEMARCHE + RUN_TAG."""
    global CACHE_DIR, OUT_DIR, EMB_BATCH_DIR, FULL_EMBEDDINGS_NPY
    global CLEAN_PARQUET, EMBEDDINGS_NPY, CLEAN_PARQUET_READ, EMBEDDINGS_NPY_READ
    global CLUSTERED_PARQUET, CLUSTERS_MD, CLUSTERS_RAW_CSV, SCATTER_HTML
    global CATALOG_CANDIDATE_CSV, CATALOG_2LEVEL_CSV, CATALOG_2LEVEL_MD, EXPLORE_HTML
    global GRIST_THEMES_CSV, GRIST_PROBLEMATIQUES_CSV, GRIST_VERBATIMS_CSV, DEMARCHE_CONTEXT
    global FACETS_MD, FACETS_CSV

    CACHE_DIR = BASE_CACHE_DIR / DEMARCHE if DEMARCHE else BASE_CACHE_DIR
    OUT_DIR = BASE_OUT_DIR / DEMARCHE if DEMARCHE else BASE_OUT_DIR
    EMB_BATCH_DIR = CACHE_DIR / "emb"
    for _d in (CACHE_DIR, OUT_DIR, EMB_BATCH_DIR):
        _d.mkdir(parents=True, exist_ok=True)

    # Optional factual context for this démarche (used by the LLM steps when CTX is on).
    DEMARCHE_CONTEXT = ""
    if DEMARCHE:
        _ctx_file = CONTEXTS_DIR / f"{DEMARCHE}.txt"
        if _ctx_file.exists():
            DEMARCHE_CONTEXT = _ctx_file.read_text(encoding="utf-8").strip()

    # Dataset artefacts (granularity-INDEPENDENT). Write targets are tagged by RUN_TAG;
    # reads prefer the tagged subset file and fall back to the shared full corpus.
    FULL_EMBEDDINGS_NPY = CACHE_DIR / "embeddings.npy"
    CLEAN_PARQUET = CACHE_DIR / f"clean{_SFX}.parquet"
    EMBEDDINGS_NPY = CACHE_DIR / f"embeddings{_SFX}.npy"
    CLEAN_PARQUET_READ = CLEAN_PARQUET if CLEAN_PARQUET.exists() else CACHE_DIR / "clean.parquet"
    EMBEDDINGS_NPY_READ = EMBEDDINGS_NPY if EMBEDDINGS_NPY.exists() else FULL_EMBEDDINGS_NPY

    # Granularity-DEPENDENT artefacts (tagged by RUN_TAG).
    CLUSTERED_PARQUET = CACHE_DIR / f"clustered{_SFX}.parquet"
    CLUSTERS_MD = OUT_DIR / f"clusters{_SFX}.md"
    CLUSTERS_RAW_CSV = OUT_DIR / f"clusters_raw{_SFX}.csv"
    SCATTER_HTML = OUT_DIR / f"scatter{_SFX}.html"
    # Context-DEPENDENT artefacts: suffixed `_ctx` when CTX is on, so a with-context run
    # sits next to the plain one for comparison (notably the Grist CSVs).
    CATALOG_CANDIDATE_CSV = OUT_DIR / f"catalog_candidate{_SFX}{_VSFX}.csv"
    CATALOG_2LEVEL_CSV = OUT_DIR / f"catalog_2level{_SFX}{_VSFX}.csv"
    CATALOG_2LEVEL_MD = OUT_DIR / f"catalog_2level{_SFX}{_VSFX}.md"
    EXPLORE_HTML = OUT_DIR / f"explore{_SFX}{_VSFX}.html"
    GRIST_THEMES_CSV = OUT_DIR / f"themes{_SFX}{_VSFX}.csv"
    GRIST_PROBLEMATIQUES_CSV = OUT_DIR / f"problematiques{_SFX}{_VSFX}.csv"
    GRIST_VERBATIMS_CSV = OUT_DIR / f"verbatims{_SFX}{_VSFX}.csv"
    FACETS_MD = OUT_DIR / f"facettes{_SFX}{_VSFX}.md"
    FACETS_CSV = OUT_DIR / f"facettes{_SFX}{_VSFX}.csv"


_apply_paths()


def use_demarche(slug: str, *, persist: bool = True) -> None:
    """Switch the active démarche and refresh all paths.

    Called by `src.clean` once it derives the slug from the CSV's product_id, so the
    cleaned dataset (and everything downstream) lands in cache/<slug>/ and out/<slug>/.
    """
    global DEMARCHE
    DEMARCHE = slug
    _apply_paths()
    if persist and slug:
        ACTIVE_FILE.write_text(slug, encoding="utf-8")


# --- Albert API --------------------------------------------------------------
ALBERT_BASE_URL = os.environ.get("ALBERT_API_BASE_URL", "").rstrip("/")
ALBERT_API_KEY = os.environ.get("ALBERT_API_KEY", "")
ALBERT_EMBEDDINGS_MODEL = os.environ.get("ALBERT_EMBEDDINGS_MODEL", "openweight-embeddings")
ALBERT_CHAT_MODEL = os.environ.get("ALBERT_CHAT_MODEL", "openweight-small")
EMBED_BATCH_SIZE = int(os.environ.get("ALBERT_EMBED_BATCH_SIZE", "64"))  # Albert hard cap: 64 inputs/request
ALBERT_RPM = int(os.environ.get("ALBERT_RPM", "90"))


def albert_configured() -> bool:
    return bool(ALBERT_BASE_URL and ALBERT_API_KEY)


def context_block() -> str:
    """Prompt fragment injected into the LLM steps (name_clusters / consolidate) when CTX
    is on and a context file exists. Empty otherwise (legacy behaviour)."""
    if not (CONTEXT_ON and DEMARCHE_CONTEXT):
        return ""
    return (
        "\n\nContexte factuel de la démarche concernée (pour interpréter correctement le "
        "jargon, les sigles et les écrans cités — NE PAS inventer de catégories a priori, "
        "se fonder uniquement sur les verbatims fournis) :\n" + DEMARCHE_CONTEXT + "\n"
    )


# --- Text cleaning -----------------------------------------------------------
MIN_CHARS = 5          # drop verbatims shorter than this (post-trim)
MAX_CHARS = 4000       # truncate very long verbatims before embedding

# --- Clustering hyperparameters (tune via CLI) -------------------------------
# UMAP: reduce 1024-d embeddings to a low-d space where density clustering works.
UMAP_N_NEIGHBORS = 15
UMAP_N_COMPONENTS = 5
UMAP_MIN_DIST = 0.0
UMAP_METRIC = "cosine"

# HDBSCAN: density clustering. min_cluster_size drives granularity (bigger = fewer,
# coarser topics). For ~200k docs, start around 0.1% of N and tune.
HDBSCAN_MIN_CLUSTER_SIZE = 200
HDBSCAN_MIN_SAMPLES = 10
HDBSCAN_METRIC = "euclidean"  # on the UMAP-reduced space

RANDOM_STATE = 42

# A compact French stopword list for c-TF-IDF term extraction. Not exhaustive —
# good enough to surface the discriminative words of each cluster.
FRENCH_STOPWORDS = [
    "alors", "au", "aucun", "aussi", "autre", "avant", "avec", "avoir", "bon",
    "car", "ce", "cela", "ces", "cet", "cette", "ceux", "chaque", "ci", "comme",
    "comment", "dans", "de", "des", "du", "donc", "dos", "elle", "elles", "en",
    "encore", "est", "et", "eu", "fait", "faire", "fois", "font", "hors", "ici",
    "il", "ils", "je", "juste", "la", "le", "les", "leur", "leurs", "là", "ma",
    "mais", "me", "mes", "moi", "mon", "ne", "ni", "nos", "notre", "nous", "on",
    "ou", "où", "par", "parce", "pas", "peu", "plus", "pour", "pourquoi", "quand",
    "que", "quel", "quelle", "quelles", "quels", "qui", "sa", "sans", "se", "ses",
    "seulement", "si", "sien", "son", "sont", "sous", "soyez", "sur", "ta", "tandis",
    "tellement", "tels", "tes", "toi", "ton", "tous", "tout", "trop", "très", "tu",
    "un", "une", "vos", "votre", "vous", "ça", "étaient", "état", "étions", "été",
    "être", "a", "à", "y", "ai", "as", "ont", "avait", "avais", "cest", "j", "l",
    "d", "c", "n", "s", "t", "qu", "m", "etre", "fait", "tres", "plutot", "deja",
    "rien", "bien", "aux", "lors", "mon", "votre", "the",
]
