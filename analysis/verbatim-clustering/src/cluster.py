"""Step 3 — discover clusters from embeddings (UMAP -> HDBSCAN) and describe them.

Pipeline:
  1. UMAP reduces the 1024-d embeddings to a low-d space (density clustering is
     unreliable in high dimensions).
  2. HDBSCAN finds variable-density clusters and labels outliers as -1 (noise).
     K is NOT imposed — that is the whole point of "discover from the data".
  3. Per cluster we compute:
       * c-TF-IDF top terms (the discriminative vocabulary of the cluster),
         weighted by dup_count so repeated verbatims keep their real weight;
       * representative verbatims (closest to the cluster centroid in the
         ORIGINAL embedding space).

Outputs:
  * cache/clustered.parquet  (clean + `cluster` column)
  * out/clusters.md          (human-readable: size, top terms, examples)
  * out/scatter.html         (2-D UMAP map, colored by cluster)

Usage:
    uv run python -m src.cluster [--min-cluster-size 200] [--min-samples 10]
                                 [--n-neighbors 15] [--n-components 5]
"""

from __future__ import annotations

import argparse
import sys

import hdbscan
import numpy as np
import pandas as pd
import umap
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.preprocessing import normalize

from . import config


def ctfidf_top_terms(df: pd.DataFrame, labels: np.ndarray, top_n: int = 12) -> dict[int, list[str]]:
    """class-based TF-IDF (BERTopic-style). Returns {cluster: [terms]} for non-noise clusters."""
    vec = CountVectorizer(stop_words=config.FRENCH_STOPWORDS, ngram_range=(1, 2), min_df=3)
    counts = vec.fit_transform(df["verbatim"])  # (n_docs, vocab)
    vocab = np.array(vec.get_feature_names_out())
    weights = df["dup_count"].to_numpy() if "dup_count" in df else np.ones(len(df))

    clusters = sorted(c for c in set(labels) if c != -1)
    # Aggregate weighted term counts per cluster.
    rows = []
    for c in clusters:
        mask = labels == c
        w = weights[mask]
        sub = counts[mask]
        rows.append(np.asarray(sub.multiply(w[:, None]).sum(axis=0)).ravel())
    C = np.vstack(rows) if rows else np.zeros((0, len(vocab)))

    # c-TF-IDF.
    tf = C / np.maximum(C.sum(axis=1, keepdims=True), 1)
    f_t = np.maximum(C.sum(axis=0), 1)              # term total across clusters
    avg = C.sum() / max(len(clusters), 1)           # avg words per cluster
    idf = np.log(1 + avg / f_t)
    ctfidf = tf * idf

    out: dict[int, list[str]] = {}
    for i, c in enumerate(clusters):
        top = np.argsort(ctfidf[i])[::-1][:top_n]
        out[c] = vocab[top].tolist()
    return out


