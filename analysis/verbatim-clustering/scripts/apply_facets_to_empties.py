"""Re-passe v3 UNIQUEMENT les avis dont la thématique site est VIDE, dans assignments_<tag>.csv.

Motivation (retour PO, 2026-10) : la passe initiale laissait parfois la thématique vide alors
qu'une difficulté était exprimée (surtout la complexité globale). On re-juge donc les seules
lignes vides avec le prompt v3 (cf. src.assign_facets.build_system + src.extract_facets qui seede
`complexite_charge`), sans toucher aux lignes déjà taguées.

Résumable : une colonne `repass_v3` marque les lignes déjà re-jugées (y compris celles qui restent
légitimement vides = hors-outil), donc une relance ne les reprend pas. Incrémental et quota-safe
(arrêt propre sur quota journalier Albert ; sauvegarde toutes les 25 lignes).

STAT affichée à chaque run : combien de vides ont REÇU une thématique (vs restés vides = hors-outil).

Usage:
    DEMARCHE=product-3059 RUN_TAG=mcs200 N=100 ASSIGN_RPM=30 \
        ALBERT_CHAT_MODEL=openweight-medium uv run python scripts/apply_facets_to_empties.py
"""
from __future__ import annotations

import os
import sys
import time
from pathlib import Path

import httpx
import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from src import config  # noqa: E402
from src.assign_facets import QuotaExceeded, _assign_schema, _chat_json, _sfx, build_system  # noqa: E402


def main() -> None:
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):
        pass
    if not config.albert_configured():
        sys.exit("Albert not configured (.env).")
    if not config.FACETS_CSV.exists():
        sys.exit(f"{config.FACETS_CSV} introuvable — lance d'abord `python -m src.extract_facets`.")
    assign_csv = config.OUT_DIR / f"assignments{_sfx()}.csv"
    if not assign_csv.exists():
        sys.exit(f"{assign_csv} introuvable — lance d'abord `python -m src.assign_facets`.")

    fac = pd.read_csv(config.FACETS_CSV)
    objets = fac[fac["axe"] == "objet"][["code", "label"]].to_dict("records")
    themes = fac[fac["axe"] == "thematique_site"][["code", "label"]].to_dict("records")
    system = build_system(objets, themes)
    schema = _assign_schema([o["code"] for o in objets], [t["code"] for t in themes])

    df = pd.read_csv(assign_csv).fillna("")
    for col in ("pourquoi", "confiance", "repass_v3"):
        if col not in df.columns:
            df[col] = "" if col != "repass_v3" else False
    df["repass_v3"] = df["repass_v3"].astype(str).isin(["True", "true", "1", "1.0"])
    th_empty = df["thematiques"].astype(str).str.strip() == ""
    todo_idx = list(df.index[th_empty & ~df["repass_v3"]])
    n = int(os.environ.get("N", str(len(todo_idx))))
    todo_idx = todo_idx[:n]
    print(f"Démarche {config.DEMARCHE} · tag {config.RUN_TAG or '(none)'} · "
          f"vides restants à re-juger : {int((th_empty & ~df['repass_v3']).sum())} · ce run : {len(todo_idx)}")
    if not todo_idx:
        print("Rien à faire (tous les vides ont été re-jugés).")
        return

    rpm = int(os.environ.get("ASSIGN_RPM", "30"))
    interval = 60.0 / max(1, rpm)
    headers = {"Authorization": f"Bearer {config.ALBERT_API_KEY}"}
    done = 0
    with httpx.Client(headers=headers, timeout=120.0) as client:
        for k, idx in enumerate(todo_idx, 1):
            t0 = time.monotonic()
            verbatim = str(df.at[idx, "verbatim"])
            try:
                a = _chat_json(client, system, f"Verbatim :\n{verbatim[:1500]}", schema)
            except QuotaExceeded as e:
                print(f"  [{k}/{len(todo_idx)}] QUOTA JOURNALIER ATTEINT ({e}) — arrêt (résumable).", flush=True)
                break
            except Exception as e:  # noqa: BLE001 — best-effort par avis
                print(f"  [{k}/{len(todo_idx)}] échec ({e}) — sauté", flush=True)
                continue
            df.at[idx, "objets"] = " ".join(a["objets"])
            df.at[idx, "thematiques"] = " ".join(a["thematiques"])
            df.at[idx, "polarite"] = " ".join(a["polarite"])
            df.at[idx, "pourquoi"] = str(a.get("pourquoi", "")).replace("\n", " ")
            df.at[idx, "confiance"] = round(float(a.get("confiance", 0.0)), 2)
            df.at[idx, "repass_v3"] = True
            done += 1
            if done % 25 == 0:
                df.to_csv(assign_csv, index=False, encoding="utf-8-sig")
                print(f"  … sauvegarde ({done} re-jugés ce run)", flush=True)
            dt = time.monotonic() - t0
            if dt < interval:
                time.sleep(interval - dt)

    df.to_csv(assign_csv, index=False, encoding="utf-8-sig")
    repassed = df[df["repass_v3"]]
    recovered = int((repassed["thematiques"].astype(str).str.strip() != "").sum())
    print(f"\n-> {assign_csv}  (+{done} re-jugés ce run)")
    print(f"STAT — vides AYANT reçu une thématique : {recovered} / {len(repassed)} re-jugés "
          f"({len(repassed) - recovered} restés vides = hors-outil)")


if __name__ == "__main__":
    main()
