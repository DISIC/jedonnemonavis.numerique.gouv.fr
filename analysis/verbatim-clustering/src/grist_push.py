"""Push a démarche's 3 Grist CSVs (themes / problématiques / verbatims) into a Grist doc
as 3 linked tables, via the Grist REST API.

Creates `Themes_<tag>`, `Problematiques_<tag>`, `Verbatims_<tag>`, pushes the rows, and wires
the two relations as real **Reference** columns:
  * Problematiques.Theme        -> Ref:Themes_<tag>          (matched on theme_code)
  * Verbatims.Problematique     -> Ref:Problematiques_<tag>  (matched on cluster)

The reference VALUE is the target rowId, resolved here (Grist Ref columns store rowIds, not the
business key). The human-readable text columns (theme_label, label, problematique…) are kept too,
so sections stay readable without display-column gymnastics.

Reads GRIST_BASE_URL / GRIST_DOC_ID / GRIST_API_KEY from .env, and the CSV paths from config
(so DEMARCHE / RUN_TAG / CTX select which run is pushed — same env as the rest of the pipeline).

Usage:
    $env:DEMARCHE="product-3059"; $env:RUN_TAG="mcs200"
    uv run python -m src.grist_push                 # tables + data + references
    uv run python -m src.grist_push --replace       # delete the 3 target tables first if present
"""

from __future__ import annotations

import argparse
import math
import os
import sys

import httpx
import numpy as np
import pandas as pd

from . import config

BASE = os.getenv("GRIST_BASE_URL", "").rstrip("/")
DOC = os.getenv("GRIST_DOC_ID", "")
KEY = os.getenv("GRIST_API_KEY", "")
API = f"{BASE}/api/docs/{DOC}"
BATCH = 500  # records per POST (Grist caps request body size; verbatims carry long text)


def _client() -> httpx.Client:
    return httpx.Client(headers={"Authorization": f"Bearer {KEY}"}, timeout=120.0)


def _check(resp: httpx.Response) -> dict:
    if resp.status_code >= 300:
        sys.exit(f"Grist API {resp.status_code} on {resp.request.method} {resp.request.url}\n{resp.text[:800]}")
    return resp.json() if resp.content else {}


def _tag_suffix() -> str:
    return f"_{config.RUN_TAG}" + ("_ctx" if config.CONTEXT_ON else "")


# Column schemas (plain types). Reference columns are added separately, once targets exist.
COLS = {
    "themes": [
        ("theme_code", "Text"), ("theme_label", "Text"), ("theme_description", "Text"),
        ("nb_problematiques", "Int"), ("nb_reponses", "Int"), ("nb_verbatims_uniques", "Int"),
    ],
    "problematiques": [
        ("cluster", "Int"), ("theme_code", "Text"), ("label", "Text"), ("description", "Text"),
        ("top_terms", "Text"), ("nb_reponses", "Int"), ("nb_verbatims_uniques", "Int"),
    ],
    "verbatims": [
        ("cluster", "Int"), ("theme_code", "Text"), ("theme_label", "Text"),
        ("problematique", "Text"), ("verbatim", "Text"), ("dup_count", "Int"),
        ("intention", "Text"), ("representativite", "Numeric"), ("rang", "Int"),
    ],
}


def _clean(v):
    """Scalar -> JSON-safe python value (NaN/NaT -> None, numpy scalars -> native)."""
    if v is None:
        return None
    if isinstance(v, float) and math.isnan(v):
        return None
    if isinstance(v, np.floating):
        return None if np.isnan(v) else float(v)
    if isinstance(v, np.integer):
        return int(v)
    if isinstance(v, np.bool_):
        return bool(v)
    return v


def _records(df: pd.DataFrame, cols: list[str], extra=None) -> list[dict]:
    """DataFrame -> Grist records (JSON-safe). `extra(rec)` may add fields (e.g. Ref rowIds)."""
    present = [c for c in cols if c in df.columns]
    out = []
    for rec in df[present].to_dict(orient="records"):
        fields = {k: _clean(v) for k, v in rec.items()}
        if extra:
            fields.update({k: _clean(v) for k, v in extra(rec).items()})
        out.append({"fields": fields})
    return out


def _create_table(client, table_id: str, schema: list[tuple]) -> None:
    payload = {"tables": [{"id": table_id, "columns": [
        {"id": cid, "fields": {"label": cid, "type": ctype}} for cid, ctype in schema
    ]}]}
    _check(client.post(f"{API}/tables", json=payload))
    print(f"  table créée : {table_id}")


