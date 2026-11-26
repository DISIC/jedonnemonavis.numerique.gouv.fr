"""Sweep HDBSCAN granularity (min_cluster_size) in one pass.

UMAP is identical across the sweep, so we reduce ONCE then run HDBSCAN for each
min_cluster_size. Produces out/clusters_mcsXXX.md per setting + out/sweep_summary.md.

    uv run python scripts/sweep.py [--sizes 500 200 100]
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
from src.cluster import ctfidf_top_terms, representative_docs  # noqa: E402


def write_report(path, title, df, labels, terms, reps, sizes, params):
    n_noise = int((labels == -1).sum())
    ordered = sorted(terms.keys(), key=lambda c: sizes.get(c, 0), reverse=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(f"# {title}\n\n{params}\n\n")
        f.write(f"- {len(df):,} verbatims uniques · {len(terms)} clusters · "
                f"{100 * n_noise / len(df):.1f}% bruit\n\n")
        for c in ordered:
            f.write(f"## Cluster {c} — {sizes.get(c, 0):,} réponses\n\n")
            f.write(f"**Termes** : {', '.join(terms[c])}\n\n")
            for ex in reps[c]:
                f.write(f"- {ex.replace(chr(10), ' ').strip()[:200]}\n")
            f.write("\n")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sizes", type=int, nargs="+", default=[500, 200, 100])
    args = ap.parse_args()

    df = pd.read_parquet(config.CLEAN_PARQUET_READ)
    embeddings = np.load(config.EMBEDDINGS_NPY_READ)
    weights = df["dup_count"].to_numpy() if "dup_count" in df else np.ones(len(df))
    print(f"{len(df):,} verbatims / {embeddings.shape} embeddings")

    print("UMAP (once) ...")
    reduced = umap.UMAP(
        n_neighbors=config.UMAP_N_NEIGHBORS, n_components=config.UMAP_N_COMPONENTS,
        min_dist=config.UMAP_MIN_DIST, metric=config.UMAP_METRIC,
        random_state=config.RANDOM_STATE,
    ).fit_transform(embeddings)

    summary = []
    for mcs in args.sizes:
        ms = config.HDBSCAN_MIN_SAMPLES
        print(f"\nHDBSCAN min_cluster_size={mcs} ...")
        labels = hdbscan.HDBSCAN(
            min_cluster_size=mcs, min_samples=ms,
            metric=config.HDBSCAN_METRIC, cluster_selection_method="eom",
        ).fit_predict(reduced)
        n_clusters = len({c for c in labels if c != -1})
        n_noise = int((labels == -1).sum())
        noise_w = int(weights[labels == -1].sum())
        print(f"  -> {n_clusters} clusters, {100*n_noise/len(df):.1f}% bruit ({noise_w:,} réponses)")

        terms = ctfidf_top_terms(df, labels)
        reps = representative_docs(df, embeddings, labels)
        sizes = (pd.DataFrame({"c": labels, "w": weights})
                 .groupby("c")["w"].sum().astype(int).to_dict())
        params = f"min_cluster_size={mcs}, min_samples={ms}, UMAP(n_neighbors={config.UMAP_N_NEIGHBORS}, n_components={config.UMAP_N_COMPONENTS})"
        out = config.OUT_DIR / f"clusters_mcs{mcs}.md"
        write_report(out, f"Clusters — mcs={mcs} ({config.DEMARCHE or 'démarche'})", df, labels, terms, reps, sizes, params)
        print(f"  -> {out.name}")
        summary.append((mcs, n_clusters, 100*n_noise/len(df), noise_w))

    sm = config.OUT_DIR / "sweep_summary.md"
    with open(sm, "w", encoding="utf-8") as f:
        f.write("# Synthèse du balayage de granularité\n\n")
        f.write("| min_cluster_size | nb clusters | % bruit (uniques) | réponses en bruit |\n")
        f.write("|---|---|---|---|\n")
        for mcs, nc, noise_pct, noise_w in summary:
            f.write(f"| {mcs} | {nc} | {noise_pct:.1f}% | {noise_w:,} |\n")
    print(f"\n-> summary written to {sm}")


if __name__ == "__main__":
    main()
