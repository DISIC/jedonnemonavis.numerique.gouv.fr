"""Pousse les assignations avis-par-avis (facettes) dans une table Grist unique.

Crée `Assignments_<tag>` et y pousse un enregistrement par avis. Les 3 axes sont typés pour
que **Grist offre nativement le filtrage et l'affichage en pastilles**, sans widget custom :
  * objets       -> ChoiceList (multi-valeur : libellés d'objets)
  * thematiques  -> ChoiceList (multi-valeur : libellés de thématiques site)
  * polarite     -> Choice     (positif / negatif / neutre, avec couleurs)

Les libellés (plutôt que les codes) sont stockés pour rester lisibles dans la grille Grist.
Lit GRIST_BASE_URL / GRIST_DOC_ID / GRIST_API_KEY depuis .env, et les CSV via config
(DEMARCHE / RUN_TAG / CTX sélectionnent le run).

Usage:
    DEMARCHE=product-3059 RUN_TAG=mcs200 uv run python -m src.grist_push_assignments
    ... --replace         # supprime d'abord la table cible si présente
"""

from __future__ import annotations

import argparse
import json
import os
import sys

import httpx
import pandas as pd

from . import config

BASE = os.getenv("GRIST_BASE_URL", "").rstrip("/")
DOC = os.getenv("GRIST_DOC_ID", "")
KEY = os.getenv("GRIST_API_KEY", "")
API = f"{BASE}/api/docs/{DOC}"
BATCH = 500

POL_COLORS = {
    "positif": {"fillColor": "#18753C", "textColor": "#FFFFFF"},
    "negatif": {"fillColor": "#CE0500", "textColor": "#FFFFFF"},
    "neutre": {"fillColor": "#666666", "textColor": "#FFFFFF"},
}


def _client() -> httpx.Client:
    return httpx.Client(headers={"Authorization": f"Bearer {KEY}"}, timeout=120.0)


def _check(resp: httpx.Response) -> dict:
    if resp.status_code >= 300:
        sys.exit(f"Grist API {resp.status_code} on {resp.request.method} {resp.request.url}\n{resp.text[:800]}")
    return resp.json() if resp.content else {}


def _tag_suffix() -> str:
    return f"_{config.RUN_TAG}" + ("_ctx" if config.CONTEXT_ON else "")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--replace", action="store_true", help="Supprime la table cible si présente.")
    args = ap.parse_args()

    if not (BASE and DOC and KEY):
        sys.exit("GRIST_BASE_URL / GRIST_DOC_ID / GRIST_API_KEY manquants dans .env.")
    assign_csv = config.OUT_DIR / f"assignments{_tag_suffix()}.csv"
    if not assign_csv.exists():
        sys.exit(f"{assign_csv} introuvable — lance d'abord `python -m src.assign_facets`.")
    if not config.FACETS_CSV.exists():
        sys.exit(f"{config.FACETS_CSV} introuvable — lance d'abord `python -m src.extract_facets`.")

    fac = pd.read_csv(config.FACETS_CSV)
    obj_label = dict(zip(fac[fac.axe == "objet"].code, fac[fac.axe == "objet"].label))
    th_label = dict(zip(fac[fac.axe == "thematique_site"].code, fac[fac.axe == "thematique_site"].label))
    obj_choices = list(obj_label.values())
    th_choices = list(th_label.values())

    df = pd.read_csv(assign_csv).fillna("")
    table = f"Assignments{_tag_suffix()}"
    print(f"Doc {DOC} — push {len(df)} avis -> table {table}")

    def _list(codes_str: str, mapping: dict) -> list:
        # ChoiceList Grist = ["L", val1, val2, ...] ; libellés lisibles.
        labels = [mapping.get(c, c) for c in str(codes_str).split() if c]
        return ["L", *labels]

    columns = [
        {"id": "verbatim", "fields": {"label": "Verbatim", "type": "Text"}},
        {"id": "dup_count", "fields": {"label": "Occurrences", "type": "Int"}},
        {"id": "polarite", "fields": {"label": "Polarité", "type": "Choice",
            "widgetOptions": json.dumps({"choices": list(POL_COLORS), "choiceOptions": POL_COLORS})}},
        {"id": "objets", "fields": {"label": "Objets", "type": "ChoiceList",
            "widgetOptions": json.dumps({"choices": obj_choices})}},
        {"id": "thematiques", "fields": {"label": "Thématiques site", "type": "ChoiceList",
            "widgetOptions": json.dumps({"choices": th_choices})}},
    ]
    records = [{"fields": {
        "verbatim": str(r.verbatim),
        "dup_count": int(r.dup_count) if str(r.dup_count).isdigit() else 1,
        "polarite": str(r.polarite),
        "objets": _list(r.objets, obj_label),
        "thematiques": _list(r.thematiques, th_label),
    }} for r in df.itertuples()]

    with _client() as client:
        existing = {t["id"] for t in _check(client.get(f"{API}/tables"))["tables"]}
        if table in existing:
            if not args.replace:
                sys.exit(f"Table {table} déjà présente. Relance avec --replace pour la recréer.")
            _check(client.post(f"{API}/apply", json=[["RemoveTable", table]]))
            print(f"  table supprimée : {table}")
        _check(client.post(f"{API}/tables", json={"tables": [{"id": table, "columns": columns}]}))
        print(f"  table créée : {table}")
        for i in range(0, len(records), BATCH):
            chunk = records[i:i + BATCH]
            _check(client.post(f"{API}/tables/{table}/records", json={"records": chunk}))
            print(f"    +{len(chunk)} ({min(i + BATCH, len(records))}/{len(records)})")

    print(f"\nOK — {len(records)} avis poussés dans {table}.")
    print(f"   Grist : filtre/pastilles natifs sur Polarité (Choice) + Objets/Thématiques (ChoiceList).")
    print(f"   Doc : {BASE}/o/{os.getenv('GRIST_ORG','')}/{DOC}")


if __name__ == "__main__":
    main()