def _add_ref_column(client, table_id: str, col_id: str, target_table: str) -> None:
    payload = {"columns": [{"id": col_id, "fields": {"label": col_id, "type": f"Ref:{target_table}"}}]}
    _check(client.post(f"{API}/tables/{table_id}/columns", json=payload))
    print(f"  colonne Reference : {table_id}.{col_id} -> {target_table}")


def _push(client, table_id: str, records: list[dict]) -> None:
    for i in range(0, len(records), BATCH):
        chunk = records[i:i + BATCH]
        _check(client.post(f"{API}/tables/{table_id}/records", json={"records": chunk}))
        print(f"    {table_id}: +{len(chunk)} ({min(i + BATCH, len(records))}/{len(records)})")


def _rowid_map(client, table_id: str, key_col: str) -> dict:
    """Map {key_col value -> rowId} for an already-populated table."""
    data = _check(client.get(f"{API}/tables/{table_id}/records"))
    return {r["fields"][key_col]: r["id"] for r in data["records"]}


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--replace", action="store_true", help="Delete the 3 target tables first if present.")
    args = ap.parse_args()

    if not (BASE and DOC and KEY):
        sys.exit("GRIST_BASE_URL / GRIST_DOC_ID / GRIST_API_KEY manquants dans .env.")
    for p in (config.GRIST_THEMES_CSV, config.GRIST_PROBLEMATIQUES_CSV, config.GRIST_VERBATIMS_CSV):
        if not p.exists():
            sys.exit(f"CSV manquant : {p} — lance d'abord explore_page pour ce tag.")

    sfx = _tag_suffix()
    t_themes, t_probs, t_verbs = f"Themes{sfx}", f"Problematiques{sfx}", f"Verbatims{sfx}"
    print(f"Doc {DOC} — push {config.DEMARCHE} / tag '{config.RUN_TAG}{'_ctx' if config.CONTEXT_ON else ''}'")
    print(f"  tables cibles : {t_themes}, {t_probs}, {t_verbs}")

    themes = pd.read_csv(config.GRIST_THEMES_CSV)
    probs = pd.read_csv(config.GRIST_PROBLEMATIQUES_CSV)
    verbs = pd.read_csv(config.GRIST_VERBATIMS_CSV)

    with _client() as client:
        existing = {t["id"] for t in _check(client.get(f"{API}/tables"))["tables"]}
        clash = {t_themes, t_probs, t_verbs} & existing
        if clash and not args.replace:
            sys.exit(f"Tables déjà présentes : {clash}. Relance avec --replace pour les recréer.")
        if clash and args.replace:
            for tid in clash:
                _check(client.post(f"{API}/apply", json=[["RemoveTable", tid]]))
                print(f"  table supprimée : {tid}")

        # 1) Themes -> push -> rowId map (theme_code -> id)
        _create_table(client, t_themes, COLS["themes"])
        _push(client, t_themes, _records(themes, [c for c, _ in COLS["themes"]]))
        theme_id = _rowid_map(client, t_themes, "theme_code")

        # 2) Problematiques (+ Theme Ref) -> push with Theme=rowId -> rowId map (cluster -> id)
        _create_table(client, t_probs, COLS["problematiques"])
        _add_ref_column(client, t_probs, "theme_ref", t_themes)
        prob_recs = _records(probs, [c for c, _ in COLS["problematiques"]],
                             extra=lambda r: {"theme_ref": theme_id.get(r["theme_code"])})
        _push(client, t_probs, prob_recs)
        prob_id = _rowid_map(client, t_probs, "cluster")

        # 3) Verbatims (+ prob_ref Ref) -> push with prob_ref=rowId
        _create_table(client, t_verbs, COLS["verbatims"])
        _add_ref_column(client, t_verbs, "prob_ref", t_probs)
        verb_recs = _records(verbs, [c for c, _ in COLS["verbatims"]],
                             extra=lambda r: {"prob_ref": prob_id.get(int(r["cluster"]))})
        _push(client, t_verbs, verb_recs)

    print(f"\nOK — {len(themes)} thèmes, {len(probs)} problématiques, {len(verbs):,} verbatims poussés.")
    print(f"   Références : {t_probs}.theme_ref -> {t_themes} · {t_verbs}.prob_ref -> {t_probs}")
    print("   (Étape suivante : page à 3 sections liées.)")


if __name__ == "__main__":
    main()
