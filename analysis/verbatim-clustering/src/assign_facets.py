"""Prototype d'ASSIGNATION multi-facettes, avis par avis (étape 2 : après la découverte).

Prend le référentiel à 3 axes découvert par `extract_facets` (facettes_<tag>.csv) comme
ENSEMBLE FERMÉ, et fait classer chaque verbatim par Albert sur les 3 axes indépendamment :

  * AXE A — objet(s) de la démarche      (0, 1 ou plusieurs ; enum du référentiel)
  * AXE B — thématique(s) site           (0, 1 ou plusieurs ; enum du référentiel)
  * AXE C — polarité                      (exactement une : positif / negatif / neutre)

C'est ici que tombent les VRAIS volumes et la polarité (contrairement à l'attribution par
cluster de `extract_facets`, trop grossière) : chaque verbatim est homogène (un objet, un
sentiment). Prototype → un échantillon (ASSIGN_N, défaut 60), pas tout le corpus.

Entrée  : facettes_<tag>.csv (référentiel) + cache/<demarche>/clean.parquet (verbatims)
Sortie  : out/<demarche>/assignments_<tag>.csv (row_id, verbatim, dup_count, objets,
          thematiques, polarite) — consommée par scripts/assign_html.py

Usage:
    DEMARCHE=product-3059 RUN_TAG=mcs200 ASSIGN_N=60 uv run python -m src.assign_facets
"""

from __future__ import annotations

import json
import os
import sys
import time

import httpx
import pandas as pd

from . import config

CHAT_URL = f"{config.ALBERT_BASE_URL}/chat/completions"
MAX_RETRIES = 6
POLARITES = ["positif", "negatif", "neutre"]


def _sfx() -> str:
    return (f"_{config.RUN_TAG}" if config.RUN_TAG else "") + ("_ctx" if config.CONTEXT_ON else "")


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


def _assign_schema(obj_codes: list[str], th_codes: list[str]) -> dict:
    return {
        "type": "json_schema",
        "json_schema": {
            "name": "facettes_avis", "strict": True,
            "schema": {
                "type": "object", "additionalProperties": False,
                "properties": {
                    "objets": {"type": "array", "items": {"type": "string", "enum": obj_codes},
                               "description": "0, 1 ou plusieurs objets métier (vide si aucun objet précis)"},
                    "thematiques": {"type": "array", "items": {"type": "string", "enum": th_codes},
                                    "description": "0, 1 ou plusieurs thématiques site (vide si simple ressenti global)"},
                    "polarite": {"type": "string", "enum": POLARITES,
                                 "description": "sentiment global de l'usager (obligatoire)"},
                },
                "required": ["objets", "thematiques", "polarite"],
            },
        },
    }


def _sample(df: pd.DataFrame, n: int) -> pd.DataFrame:
    """Échantillon déterministe et varié : quelques verbatims très fréquents (courts,
    ressentis) + un tirage aléatoire fixé (random_state) pour le reste."""
    df = df[df["verbatim"].astype(str).str.len() >= 5].copy()
    if len(df) <= n:
        return df
    top = df.nlargest(min(n // 4, 15), "dup_count")
    rest = df.drop(top.index).sample(n=n - len(top), random_state=42)
    return pd.concat([top, rest]).drop_duplicates("row_id").head(n)


def main() -> None:
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):
        pass
    if not config.albert_configured():
        sys.exit("Albert not configured (.env).")
    if not config.FACETS_CSV.exists():
        sys.exit(f"{config.FACETS_CSV} introuvable — lance d'abord `python -m src.extract_facets`.")
    if not config.CLEAN_PARQUET_READ.exists():
        sys.exit(f"{config.CLEAN_PARQUET_READ} introuvable — pipeline clean/embed manquante.")

    fac = pd.read_csv(config.FACETS_CSV)
    objets = fac[fac["axe"] == "objet"][["code", "label"]].to_dict("records")
    themes = fac[fac["axe"] == "thematique_site"][["code", "label"]].to_dict("records")
    obj_codes = [o["code"] for o in objets]
    th_codes = [t["code"] for t in themes]

    n = int(os.environ.get("ASSIGN_N", "60"))
    sample = _sample(pd.read_parquet(config.CLEAN_PARQUET_READ), n)
    print(f"Démarche {config.DEMARCHE} · tag {config.RUN_TAG or '(none)'} · "
          f"{len(objets)} objets / {len(themes)} thématiques · {len(sample)} verbatims à classer")

    obj_block = "\n".join(f"- {o['code']} : {o['label']}" for o in objets)
    th_block = "\n".join(f"- {t['code']} : {t['label']}" for t in themes)
    system = (
        "Tu classes le verbatim d'un usager sur une démarche administrative en ligne "
        "(déclaration de revenus) selon TROIS axes INDÉPENDANTS. Fonde-toi UNIQUEMENT sur le "
        "texte, n'invente rien. Réponds via le format structuré.\n\n"
        "AXE A — OBJET(S) : de quoi parle l'usager (rubrique / produit fiscal concerné). 0, 1 "
        "ou plusieurs. VIDE si le verbatim ne vise aucun objet précis (ressenti général, "
        "remerciement, jugement global).\n"
        "AXE B — THÉMATIQUE(S) SITE : nature de la ou des difficultés rencontrées sur l'outil. "
        "0, 1 ou plusieurs. VIDE si le verbatim n'exprime qu'une satisfaction / insatisfaction "
        "globale sans difficulté précise.\n"
        "AXE C — POLARITÉ : sentiment global de l'usager. TOUJOURS exactement une valeur "
        "(positif, negatif ou neutre).\n\n"
        f"OBJETS disponibles :\n{obj_block}\n\nTHÉMATIQUES SITE disponibles :\n{th_block}"
    )
    system += config.context_block()
    schema = _assign_schema(obj_codes, th_codes)

    rows = []
    headers = {"Authorization": f"Bearer {config.ALBERT_API_KEY}"}
    with httpx.Client(headers=headers, timeout=120.0) as client:
        for i, r in enumerate(sample.itertuples(), 1):
            verbatim = str(r.verbatim)
            try:
                a = _chat_json(client, system, f"Verbatim :\n{verbatim[:1500]}", schema)
            except Exception as e:  # noqa: BLE001 — best-effort par avis
                print(f"  [{i}/{len(sample)}] échec ({e}) — sauté")
                continue
            rows.append({
                "row_id": r.row_id,
                "verbatim": verbatim,
                "dup_count": int(getattr(r, "dup_count", 1)),
                "intention": getattr(r, "intention", ""),
                "objets": " ".join(a["objets"]),
                "thematiques": " ".join(a["thematiques"]),
                "polarite": a["polarite"],
            })
            print(f"  [{i}/{len(sample)}] {a['polarite']:8} "
                  f"obj={a['objets']} th={a['thematiques']}  « {verbatim[:60].replace(chr(10),' ')} »")

    out_csv = config.OUT_DIR / f"assignments{_sfx()}.csv"
    pd.DataFrame(rows).to_csv(out_csv, index=False, encoding="utf-8-sig")
    pol = pd.Series([r["polarite"] for r in rows]).value_counts().to_dict()
    print(f"\n-> {out_csv}  ({len(rows)} avis classés)")
    print(f"   polarité : {pol}")


if __name__ == "__main__":
    main()
