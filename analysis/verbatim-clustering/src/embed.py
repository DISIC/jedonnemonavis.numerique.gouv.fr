"""Step 2 — embed verbatims via the Albert API (openweight-embeddings = bge-m3).

Design goals:
  * Batch  : ~96 texts per request -> ~2000 requests for 200k verbatims.
  * Resume : each batch is checkpointed to cache/emb/{idx}.npy; a re-run skips
             batches already on disk, so a crash/Ctrl-C never re-pays an embedding.
  * Polite : an applicative rate-limiter keeps us under ALBERT_RPM.
  * Retry  : exponential backoff on 429 / 5xx / network errors.

Final artefact: cache/embeddings.npy, shape (N, D) float32, row-aligned with
cache/clean.parquet.

Usage:
    uv run python -m src.embed [--limit 5000]   # --limit for a sample dry-run
"""

from __future__ import annotations

import argparse
import sys
import time

import httpx
import numpy as np
import pandas as pd
from tqdm import tqdm

from . import config

EMBED_URL = f"{config.ALBERT_BASE_URL}/embeddings"
MAX_RETRIES = 6


def _batch_path(idx: int):
    return config.EMB_BATCH_DIR / f"{idx:06d}.npy"


def _parse_embeddings(resp: httpx.Response) -> np.ndarray:
    data = resp.json()["data"]
    # Sort by index defensively (OpenAI-compatible APIs may reorder).
    data = sorted(data, key=lambda d: d.get("index", 0))
    return np.asarray([d["embedding"] for d in data], dtype=np.float32)


def _embed_one_batch(client: httpx.Client, texts: list[str]) -> np.ndarray:
    """Embed a batch, with backoff on transient errors and adaptive splitting on 413.

    413 ("too large") is NOT transient — retrying is pointless. Instead we split the
    batch in half and recurse, which copes with both the input-count cap (64) and any
    total-token limit. A single oversized verbatim is hard-truncated as a last resort.
    """
    delay = 2.0
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = client.post(EMBED_URL, json={"model": config.ALBERT_EMBEDDINGS_MODEL, "input": texts})
        except httpx.TransportError as e:
            if attempt == MAX_RETRIES:
                raise
            wait = delay * (2 ** (attempt - 1))
            tqdm.write(f"  network error ({e}); retry {attempt}/{MAX_RETRIES} in {wait:.0f}s")
            time.sleep(wait)
            continue

        sc = resp.status_code
        if sc == 200:
            return _parse_embeddings(resp)
        if sc == 413:  # payload too large -> split, do not retry
            if len(texts) <= 1:
                tqdm.write(f"  single verbatim too large ({len(texts[0])} chars); truncating")
                resp2 = client.post(
                    EMBED_URL, json={"model": config.ALBERT_EMBEDDINGS_MODEL, "input": [texts[0][:1000]]}
                )
                resp2.raise_for_status()
                return _parse_embeddings(resp2)
            mid = len(texts) // 2
            return np.vstack([_embed_one_batch(client, texts[:mid]), _embed_one_batch(client, texts[mid:])])
        if sc == 429 or sc >= 500:  # transient -> backoff
            if attempt == MAX_RETRIES:
                resp.raise_for_status()
            wait = delay * (2 ** (attempt - 1))
            tqdm.write(f"  HTTP {sc}; retry {attempt}/{MAX_RETRIES} in {wait:.0f}s")
            time.sleep(wait)
            continue
        resp.raise_for_status()  # other 4xx -> fatal
    raise RuntimeError("unreachable")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=None, help="Only embed the first N verbatims (sample run).")
    args = ap.parse_args()

    if not config.albert_configured():
        sys.exit("Albert not configured. Set ALBERT_API_BASE_URL and ALBERT_API_KEY in .env.")
    if not config.CLEAN_PARQUET_READ.exists():
        sys.exit("clean parquet missing — run `uv run python -m src.clean` first.")

    df = pd.read_parquet(config.CLEAN_PARQUET_READ, columns=["row_id", "verbatim"])
    if args.limit:
        df = df.head(args.limit)
    texts = df["verbatim"].tolist()
    n = len(texts)
    bs = config.EMBED_BATCH_SIZE
    n_batches = (n + bs - 1) // bs
    print(f"Embedding {n:,} verbatims in {n_batches:,} batches of {bs} via {config.ALBERT_EMBEDDINGS_MODEL}")

    min_interval = 60.0 / max(config.ALBERT_RPM, 1)
    last_call = 0.0

    headers = {"Authorization": f"Bearer {config.ALBERT_API_KEY}"}
    with httpx.Client(headers=headers, timeout=120.0) as client:
        for b in tqdm(range(n_batches), desc="batches"):
            out = _batch_path(b)
            start, end = b * bs, min((b + 1) * bs, n)
            if out.exists():
                # Resume — but only trust a checkpoint whose size matches this run's
                # batch boundary (a cached partial batch from a `--limit` run is stale).
                if np.load(out).shape[0] == (end - start):
                    continue
                tqdm.write(f"  batch {b}: stale checkpoint ({np.load(out).shape[0]} != {end - start}), recomputing")
            # Rate limit.
            elapsed = time.monotonic() - last_call
            if elapsed < min_interval:
                time.sleep(min_interval - elapsed)
            last_call = time.monotonic()

            emb = _embed_one_batch(client, texts[start:end])
            if emb.shape[0] != (end - start):
                sys.exit(f"Batch {b}: expected {end - start} vectors, got {emb.shape[0]}.")
            np.save(out, emb)

    # Assemble in order.
    print("Assembling embeddings.npy ...")
    parts = [np.load(_batch_path(b)) for b in range(n_batches)]
    embeddings = np.concatenate(parts, axis=0)
    if embeddings.shape[0] != n:
        sys.exit(f"Assembled {embeddings.shape[0]} vectors but expected {n}.")
    np.save(config.EMBEDDINGS_NPY, embeddings)
    print(f"  -> {embeddings.shape} float32 written to {config.EMBEDDINGS_NPY}")


if __name__ == "__main__":
    main()
