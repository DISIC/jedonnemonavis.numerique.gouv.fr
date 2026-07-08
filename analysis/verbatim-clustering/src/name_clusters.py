"""Step 4 — name each discovered cluster with Albert (chat, structured output).

For every cluster we feed Albert its top c-TF-IDF terms + representative verbatims
and ask for a candidate {label, description, theme}. The result is a *candidate
catalogue* discovered bottom-up from the data — to be reviewed by a human before
anything is promoted into the production ClassificationCategory table.

A second pass asks Albert to fold the per-cluster labels into a small set of
higher-level themes, reconstructing the 2-level (thème -> problématique) shape the
production catalogue uses — but derived from data, not business knowledge.

Outputs:
  * out/catalog_candidate.csv   (one row per cluster: theme, label, description, terms, examples)

Usage:
    uv run python -m src.name_clusters
"""

from __future__ import annotations

import json
import sys
import time

import httpx
import numpy as np
import pandas as pd

from . import config
from .cluster import ctfidf_top_terms, representative_docs

CHAT_URL = f"{config.ALBERT_BASE_URL}/chat/completions"
MAX_RETRIES = 6

NAME_SCHEMA = {
    "type": "json_schema",
    "json_schema": {
        "name": "cluster_label",
        "strict": True,
        "schema": {
            "type": "object",
            "additionalProperties": False,
            "properties": {
                "label": {"type": "string", "description": "Libellé court de la problématique (max 6 mots)"},
                "description": {"type": "string", "description": "1 phrase décrivant ce que ces verbatims ont en commun"},
                "theme": {"type": "string", "description": "Thème de regroupement de plus haut niveau (2-4 mots)"},
            },
            "required": ["label", "description", "theme"],
        },
    },
}


def _chat_json(client: httpx.Client, system: str, user: str, schema: dict) -> dict:
    """Chat call with backoff on 429/5xx (the chat endpoint is rate-limited ~100/min)."""
    delay = 3.0
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = client.post(CHAT_URL, json={
                "model": config.ALBERT_CHAT_MODEL,
                "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}],
                "temperature": 0,
                "response_format": schema,
            })
        except httpx.TransportError:
            if attempt == MAX_RETRIES:
                raise
            time.sleep(delay * (2 ** (attempt - 1)))
            continue
        if resp.status_code == 429 or resp.status_code >= 500:
            if attempt == MAX_RETRIES:
                resp.raise_for_status()
            time.sleep(delay * (2 ** (attempt - 1)))
            continue
        resp.raise_for_status()
        return json.loads(resp.json()["choices"][0]["message"]["content"])
    raise RuntimeError("unreachable")


SYSTEM = (
    "Tu analyses des regroupements (clusters) de verbatims d'usagers sur une démarche "
    "administrative en ligne. On te donne, pour UN cluster, ses "
    "termes caractéristiques et des exemples représentatifs. Tu dois nommer la problématique "
    "commune à ces verbatims : un libellé court, une description en une phrase, et un thème "
    "de plus haut niveau pour le regrouper. Réponds uniquement via le format structuré."
)


def main() -> None:
    if not config.albert_configured():
        sys.exit("Albert not configured (.env).")
    if config.CONTEXT_ON and not config.DEMARCHE_CONTEXT:
        sys.exit(f"CTX activé mais aucun contexte : crée contexts/{config.DEMARCHE}.txt (blurb factuel).")
    if not config.CLUSTERED_PARQUET.exists():
        sys.exit("cache/clustered.parquet missing — run `uv run python -m src.cluster` first.")
    system = SYSTEM + config.context_block()
    print(f"Contexte démarche : {'ON (_ctx)' if config.CONTEXT_ON and config.DEMARCHE_CONTEXT else 'off'}")

    df = pd.read_parquet(config.CLUSTERED_PARQUET)
    embeddings = np.load(config.EMBEDDINGS_NPY_READ)
    labels = df["cluster"].to_numpy()

    terms = ctfidf_top_terms(df, labels)
    reps = representative_docs(df, embeddings, labels)
    weights = df["dup_count"].to_numpy() if "dup_count" in df else np.ones(len(df))
    sizes = (
        pd.DataFrame({"cluster": labels, "w": weights})
        .groupby("cluster")["w"].sum().astype(int).to_dict()
    )
    clusters = sorted(terms.keys(), key=lambda c: sizes.get(c, 0), reverse=True)

    rows = []
    headers = {"Authorization": f"Bearer {config.ALBERT_API_KEY}"}
    with httpx.Client(headers=headers, timeout=120.0) as client:
        for c in clusters:
            examples = "\n".join(f"- {e.replace(chr(10), ' ')[:200]}" for e in reps[c][:8])
            user = f"Termes caractéristiques : {', '.join(terms[c])}\n\nExemples :\n{examples}"
            try:
                r = _chat_json(client, system, user, NAME_SCHEMA)
            except Exception as e:  # noqa: BLE001 — naming is best-effort
                print(f"cluster {c}: naming failed ({e})")
                r = {"label": "?", "description": "", "theme": "?"}
            rows.append({
                "cluster": c,
                "size": sizes.get(c, 0),
                "theme": r["theme"],
                "label": r["label"],
                "description": r["description"],
                "top_terms": ", ".join(terms[c]),
                "examples": " || ".join(e.replace("\n", " ")[:120] for e in reps[c][:3]),
            })
            print(f"cluster {c} ({sizes.get(c, 0):,}): [{r['theme']}] {r['label']}")

    out = pd.DataFrame(rows).sort_values(["theme", "size"], ascending=[True, False])
    path = config.CATALOG_CANDIDATE_CSV
    out.to_csv(path, index=False, encoding="utf-8-sig")
    print(f"\n-> candidate catalogue written to {path}")
    print(f"   {out['theme'].nunique()} themes, {len(out)} problématiques discovered")


if __name__ == "__main__":
    main()
