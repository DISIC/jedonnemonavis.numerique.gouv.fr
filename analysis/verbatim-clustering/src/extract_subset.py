"""Build a SUBSET dataset (clean_<tag>.parquet + embeddings_<tag>.npy) from the rows of
a previous run that fall in given clusters — by default the noise (cluster == -1).

This enables *recursive / residual clustering*: re-run the whole pipeline on only the
verbatims a first pass left unclustered, so structure hidden under the dominant clusters
can surface (UMAP is recomputed on the subset alone).

The subset's embeddings are SLICED from the full, un-tagged embeddings.npy (no re-embed).
Row ids are renumbered 0..M-1 so the subset is a self-contained dataset.

Usage (the destination tag comes from RUN_TAG):
    $env:RUN_TAG = "noise500"
    uv run python -m src.extract_subset --source clustered_mcs500.parquet
    # then: cluster / name_clusters / consolidate / explore_page (same RUN_TAG)
"""

from __future__ import annotations

import argparse
import sys

import numpy as np
import pandas as pd

from . import config


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--source", default="clustered_mcs500.parquet",
                    help="Clustered parquet (in cache/) to slice rows from.")
    ap.add_argument("--clusters", type=int, nargs="+", default=[-1],
                    help="Cluster ids to keep (default: -1 = noise).")
    args = ap.parse_args()

    if not config.RUN_TAG:
        sys.exit("Set RUN_TAG (e.g. $env:RUN_TAG='noise500') so the subset gets its own files.")

    src = config.CACHE_DIR / args.source
    if not src.exists():
        sys.exit(f"{src} not found.")
    if not config.FULL_EMBEDDINGS_NPY.exists():
        sys.exit(f"{config.FULL_EMBEDDINGS_NPY} not found (the full embeddings to slice from).")

    df = pd.read_parquet(src)
    full_emb = np.load(config.FULL_EMBEDDINGS_NPY)
    if len(df) != len(full_emb):
        sys.exit(f"Row mismatch: {len(df)} rows in {args.source} vs {len(full_emb)} embeddings. "
                 "The source must come from the SAME corpus as embeddings.npy.")

    sub = df[df["cluster"].isin(args.clusters)].copy()
    if sub.empty:
        sys.exit(f"No rows match clusters {args.clusters}.")
    pos = sub["row_id"].to_numpy()          # row_id == positional index into the full embeddings
    sub_emb = full_emb[pos]

    # Renumber to a self-contained 0..M-1 dataset; keep the carried columns the pipeline uses.
    keep = [c for c in ("verbatim", "dup_count", "intention") if c in sub.columns]
    sub = sub[keep].reset_index(drop=True)
    sub.insert(0, "row_id", sub.index)

    sub.to_parquet(config.CLEAN_PARQUET, index=False)
    np.save(config.EMBEDDINGS_NPY, sub_emb.astype(np.float32))

    answers = int(sub["dup_count"].sum()) if "dup_count" in sub else len(sub)
    print(f"Extracted clusters {args.clusters} from {args.source}:")
    print(f"  {len(sub):,} verbatims uniques ({answers:,} réponses)")
    print(f"  -> {config.CLEAN_PARQUET.name}  +  {config.EMBEDDINGS_NPY.name}  (tag '{config.RUN_TAG}')")
    print("Now run, with the SAME RUN_TAG: cluster -> name_clusters -> consolidate -> explore_page")


if __name__ == "__main__":
    main()
