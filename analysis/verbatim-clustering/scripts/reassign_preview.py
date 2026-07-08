"""Preview noise -> nearest-cluster reassignment at several thresholds (READ-ONLY).

For each noise verbatim, compute its cosine similarity to the nearest cluster centroid.
Report, per threshold, how many would be rescued (unique + answer-weighted) and the
resulting noise rate, plus examples (rescued / staying noise) to judge quality.

    uv run python scripts/reassign_preview.py
"""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.preprocessing import normalize

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from src import config  # noqa: E402

df = pd.read_parquet(config.CLUSTERED_PARQUET)
emb = normalize(np.load(config.EMBEDDINGS_NPY_READ))
labels = df["cluster"].to_numpy()
weights = df["dup_count"].to_numpy()

cat = pd.read_csv(config.CATALOG_2LEVEL_CSV)
label_of = {int(r.cluster): r.label for r in cat.itertuples()}

clusters = sorted(c for c in set(labels) if c != -1)
C = np.vstack([normalize(emb[labels == c].mean(axis=0, keepdims=True)) for c in clusters])

noise_mask = labels == -1
nidx = np.where(noise_mask)[0]
sims = emb[nidx] @ C.T                      # (n_noise, n_clusters)
best = sims.max(axis=1)
best_cluster = np.array(clusters)[sims.argmax(axis=1)]

total_unique = len(df)
total_answers = int(weights.sum())
noise_unique = len(nidx)
noise_answers = int(weights[noise_mask].sum())
print(f"État actuel : {noise_unique:,} verbatims uniques en bruit "
      f"({100*noise_unique/total_unique:.1f}%) = {noise_answers:,} réponses "
      f"({100*noise_answers/total_answers:.1f}%)\n")

print(f"{'seuil':>6} | {'récup. uniques':>16} | {'récup. réponses':>16} | {'bruit restant (rép.)':>22}")
print("-" * 70)
for thr in (0.45, 0.55, 0.65):
    resc = best >= thr
    ru = int(resc.sum())
    ra = int(weights[nidx][resc].sum())
    rem = noise_answers - ra
    print(f"{thr:>6.2f} | {ru:>7,} ({100*ru/noise_unique:>4.1f}%) | "
          f"{ra:>7,} ({100*ra/noise_answers:>4.1f}%) | {rem:>10,} "
          f"({100*rem/total_answers:>4.1f}% du total)")

print("\n--- Exemples RÉCUPÉRÉS au seuil 0,55 (top par fréquence) ---")
nd = pd.DataFrame({"t": df.iloc[nidx]["verbatim"].values, "n": weights[nidx],
                   "sim": best, "to": best_cluster})
resc = nd[nd["sim"] >= 0.55].sort_values("n", ascending=False).head(25)
for r in resc.itertuples():
    print(f"  ×{int(r.n):>4} [{r.sim:.2f} -> {label_of.get(int(r.to), r.to)[:40]}]  {r.t[:60]!r}")

print("\n--- Exemples qui RESTENT en bruit au seuil 0,55 (top par fréquence) ---")
stay = nd[nd["sim"] < 0.55].sort_values("n", ascending=False).head(25)
for r in stay.itertuples():
    print(f"  ×{int(r.n):>4} [{r.sim:.2f}]  {r.t[:60]!r}")
