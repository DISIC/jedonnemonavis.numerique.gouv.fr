"""Sweep HDBSCAN min_samples (the real noise knob) at a fixed min_cluster_size.

Lower min_samples = HDBSCAN is less conservative = fewer points labelled noise
(border points get absorbed into clusters by density, not by blunt cosine). UMAP is
computed once. READ-ONLY: reports only, writes nothing.

    uv run python scripts/minsamples_sweep.py [--mcs 200] [--samples 1 3 5 10]
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

import hdbscan
import numpy as np
import pandas as pd
import umap

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from src import config  # noqa: E402

ap = argparse.ArgumentParser()
ap.add_argument("--mcs", type=int, default=200)
ap.add_argument("--samples", type=int, nargs="+", default=[1, 3, 5, 10])
args = ap.parse_args()

df = pd.read_parquet(config.CLEAN_PARQUET_READ)
emb = np.load(config.EMBEDDINGS_NPY_READ)
weights = df["dup_count"].to_numpy()
total_answers = int(weights.sum())
print(f"{len(df):,} verbatims · {total_answers:,} réponses · mcs={args.mcs}\n")

print("UMAP (once) ...")
reduced = umap.UMAP(
    n_neighbors=config.UMAP_N_NEIGHBORS, n_components=config.UMAP_N_COMPONENTS,
    min_dist=config.UMAP_MIN_DIST, metric=config.UMAP_METRIC,
    random_state=config.RANDOM_STATE,
).fit_transform(emb)

print(f"\n{'min_samples':>11} | {'clusters':>8} | {'bruit uniques':>14} | {'bruit réponses':>16}")
print("-" * 60)
for ms in args.samples:
    labels = hdbscan.HDBSCAN(
        min_cluster_size=args.mcs, min_samples=ms,
        metric=config.HDBSCAN_METRIC, cluster_selection_method="eom",
    ).fit_predict(reduced)
    n_clusters = len({c for c in labels if c != -1})
    nu = int((labels == -1).sum())
    na = int(weights[labels == -1].sum())
    print(f"{ms:>11} | {n_clusters:>8} | {nu:>6,} ({100*nu/len(df):>4.1f}%) | "
          f"{na:>7,} ({100*na/total_answers:>4.1f}%)")
