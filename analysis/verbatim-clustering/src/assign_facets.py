"""Prototype d'ASSIGNATION multi-facettes, avis par avis (étape 2 : après la découverte).

Prend le référentiel à 3 axes découvert par `extract_facets` (facettes_<tag>.csv) comme
ENSEMBLE FERMÉ, et fait classer chaque verbatim par Albert sur les 3 axes indépendamment :

  * AXE A — objet(s) de la démarche      (0, 1 ou plusieurs ; enum du référentiel)
  * AXE B — thématique(s) site           (0 à 3 ; enum du référentiel)
  * AXE C — polarité                      (MULTI-VALEUR : positif / negatif / les deux / vide)

C'est ici que tombent les VRAIS volumes et la polarité (contrairement à l'attribution par
cluster de `extract_facets`, trop grossière) : chaque verbatim est homogène. Prototype → un
échantillon (ASSIGN_N, défaut 60), pas tout le corpus.

Version v3 (2026-10) — amélioration de la facette thématique après retour PO :
  - polarité MULTI-VALEUR (plus de "neutre" ; un avis mitigé porte positif ET negatif) ;
  - sorties `pourquoi` (justification citant le texte) + `confiance` (0-1) ;
  - prompt assoupli : on tague une difficulté dès qu'elle est clairement exprimée même sans
    écran précis (ex. complexité globale → `complexite_charge`), et on ne laisse VIDE que si le
    verbatim ne parle pas de l'outil (fiscalité, politique, remerciement, question de droit) ;
  - few-shot (dont contre-exemple hors-outil) pour ancrer le modèle.
Recommandé : ALBERT_CHAT_MODEL=openweight-medium (meilleur suivi des consignes) ; ASSIGN_RPM~30.

Entrée  : facettes_<tag>.csv (référentiel) + cache/<demarche>/clean.parquet (verbatims)
Sortie  : out/<demarche>/assignments_<tag>.csv (row_id, verbatim, dup_count, objets,
          thematiques, polarite, pourquoi, confiance) — consommée par scripts/assign_html.py

Usage:
    DEMARCHE=product-3059 RUN_TAG=mcs200 ASSIGN_N=60 ASSIGN_RPM=30 \
        ALBERT_CHAT_MODEL=openweight-medium uv run python -m src.assign_facets
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
# v3 : la polarité est MULTI-VALEUR (positif / negatif / les deux / vide), plus de "neutre".
POLARITES = ["positif", "negatif"]


class QuotaExceeded(Exception):
    """Quota journalier Albert atteint (429 « per day exceeded ») — inutile de réessayer :
    chaque essai compte comme une requête et brûle le quota. On arrête et on reprendra
    après le reset (le run est incrémental : il repartira du volume déjà sur disque)."""


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
        if resp.status_code == 429:
            if "per day" in resp.text.lower():  # quota JOURNALIER : abandon immédiat (ne pas brûler d'essais)
                raise QuotaExceeded(resp.text.strip()[:200])
            if attempt == MAX_RETRIES:
                resp.raise_for_status()
            time.sleep(delay * (2 ** (attempt - 1)))
            continue
        if resp.status_code >= 500:
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
                    "polarite": {"type": "array", "items": {"type": "string", "enum": POLARITES},
                                 "description": "0, 1 ou 2 : positif si satisfaction, negatif si insatisfaction ; "
                                                "LES DEUX si mitigé ; VIDE si aucun sentiment (factuel, question)"},
                    "pourquoi": {"type": "string",
                                 "description": "1 phrase citant le texte pour justifier les facettes retenues (ou l'absence)"},
                    "confiance": {"type": "number", "description": "confiance globale dans l'assignation, entre 0 et 1"},
                },
                "required": ["objets", "thematiques", "polarite", "pourquoi", "confiance"],
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


def build_system(objets: list[dict], themes: list[dict]) -> str:
    """Prompt système v3 (3 axes, polarité multi, pourquoi+confiance, règle assouplie + few-shot).
    `objets`/`themes` = listes de dicts {code, label} issues du référentiel. Réutilisé par le
    script de re-passe des vides (`scripts/apply_facets_to_empties.py`)."""
    obj_block = "\n".join(f"- {o['code']} : {o['label']}" for o in objets)
    th_block = "\n".join(f"- {t['code']} : {t['label']}" for t in themes)
    demarche_label = os.environ.get("ASSIGN_DEMARCHE_LABEL", "").strip()
    ctx_demarche = f" ({demarche_label})" if demarche_label else ""
    system = (
        "Tu classes le verbatim d'un usager sur une démarche administrative en ligne"
        f"{ctx_demarche} selon TROIS axes INDÉPENDANTS. Fonde-toi UNIQUEMENT sur le "
        "texte, n'invente rien. Réponds via le format structuré.\n\n"
        "AXE A — OBJET(S) : le produit / la rubrique EXPLICITEMENT nommé(e). 0, 1 ou plusieurs. "
        "VIDE si le verbatim ne vise aucun objet précis (ressenti général, jugement global).\n"
        "AXE B — THÉMATIQUE(S) SITE (0 à 3) : la nature de la difficulté rencontrée sur l'OUTIL "
        "en ligne. Tague une difficulté dès qu'elle est CLAIREMENT exprimée, MÊME sans viser un "
        "écran précis (un jugement global de complexité/lourdeur → complexite_charge s'il existe). "
        "Ne mets pas toutes les thématiques : choisis la/les plus pertinentes. VIDE UNIQUEMENT si "
        "le verbatim NE PARLE PAS de l'outil : montant/coût de la démarche, fiscalité, politique, "
        "remerciement pur, ou question de droit/réglementation.\n"
        "AXE C — POLARITÉ (0 à 2) : positif si satisfaction exprimée, negatif si insatisfaction ; "
        "LES DEUX si mitigé ; VIDE si aucun sentiment (constat factuel, question).\n\n"
        "pourquoi : 1 phrase citant le texte. confiance : 0 à 1.\n\n"
        f"OBJETS disponibles :\n{obj_block}\n\nTHÉMATIQUES SITE disponibles :\n{th_block}\n\n"
        "EXEMPLES :\n"
        '- « une usine à gaz, on n\'y comprend rien » -> thematiques:["complexite_charge"], polarite:["negatif"]\n'
        '- « Je ne savais pas où cliquer pour continuer » -> thematiques:["parcours"], polarite:["negatif"]\n'
        '- « le site est clair mais le téléphone injoignable » -> polarite:["positif","negatif"]\n'
        '- « Trop cher, vous êtes des voleurs » -> thematiques:[], polarite:["negatif"]  (HORS-OUTIL)\n'
        '- « Parfait, merci » -> thematiques:[], polarite:["positif"]'
    )
    return system + config.context_block()


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
    out_csv = config.OUT_DIR / f"assignments{_sfx()}.csv"
    # Incrémental : on garde les avis déjà classés et on ne traite que le complément vers la cible.
    existing = pd.read_csv(out_csv).fillna("") if out_csv.exists() else pd.DataFrame()
    done_ids = set(existing["row_id"]) if len(existing) else set()
    df_all = pd.read_parquet(config.CLEAN_PARQUET_READ)
    df_all = df_all[df_all["verbatim"].astype(str).str.len() >= 5]
    pool = df_all[~df_all["row_id"].isin(done_ids)] if done_ids else df_all
    need = max(0, n - len(done_ids))
    sample = _sample(pool, need)
    print(f"Démarche {config.DEMARCHE} · tag {config.RUN_TAG or '(none)'} · "
          f"{len(objets)} objets / {len(themes)} thématiques")
    print(f"  déjà classés : {len(done_ids)} · cible : {n} · à classer maintenant : {len(sample)}")
    if len(sample) == 0:
        print("Rien de nouveau à classer (cible déjà atteinte).")
        return

    system = build_system(objets, themes)
    schema = _assign_schema(obj_codes, th_codes)

    # Throttle client-side pour rester sous le quota chat d'Albert (~100/min) et NE PAS
    # déclencher la tempête de 429 -> backoff exponentiel qui rendait le run interminable.
    rpm = int(os.environ.get("ASSIGN_RPM", "60"))
    interval = 60.0 / max(1, rpm)

    def _write(rows: list) -> pd.DataFrame:
        new_df = pd.DataFrame(rows)
        res = pd.concat([existing, new_df], ignore_index=True) if len(existing) else new_df
        res.to_csv(out_csv, index=False, encoding="utf-8-sig")
        return res

    rows: list = []
    headers = {"Authorization": f"Bearer {config.ALBERT_API_KEY}"}
    with httpx.Client(headers=headers, timeout=120.0) as client:
        for i, r in enumerate(sample.itertuples(), 1):
            t0 = time.monotonic()
            verbatim = str(r.verbatim)
            try:
                a = _chat_json(client, system, f"Verbatim :\n{verbatim[:1500]}", schema)
            except QuotaExceeded as e:
                print(f"  [{i}/{len(sample)}] QUOTA ALBERT JOURNALIER ATTEINT ({e}) — arrêt. "
                      f"Reprise possible après le reset (le run est incrémental).", flush=True)
                break
            except Exception as e:  # noqa: BLE001 — best-effort par avis
                print(f"  [{i}/{len(sample)}] échec ({e}) — sauté", flush=True)
                continue
            rows.append({
                "row_id": r.row_id,
                "verbatim": verbatim,
                "dup_count": int(getattr(r, "dup_count", 1)),
                "intention": getattr(r, "intention", ""),
                "objets": " ".join(a["objets"]),
                "thematiques": " ".join(a["thematiques"]),
                "polarite": " ".join(a["polarite"]),
                "pourquoi": str(a.get("pourquoi", "")).replace("\n", " "),
                "confiance": round(float(a.get("confiance", 0.0)), 2),
            })
            print(f"  [{i}/{len(sample)}] pol={'/'.join(a['polarite']) or '∅':15} "
                  f"obj={a['objets']} th={a['thematiques']}  « {verbatim[:60].replace(chr(10),' ')} »",
                  flush=True)
            if i % 25 == 0:  # sauvegarde intermédiaire : crash-safe + reprenable + progrès visible
                _write(rows)
                print(f"  … sauvegarde ({len(existing) + len(rows)} avis sur disque)", flush=True)
            dt = time.monotonic() - t0
            if dt < interval:
                time.sleep(interval - dt)

    result = _write(rows)
    pol = result["polarite"].value_counts().to_dict()
    print(f"\n-> {out_csv}  (+{len(rows)} nouveaux → {len(result)} avis au total)")
    print(f"   polarité (total) : {pol}")


if __name__ == "__main__":
    main()
