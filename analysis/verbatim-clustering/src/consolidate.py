"""Step 5 — consolidate the 28 per-cluster labels into a clean 2-level taxonomy.

Problem with name_clusters.py: each cluster was named in isolation, so the level-1
"theme" came out fragmented (~26 themes for 28 clusters, with near-duplicates) and the
positive/satisfaction signal split across several clusters.

Fix, in two LLM passes:
  1. Show Albert ALL cluster (label + description) at once -> it proposes ~8-10 coherent
     parent themes (code + label + description), de-duplicating and harmonising.
  2. Assign each cluster to one of those theme codes via an enum-constrained call, so the
     assignment is always valid and every cluster is covered exactly once.

Inputs : out/catalog_candidate.csv (from name_clusters.py)
Outputs: out/catalog_2level.csv   (cluster, theme_code, theme_label, problematique, ...)
         out/catalog_2level.md    (themes with nested problématiques + sizes)

Usage:
    uv run python -m src.consolidate [--min-themes 8] [--max-themes 10]
"""

from __future__ import annotations

import argparse
import json
import sys
import time

import httpx
import pandas as pd

from . import config

CHAT_URL = f"{config.ALBERT_BASE_URL}/chat/completions"
MAX_RETRIES = 6


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


def propose_themes(client: httpx.Client, rows: pd.DataFrame, lo: int, hi: int) -> list[dict]:
    schema = {
        "type": "json_schema",
        "json_schema": {
            "name": "theme_taxonomy", "strict": True,
            "schema": {
                "type": "object", "additionalProperties": False,
                "properties": {"themes": {
                    "type": "array",
                    "items": {
                        "type": "object", "additionalProperties": False,
                        "properties": {
                            "code": {"type": "string", "description": "identifiant stable snake_case, ex. acces_authentification"},
                            "label": {"type": "string", "description": "libellé court du thème"},
                            "description": {"type": "string", "description": "1 phrase: ce que le thème regroupe"},
                        },
                        "required": ["code", "label", "description"],
                    },
                }},
                "required": ["themes"],
            },
        },
    }
    system = (
        "Tu es analyste de la voix de l'usager sur les démarches administratives en ligne. "
        f"On te donne une liste de problématiques découvertes (par clustering) sur une démarche "
        f"administrative en ligne. Regroupe-les en {lo} à {hi} THÈMES parents cohérents, "
        "non redondants et de granularité homogène. Fusionne les quasi-doublons (toutes les "
        "variantes de satisfaction sous UN thème, toutes les variantes de complexité/clarté "
        "regroupées logiquement, etc.). Codes en snake_case, stables et explicites. Réponds "
        "uniquement via le format structuré."
    )
    system += config.context_block()
    listing = "\n".join(
        f"- [{int(r.size)} réponses] {r.label} : {r.description}" for r in rows.itertuples()
    )
    out = _chat_json(client, system, f"Problématiques à regrouper :\n{listing}", schema)
    return out["themes"]


def assign_theme(client: httpx.Client, row, themes: list[dict]) -> str:
    codes = [t["code"] for t in themes]
    schema = {
        "type": "json_schema",
        "json_schema": {
            "name": "theme_assignment", "strict": True,
            "schema": {
                "type": "object", "additionalProperties": False,
                "properties": {"theme_code": {"type": "string", "enum": codes}},
                "required": ["theme_code"],
            },
        },
    }
    theme_block = "\n".join(f"- {t['code']} : {t['label']} — {t['description']}" for t in themes)
    system = (
        "Tu ranges une problématique dans EXACTEMENT un des thèmes proposés, en renvoyant son "
        "code. Réponds uniquement via le format structuré."
    )
    system += config.context_block()
    user = (
        f"Thèmes disponibles :\n{theme_block}\n\n"
        f"Problématique à ranger :\n{row.label} : {row.description}\n"
        f"(mots-clés : {row.top_terms})"
    )
    return _chat_json(client, system, user, schema)["theme_code"]


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--min-themes", type=int, default=8)
    ap.add_argument("--max-themes", type=int, default=10)
    args = ap.parse_args()

    if not config.albert_configured():
        sys.exit("Albert not configured (.env).")
    if config.CONTEXT_ON and not config.DEMARCHE_CONTEXT:
        sys.exit(f"CTX activé mais aucun contexte : crée contexts/{config.DEMARCHE}.txt (blurb factuel).")
    print(f"Contexte démarche : {'ON (_ctx)' if config.CONTEXT_ON and config.DEMARCHE_CONTEXT else 'off'}")
    candidate = config.CATALOG_CANDIDATE_CSV
    if not candidate.exists():
        sys.exit(f"{candidate} missing — run `python -m src.name_clusters` first.")

    rows = pd.read_csv(candidate)
    print(f"{len(rows)} clusters loaded from {candidate.name}")

    headers = {"Authorization": f"Bearer {config.ALBERT_API_KEY}"}
    with httpx.Client(headers=headers, timeout=120.0) as client:
        print("Pass 1 — proposing parent themes ...")
        themes = propose_themes(client, rows, args.min_themes, args.max_themes)
        print(f"  -> {len(themes)} themes proposed:")
        for t in themes:
            print(f"     [{t['code']}] {t['label']}")

        print("Pass 2 — assigning each cluster to a theme ...")
        theme_by_code = {t["code"]: t for t in themes}
        assignments = []
        for r in rows.itertuples():
            code = assign_theme(client, r, themes)
            assignments.append(code)
            print(f"  cluster {r.cluster} ({int(r.size):,}) -> {code}")
    rows["theme_code"] = assignments
    rows["theme_label"] = rows["theme_code"].map(lambda c: theme_by_code[c]["label"])
    rows["theme_description"] = rows["theme_code"].map(lambda c: theme_by_code[c]["description"])

    # --- CSV (one row per cluster/problématique) ---
    out_cols = ["theme_code", "theme_label", "theme_description",
                "cluster", "size", "label", "description", "top_terms"]
    out_csv = config.CATALOG_2LEVEL_CSV
    rows.sort_values(["theme_code", "size"], ascending=[True, False])[out_cols].to_csv(
        out_csv, index=False, encoding="utf-8-sig"
    )

    # --- Markdown (themes -> nested problématiques) ---
    theme_size = rows.groupby("theme_code")["size"].sum().to_dict()
    order = sorted(theme_by_code, key=lambda c: theme_size.get(c, 0), reverse=True)
    out_md = config.CATALOG_2LEVEL_MD
    with out_md.open("w", encoding="utf-8") as f:
        f.write(f"# Taxonomie 2 niveaux découverte ({config.DEMARCHE or 'démarche'})\n\n")
        f.write(f"{len(themes)} thèmes · {len(rows)} problématiques · "
                f"{int(rows['size'].sum()):,} réponses classées\n\n")
        for code in order:
            t = theme_by_code[code]
            f.write(f"## {t['label']}  \n")
            f.write(f"`{code}` — {t['description']} · **{int(theme_size.get(code, 0)):,} réponses**\n\n")
            sub = rows[rows["theme_code"] == code].sort_values("size", ascending=False)
            for r in sub.itertuples():
                f.write(f"- **{r.label}** ({int(r.size):,}) — {r.description}\n")
            f.write("\n")
    print(f"\n-> {out_csv}\n-> {out_md}")
    print(f"   {len(themes)} thèmes pour {len(rows)} problématiques "
          f"(avant : {rows['theme_code'].nunique()} effectifs)")


if __name__ == "__main__":
    main()
