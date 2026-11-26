"""Step 1 — load the DBeaver CSV export, clean and de-duplicate verbatims.

Input : a CSV in data/ (columns: review_id, review_created_at, product_id,
        intention, verbatim — column names are detected flexibly).
Output: cache/clean.parquet with a stable `row_id` (0..N-1) used to align
        embeddings and cluster labels downstream.

De-duplication is deliberate: verbatims are full of near-identical short answers
("RAS", "Très bien", "parfait"). We keep ONE row per normalized text plus a
`dup_count` weight, which (a) slashes the embedding bill and (b) stops trivial
repeats from dominating the density clusters.

Usage:
    uv run python -m src.clean [--csv data/yourfile.csv]
"""

from __future__ import annotations

import argparse
import re
import sys
import unicodedata
from pathlib import Path

import pandas as pd

from . import config

# Candidate names for the free-text column, in priority order.
VERBATIM_COLS = ["verbatim", "answer_text", "text", "comment", "commentaire"]


def _find_csv() -> str:
    csvs = sorted(config.DATA_DIR.glob("*.csv")) + sorted(config.DATA_DIR.glob("*.tsv"))
    if not csvs:
        sys.exit(
            f"No CSV/TSV found in {config.DATA_DIR}. "
            "Export the verbatims from DBeaver into that folder first."
        )
    if len(csvs) > 1:
        print(f"Multiple files found, using the first: {csvs[0].name}")
    return str(csvs[0])


def _normalize(text: str) -> str:
    """Normalized key for dedup: lowercase, strip accents, collapse whitespace."""
    text = unicodedata.normalize("NFKD", text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    text = re.sub(r"\s+", " ", text).strip().lower()
    return text


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--csv", default=None, help="Path to the CSV export (default: first in data/).")
    ap.add_argument("--sep", default=None, help="Field separator (auto-detected by default).")
    ap.add_argument("--demarche", default=None,
                    help="Force the démarche slug (default: derived from product_id, "
                         "e.g. product-3059).")
    args = ap.parse_args()

    path = args.csv or _find_csv()
    sep = args.sep
    if sep is None:
        sep = "\t" if str(path).lower().endswith(".tsv") else ","

    print(f"Reading {path} ...")
    df = pd.read_csv(path, sep=sep, dtype=str, keep_default_na=False, engine="python")
    print(f"  {len(df):,} raw rows, columns: {list(df.columns)}")

    # Locate the verbatim column.
    cols_lower = {c.lower(): c for c in df.columns}
    vcol = next((cols_lower[c] for c in VERBATIM_COLS if c in cols_lower), None)
    if vcol is None:
        sys.exit(f"Could not find a verbatim column among {VERBATIM_COLS}. Got {list(df.columns)}.")

    df = df.rename(columns={vcol: "verbatim"})
    df["verbatim"] = df["verbatim"].astype(str).str.strip()

    # Carry useful covariates if present.
    keep = ["verbatim"]
    for opt in ("review_id", "review_created_at", "product_id", "intention"):
        real = cols_lower.get(opt)
        if real:
            df = df.rename(columns={real: opt})
            keep.append(opt)
    df = df[keep]

    # Length filter.
    before = len(df)
    df = df[df["verbatim"].str.len() >= config.MIN_CHARS]
    print(f"  dropped {before - len(df):,} rows shorter than {config.MIN_CHARS} chars")

    # Truncate pathologically long verbatims before embedding.
    df["verbatim"] = df["verbatim"].str.slice(0, config.MAX_CHARS)

    # De-duplicate on normalized text, keeping a weight.
    df["_norm"] = df["verbatim"].map(_normalize)
    df = df[df["_norm"].str.len() >= config.MIN_CHARS]
    dup_count = df.groupby("_norm")["verbatim"].transform("size")
    df["dup_count"] = dup_count
    df = df.drop_duplicates(subset="_norm", keep="first").drop(columns="_norm")

    df = df.reset_index(drop=True)
    df.insert(0, "row_id", df.index)

    # Route every output of this run into the démarche's own folder. The slug is
    # forced by --demarche, else derived from the CSV's product_id(s).
    slug = args.demarche
    if not slug and "product_id" in df.columns:
        slug = config.slugify_demarche(df["product_id"].unique())
    if not slug:
        slug = config.slugify_demarche([Path(path).stem]) or "demarche"
    config.use_demarche(slug)
    print(f"  démarche = {slug}  ->  cache/{slug}/ + out/{slug}/")

    df.to_parquet(config.CLEAN_PARQUET, index=False)
    total_weight = int(df["dup_count"].sum())
    print(
        f"  -> {len(df):,} unique verbatims (representing {total_weight:,} answers) "
        f"written to {config.CLEAN_PARQUET}"
    )
    print("\nTop 10 most repeated verbatims:")
    for _, r in df.nlargest(10, "dup_count").iterrows():
        print(f"  [{r['dup_count']:>5}x] {r['verbatim'][:70]!r}")


if __name__ == "__main__":
    main()
