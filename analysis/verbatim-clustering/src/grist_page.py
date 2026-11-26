"""Build a linked 3-section page in Grist for an already-pushed run (see grist_push.py).

Creates one page (view) with 3 record sections — Themes / Problematiques / Verbatims — and wires
the master-detail linking via the reference columns, so selecting a thème filters its
problématiques, and selecting a problématique filters its verbatims (the manual "Sélectionner
par" / SELECT BY, done through the API's user-actions endpoint).

Assumes Themes_<tag> / Problematiques_<tag> / Verbatims_<tag> already exist with the ref columns
`theme_ref` and `prob_ref` (created by grist_push.py).

Usage:
    $env:DEMARCHE="product-3059"; $env:RUN_TAG="mcs200"
    uv run python -m src.grist_page
"""

from __future__ import annotations

import os
import sys

import httpx

from . import config

BASE = os.getenv("GRIST_BASE_URL", "").rstrip("/")
DOC = os.getenv("GRIST_DOC_ID", "")
KEY = os.getenv("GRIST_API_KEY", "")
API = f"{BASE}/api/docs/{DOC}"


def _client() -> httpx.Client:
    return httpx.Client(headers={"Authorization": f"Bearer {KEY}"}, timeout=120.0)


def _check(resp: httpx.Response) -> dict:
    if resp.status_code >= 300:
        sys.exit(f"Grist API {resp.status_code} on {resp.request.method} {resp.request.url}\n{resp.text[:800]}")
    return resp.json() if resp.content else {}


def _apply(client, actions: list) -> list:
    """POST a list of user actions, return their retValues."""
    return _check(client.post(f"{API}/apply", json=actions)).get("retValues", [])


def main() -> None:
    if not (BASE and DOC and KEY):
        sys.exit("GRIST_BASE_URL / GRIST_DOC_ID / GRIST_API_KEY manquants dans .env.")
    sfx = f"_{config.RUN_TAG}" + ("_ctx" if config.CONTEXT_ON else "")
    t_themes, t_probs, t_verbs = f"Themes{sfx}", f"Problematiques{sfx}", f"Verbatims{sfx}"

    with _client() as client:
        # Table refs (numeric) for the 3 tables.
        tables = {t["id"]: t["fields"]["tableRef"] for t in _check(client.get(f"{API}/tables"))["tables"]}
        for tid in (t_themes, t_probs, t_verbs):
            if tid not in tables:
                sys.exit(f"Table absente : {tid}. Lance d'abord grist_push pour ce tag.")
        ref_themes, ref_probs, ref_verbs = tables[t_themes], tables[t_probs], tables[t_verbs]

        # colRefs of the linking columns (Problematiques.theme_ref, Verbatims.prob_ref).
        cols = _check(client.get(f"{API}/tables/_grist_Tables_column/records"))["records"]
        def col_ref(table_ref: int, col_id: str) -> int:
            for r in cols:
                if r["fields"]["parentId"] == table_ref and r["fields"]["colId"] == col_id:
                    return r["id"]
            sys.exit(f"colonne {col_id} introuvable sur tableRef {table_ref}")
        link_probs_col = col_ref(ref_probs, "theme_ref")   # Problematiques.theme_ref -> Themes
        link_verbs_col = col_ref(ref_verbs, "prob_ref")    # Verbatims.prob_ref -> Problematiques

        # 1) New page (view) + first section (Themes). viewRef=0 -> create a new view.
        rv = _apply(client, [["CreateViewSection", ref_themes, 0, "record", None, None]])
        view_ref = rv[0]["viewRef"]
        sec_themes = rv[0]["sectionRef"]
        print(f"page créée (viewRef={view_ref}), section Themes={sec_themes}")

        # 2) Add the Problematiques and Verbatims sections to that same page.
        rv = _apply(client, [
            ["CreateViewSection", ref_probs, view_ref, "record", None, None],
            ["CreateViewSection", ref_verbs, view_ref, "record", None, None],
        ])
        sec_probs, sec_verbs = rv[0]["sectionRef"], rv[1]["sectionRef"]
        print(f"sections Problematiques={sec_probs}, Verbatims={sec_verbs}")

        # 3) Wire the cascade + name the page.
        #    Filter Problematiques by selected Theme via theme_ref; Verbatims by selected
        #    Problematique via prob_ref. (linkSrcColRef=0 = "the selected row of the source".)
        _apply(client, [
            ["UpdateRecord", "_grist_Views_section", sec_probs,
             {"linkSrcSectionRef": sec_themes, "linkSrcColRef": 0, "linkTargetColRef": link_probs_col}],
            ["UpdateRecord", "_grist_Views_section", sec_verbs,
             {"linkSrcSectionRef": sec_probs, "linkSrcColRef": 0, "linkTargetColRef": link_verbs_col}],
            ["UpdateRecord", "_grist_Views", view_ref, {"name": f"Exploration {config.DEMARCHE} {sfx.lstrip('_')}"}],
        ])
        print("liens posés : Themes -> Problematiques -> Verbatims  +  page renommée")

    print("\nOK — page à 3 sections liées créée. Ouvre Grist : la cascade doit filtrer.")


if __name__ == "__main__":
    main()
