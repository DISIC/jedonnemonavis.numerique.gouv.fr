"""Self-contained smoke test of the clustering core (no Albert, no real data).

Builds synthetic embeddings in 3 well-separated blobs + matching fake verbatims,
then exercises UMAP -> HDBSCAN and the description helpers, asserting the pipeline
recovers ~3 clusters. Touches nothing in cache/ or out/.

    uv run python scripts/smoke_test.py
"""

from __future__ import annotations

import sys
from pathlib import Path

import hdbscan
import numpy as np
import pandas as pd
import umap

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from src.cluster import ctfidf_top_terms, representative_docs  # noqa: E402

rng = np.random.default_rng(0)
D, PER = 64, 200
centers = rng.normal(0, 5, size=(3, D))
themes = [
    ("connexion franceconnect impossible erreur", centers[0]),
    ("formulaire trop long compliqué fastidieux", centers[1]),
    ("service rapide simple efficace merci", centers[2]),
]
emb, texts = [], []
for phrase, c in themes:
    emb.append(c + rng.normal(0, 0.5, size=(PER, D)))
    texts += [f"{phrase} variation {i}" for i in range(PER)]
embeddings = np.vstack(emb).astype(np.float32)
df = pd.DataFrame({"verbatim": texts, "dup_count": 1})

reduced = umap.UMAP(n_neighbors=15, n_components=5, min_dist=0.0,
                    metric="cosine", random_state=42).fit_transform(embeddings)
labels = hdbscan.HDBSCAN(min_cluster_size=50, min_samples=10).fit_predict(reduced)

n_clusters = len({c for c in labels if c != -1})
terms = ctfidf_top_terms(df, labels)
reps = representative_docs(df, embeddings, labels)

print(f"recovered {n_clusters} clusters (expected ~3)")
for c in sorted(terms):
    print(f"  cluster {c}: terms={terms[c][:4]} | example={reps[c][0][:50]!r}")

assert n_clusters == 3, f"expected 3 clusters, got {n_clusters}"
assert all(len(terms[c]) > 0 for c in terms), "empty term lists"
print("SMOKE TEST PASSED")