def representative_docs(
    df: pd.DataFrame, embeddings: np.ndarray, labels: np.ndarray, k: int = 8
) -> dict[int, list[str]]:
    """k verbatims closest to each cluster centroid (cosine, original embedding space)."""
    emb = normalize(embeddings)  # cosine == dot on normalized vectors
    out: dict[int, list[str]] = {}
    for c in sorted(set(labels)):
        if c == -1:
            continue
        idx = np.where(labels == c)[0]
        centroid = normalize(emb[idx].mean(axis=0, keepdims=True))
        sims = emb[idx] @ centroid.T
        top_local = idx[np.argsort(sims.ravel())[::-1][:k]]
        out[c] = df.iloc[top_local]["verbatim"].tolist()
    return out


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--min-cluster-size", type=int, default=config.HDBSCAN_MIN_CLUSTER_SIZE)
    ap.add_argument("--min-samples", type=int, default=config.HDBSCAN_MIN_SAMPLES)
    ap.add_argument("--n-neighbors", type=int, default=config.UMAP_N_NEIGHBORS)
    ap.add_argument("--n-components", type=int, default=config.UMAP_N_COMPONENTS)
    args = ap.parse_args()

    if not config.EMBEDDINGS_NPY_READ.exists():
        sys.exit("embeddings missing — run `uv run python -m src.embed` first.")

    df = pd.read_parquet(config.CLEAN_PARQUET_READ)
    embeddings = np.load(config.EMBEDDINGS_NPY_READ)
    if len(df) != len(embeddings):
        sys.exit(f"Row mismatch: {len(df)} verbatims vs {len(embeddings)} embeddings.")
    print(f"Loaded {len(df):,} verbatims / embeddings {embeddings.shape}")

    print("UMAP reduction ...")
    reducer = umap.UMAP(
        n_neighbors=args.n_neighbors,
        n_components=args.n_components,
        min_dist=config.UMAP_MIN_DIST,
        metric=config.UMAP_METRIC,
        random_state=config.RANDOM_STATE,
    )
    reduced = reducer.fit_transform(embeddings)

    print("HDBSCAN clustering ...")
    clusterer = hdbscan.HDBSCAN(
        min_cluster_size=args.min_cluster_size,
        min_samples=args.min_samples,
        metric=config.HDBSCAN_METRIC,
        cluster_selection_method="eom",
    )
    labels = clusterer.fit_predict(reduced)
    df["cluster"] = labels

    n_clusters = len({c for c in labels if c != -1})
    n_noise = int((labels == -1).sum())
    weights = df["dup_count"].to_numpy() if "dup_count" in df else np.ones(len(df))
    noise_weight = int(weights[labels == -1].sum())
    print(
        f"  {n_clusters} clusters, {n_noise:,} noise rows "
        f"({100 * n_noise / len(df):.1f}% of unique, {noise_weight:,} answers)"
    )

    df.to_parquet(config.CLUSTERED_PARQUET, index=False)

    # Describe.
    terms = ctfidf_top_terms(df, labels)
    reps = representative_docs(df, embeddings, labels)

    # Cluster sizes by true answer volume (dup_count weighted).
    sizes = (
        pd.DataFrame({"cluster": labels, "w": weights})
        .groupby("cluster")["w"].sum().astype(int).to_dict()
    )
    ordered = sorted(terms.keys(), key=lambda c: sizes.get(c, 0), reverse=True)
    demarche = config.DEMARCHE or "(démarche)"
    total_answers = int(weights.sum())

    # --- Raw per-cluster CSV: the unfiltered output of clustering, BEFORE any LLM
    #     naming/consolidation. One row per cluster (noise excluded). ---
    raw_rows = []
    for c in ordered:
        ex = reps.get(c, [])
        row = {
            "product_id": demarche,
            "run_tag": config.RUN_TAG or "default",
            "cluster": c,
            "n_answers": sizes.get(c, 0),
            "n_unique": int((labels == c).sum()),
            "pct_answers": round(100 * sizes.get(c, 0) / max(total_answers, 1), 2),
            "top_terms": ", ".join(terms[c]),
        }
        for i in range(8):
            txt = ex[i].replace("\n", " ").strip()[:300] if i < len(ex) else ""
            row[f"example_{i + 1}"] = txt
        raw_rows.append(row)
    pd.DataFrame(raw_rows).to_csv(config.CLUSTERS_RAW_CSV, index=False, encoding="utf-8-sig")
    print(f"  -> raw clusters (pre-LLM) written to {config.CLUSTERS_RAW_CSV}")

    report = config.CLUSTERS_MD
    with report.open("w", encoding="utf-8") as f:
        f.write(f"# Clusters découverts — {demarche}\n\n")
        f.write(
            f"- {len(df):,} verbatims uniques · {n_clusters} clusters · "
            f"{100 * n_noise / len(df):.1f}% bruit\n"
            f"- min_cluster_size={args.min_cluster_size}, min_samples={args.min_samples}, "
            f"UMAP(n_neighbors={args.n_neighbors}, n_components={args.n_components})\n\n"
        )
        for c in ordered:
            f.write(f"## Cluster {c} — {sizes.get(c, 0):,} réponses\n\n")
            f.write(f"**Termes** : {', '.join(terms[c])}\n\n")
            f.write("**Exemples représentatifs** :\n")
            for ex in reps[c]:
                ex = ex.replace("\n", " ").strip()
                f.write(f"- {ex[:200]}\n")
            f.write("\n")
    print(f"  -> report written to {report}")

    _write_scatter(reduced, embeddings, labels, df)


def _write_scatter(reduced, embeddings, labels, df, max_points: int = 30000) -> None:
    """Optional 2-D UMAP map for visual sanity-checking."""
    try:
        import plotly.express as px
    except ImportError:
        return
    n = len(df)
    idx = np.arange(n)
    if n > max_points:
        rng = np.random.default_rng(config.RANDOM_STATE)
        idx = rng.choice(n, size=max_points, replace=False)
    print("2-D UMAP for the scatter plot ...")
    coords2d = umap.UMAP(
        n_neighbors=config.UMAP_N_NEIGHBORS, n_components=2,
        min_dist=0.1, metric="cosine", random_state=config.RANDOM_STATE,
    ).fit_transform(embeddings[idx])
    plot_df = pd.DataFrame({
        "x": coords2d[:, 0], "y": coords2d[:, 1],
        "cluster": labels[idx].astype(str),
        "verbatim": df.iloc[idx]["verbatim"].str.slice(0, 120).values,
    })
    fig = px.scatter(
        plot_df, x="x", y="y", color="cluster", hover_data=["verbatim"],
        title="Carte UMAP des verbatims (couleur = cluster HDBSCAN)", render_mode="webgl",
    )
    out = config.SCATTER_HTML
    fig.write_html(str(out))
    print(f"  -> scatter written to {out}")


if __name__ == "__main__":
    main()
