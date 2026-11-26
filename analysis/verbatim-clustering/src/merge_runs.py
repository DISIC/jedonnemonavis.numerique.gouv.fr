"""Merge two runs of the SAME démarche into one unified taxonomy (e.g. a full-corpus run +
its noise re-clustering), de-duplicating overlapping categories and surfacing the new ones.

Every verbatim is assigned ONCE: to its category from the base run if it was clustered there,
else to its category from the noise run if it was rescued, else residual noise. The union of the
two candidate catalogues (problématiques) is then re-consolidated by the LLM:
  1. propose a clean, de-duplicated set of MERGED problématiques (near-duplicates folded together,
     niche/new ones kept distinct);
  2. assign each source (run, cluster) to exactly one merged problématique (enum-constrained);
  3. group the merged problématiques into parent themes (reusing consolidate's theme pass).

Outputs (tag `merged500` by default), so the rest of the pipeline can consume them as a normal run:
  * cache/<demarche>/clustered_<tag>.parquet  — full corpus, `cluster` = merged problématique id
  * out/<demarche>/catalog_2level_<tag>.{csv,md}
Then run `explore_page` (RUN_TAG=<tag>) for the explorer + the 3 Grist CSVs, and grist_push/_page.

Usage:
    $env:DEMARCHE="product-3059"
    uv run python -m src.merge_runs --base mcs500 --noise noise500 --tag merged500
"""

from __future__ import annotations

import argparse
import sys

import httpx
import numpy as np
import pandas as pd

from . import config
from .cluster import ctfidf_top_terms
from .consolidate import _chat_json, assign_theme

MERGED_SCHEMA = {
    "type": "json_schema",
    "json_schema": {
        "name": "merged_problematiques", "strict": True,
        "schema": {
            "type": "object", "additionalProperties": False,
            "properties": {"problematiques": {
                "type": "array",
                "items": {
                    "type": "object", "additionalProperties": False,
                    "properties": {
                        "code": {"type": "string", "description": "identifiant stable snake_case"},
                        "label": {"type": "string", "description": "libellé court de la problématique"},
                        "description": {"type": "string", "description": "1 phrase: ce que regroupe la problématique"},
                    },
                    "required": ["code", "label", "description"],
                },
            }},
            "required": ["problematiques"],
        },
    },
}


def propose_merged(client: httpx.Client, sources: pd.DataFrame) -> list[dict]:
    system = (
        "Tu fusionnes des problématiques découvertes sur DEUX passes de clustering de la MÊME "
        "démarche : passe 1 sur le corpus complet, passe 2 uniquement sur le bruit résiduel de la "
        "passe 1. Beaucoup de problématiques se recoupent (mêmes sujets retrouvés dans le bruit) : "
        "fusionne les quasi-doublons en UNE seule problématique. MAIS garde DISTINCTES les "
        "problématiques spécifiques ou de niche (cas fiscaux précis, cases particulières, cas "
        "particuliers), surtout celles révélées par la passe 2 — ne les noie pas dans un thème "
        "générique. Produis un ensemble propre, non redondant, de problématiques fusionnées. "
        "Codes en snake_case stables. Réponds uniquement via le format structuré."
    ) + config.context_block()
    listing = "\n".join(
        f"- [passe {r.run} · {int(r.size)} réponses] {r.label} : {r.description} "
        f"(mots-clés : {r.top_terms})"
        for r in sources.itertuples()
    )
    out = _chat_json(client, system, f"Problématiques sources à fusionner :\n{listing}", MERGED_SCHEMA)
    return out["problematiques"]


def assign_merged(client: httpx.Client, row, merged: list[dict]) -> str:
    codes = [m["code"] for m in merged]
    schema = {
        "type": "json_schema",
        "json_schema": {
            "name": "merged_assignment", "strict": True,
            "schema": {
                "type": "object", "additionalProperties": False,
                "properties": {"code": {"type": "string", "enum": codes}},
                "required": ["code"],
            },
        },
    }
    block = "\n".join(f"- {m['code']} : {m['label']} — {m['description']}" for m in merged)
    system = (
        "Tu ranges une problématique source dans EXACTEMENT une des problématiques fusionnées "
        "proposées, en renvoyant son code. Choisis la plus proche sémantiquement. Réponds "
        "uniquement via le format structuré."
    ) + config.context_block()
    user = (f"Problématiques fusionnées disponibles :\n{block}\n\n"
            f"Problématique source à ranger :\n{row.label} : {row.description}\n"
            f"(mots-clés : {row.top_terms})")
    return _chat_json(client, system, user, schema)["code"]


THEME_SCHEMA = {
    "type": "json_schema",
    "json_schema": {
        "name": "themes", "strict": True,
        "schema": {
            "type": "object", "additionalProperties": False,
            "properties": {"themes": {
                "type": "array",
                "items": {
                    "type": "object", "additionalProperties": False,
                    "properties": {
                        "code": {"type": "string"}, "label": {"type": "string"},
                        "description": {"type": "string"},
                    },
                    "required": ["code", "label", "description"],
                },
            }},
            "required": ["themes"],
        },
    },
}


def propose_themes_strict(client: httpx.Client, rows: pd.DataFrame, lo: int, hi: int) -> list[dict]:
    """Like consolidate.propose_themes but FORCES grouping (avoids 1 theme per problématique)."""
    system = (
        f"Tu regroupes une liste de PROBLÉMATIQUES en EXACTEMENT {lo} à {hi} THÈMES parents, pas "
        "plus. CONTRAINTE FORTE : il y a beaucoup plus de problématiques que de thèmes, donc CHAQUE "
        "thème regroupe PLUSIEURS problématiques (vise 3 à 10 par thème). N'invente JAMAIS un thème "
        "pour une seule problématique. Les thèmes doivent être larges et transversaux (ex. "
        "« Complexité du formulaire », « Cas fiscaux spécifiques », « Accompagnement et support », "
        "« Accessibilité », « Satisfaction »…). Codes snake_case. Réponds via le format structuré."
    ) + config.context_block()
    listing = "\n".join(f"- [{int(r.size)}] {r.label} : {r.description}" for r in rows.itertuples())
    return _chat_json(client, system, f"Problématiques à regrouper :\n{listing}", THEME_SCHEMA)["themes"]


def _write_catalog(merged_df: pd.DataFrame, theme_by_code: dict, themes: list[dict],
                   n_resid: int, args) -> None:
    out = config.OUT_DIR
    merged_df = merged_df.copy()
    merged_df["theme_label"] = merged_df["theme_code"].map(lambda c: theme_by_code[c]["label"])
    merged_df["theme_description"] = merged_df["theme_code"].map(lambda c: theme_by_code[c]["description"])
    cat_cols = ["theme_code", "theme_label", "theme_description", "cluster", "size",
                "label", "description", "top_terms"]
    merged_df.sort_values(["theme_code", "size"], ascending=[True, False])[cat_cols].to_csv(
        out / f"catalog_2level_{args.tag}.csv", index=False, encoding="utf-8-sig")
    theme_size = merged_df.groupby("theme_code")["size"].sum().to_dict()
    order = sorted(theme_by_code, key=lambda c: theme_size.get(c, 0), reverse=True)
    with (out / f"catalog_2level_{args.tag}.md").open("w", encoding="utf-8") as f:
        f.write(f"# Taxonomie fusionnée ({config.DEMARCHE}) — {args.base} + {args.noise}\n\n")
        f.write(f"{len(themes)} thèmes · {len(merged_df)} problématiques · "
                f"{int(merged_df['size'].sum()):,} réponses classées · {n_resid:,} en bruit résiduel\n\n")
        for code in order:
            t = theme_by_code[code]
            f.write(f"## {t['label']}\n`{code}` — {t['description']} · "
                    f"**{int(theme_size.get(code, 0)):,} réponses**\n\n")
            for r in merged_df[merged_df.theme_code == code].sort_values("size", ascending=False).itertuples():
                f.write(f"- **{r.label}** ({int(r.size):,}) — {r.description}\n")
            f.write("\n")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", default="mcs500", help="Tag du run corpus complet.")
    ap.add_argument("--noise", default="noise500", help="Tag du run sur le bruit.")
    ap.add_argument("--tag", default="merged500", help="Tag de sortie du run fusionné.")
    ap.add_argument("--catalog-suffix", default="",
                    help="Suffixe des catalogues sources à lire (ex. _ctx pour fusionner les "
                         "catalogues contextualisés). Le clustering, lui, reste non suffixé.")
    ap.add_argument("--retheme-only", action="store_true",
                    help="Rejoue UNIQUEMENT la passe thèmes sur catalog_2level_<tag>.csv existant.")
    args = ap.parse_args()

    if args.retheme_only:
        if not config.albert_configured():
            sys.exit("Albert not configured (.env).")
        cat = pd.read_csv(config.OUT_DIR / f"catalog_2level_{args.tag}.csv")
        merged_df = cat[["cluster", "label", "description", "top_terms", "size"]].copy()
        clustered = pd.read_parquet(config.CACHE_DIR / f"clustered_{args.tag}.parquet")
        n_resid = int(clustered.loc[clustered["cluster"] == -1, "dup_count"].sum())
        headers = {"Authorization": f"Bearer {config.ALBERT_API_KEY}"}
        with httpx.Client(headers=headers, timeout=120.0) as client:
            print(f"Re-thème de {len(merged_df)} problématiques ...")
            themes = propose_themes_strict(client, merged_df, 8, 12)
            print(f"  -> {len(themes)} thèmes proposés")
            theme_by_code = {t["code"]: t for t in themes}
            merged_df["theme_code"] = [assign_theme(client, r, themes) for r in merged_df.itertuples()]
        _write_catalog(merged_df, theme_by_code, themes, n_resid, args)
        print(f"OK — {len(merged_df)} problématiques regroupées en {len(themes)} thèmes "
              f"(catalog_2level_{args.tag} réécrit).")
        return

    if not config.albert_configured():
        sys.exit("Albert not configured (.env).")

    cache, out = config.CACHE_DIR, config.OUT_DIR
    f_base = cache / f"clustered_{args.base}.parquet"
    f_noise = cache / f"clustered_{args.noise}.parquet"
    c_base = out / f"catalog_2level_{args.base}{args.catalog_suffix}.csv"
    c_noise = out / f"catalog_2level_{args.noise}{args.catalog_suffix}.csv"
    for p in (f_base, f_noise, c_base, c_noise):
        if not p.exists():
            sys.exit(f"manquant : {p}")
    if not config.FULL_EMBEDDINGS_NPY.exists():
        sys.exit(f"manquant : {config.FULL_EMBEDDINGS_NPY}")

    # --- 1. Unified per-verbatim source (base spine, aligned with embeddings) ---
    base = pd.read_parquet(f_base)                       # full corpus, dup_count, cluster
    noise = pd.read_parquet(f_noise)[["verbatim", "cluster"]].rename(columns={"cluster": "cl_noise"})
    df = base.merge(noise, on="verbatim", how="left")
    df["cl_noise"] = df["cl_noise"].fillna(-1).astype(int)

    def source_of(r) -> str | None:
        if r.cluster != -1:
            return f"{args.base}:{int(r.cluster)}"
        if r.cl_noise != -1:
            return f"{args.noise}:{int(r.cl_noise)}"
        return None  # residual noise
    df["src"] = [source_of(r) for r in df.itertuples()]

    # --- 2. Source problématiques (union of both catalogues) + recomputed volumes ---
    cat_b = pd.read_csv(c_base); cat_b["run"] = args.base
    cat_n = pd.read_csv(c_noise); cat_n["run"] = args.noise
    cat_b["src"] = args.base + ":" + cat_b["cluster"].astype(str)
    cat_n["src"] = args.noise + ":" + cat_n["cluster"].astype(str)
    sources = pd.concat([cat_b, cat_n], ignore_index=True)
    vol = df.groupby("src")["dup_count"].sum()
    sources["size"] = sources["src"].map(vol).fillna(0).astype(int)
    sources = sources[sources["size"] > 0].reset_index(drop=True)
    print(f"{len(sources)} problématiques sources ({(sources.run==args.base).sum()} {args.base} + "
          f"{(sources.run==args.noise).sum()} {args.noise}) à fusionner")

    headers = {"Authorization": f"Bearer {config.ALBERT_API_KEY}"}
    with httpx.Client(headers=headers, timeout=120.0) as client:
        print("Passe 1 — proposition des problématiques fusionnées ...")
        merged = propose_merged(client, sources)
        print(f"  -> {len(merged)} problématiques fusionnées proposées")
        print("Passe 2 — rattachement des sources ...")
        src_to_merged = {}
        for r in sources.itertuples():
            src_to_merged[r.src] = assign_merged(client, r, merged)
            print(f"  {r.src} ({int(r.size):,}) -> {src_to_merged[r.src]}")

    # --- 3. Map verbatims -> merged problématique; assign integer ids by volume ---
    df["merged_code"] = df["src"].map(src_to_merged)     # NaN for residual noise
    merged_vol = df.groupby("merged_code")["dup_count"].sum().sort_values(ascending=False)
    code_to_id = {code: i for i, code in enumerate(merged_vol.index)}
    df["cluster_merged"] = df["merged_code"].map(code_to_id).fillna(-1).astype(int)

    by_code = {m["code"]: m for m in merged}
    # recompute c-TF-IDF top terms per merged problématique (uses verbatim + dup_count + labels)
    terms = ctfidf_top_terms(df, df["cluster_merged"].to_numpy())

    # --- 4. Theme pass on the merged problématiques (reuse consolidate) ---
    rows = []
    for code, mid in code_to_id.items():
        m = by_code.get(code, {"label": code, "description": ""})
        rows.append({"cluster": mid, "code": code, "label": m["label"],
                     "description": m["description"], "top_terms": ", ".join(terms.get(mid, [])),
                     "size": int(merged_vol[code])})
    merged_df = pd.DataFrame(rows).sort_values("size", ascending=False).reset_index(drop=True)

    # --- 5. Write clustered parquet (full corpus, aligned with embeddings) ---
    clustered = df[["verbatim", "dup_count", "intention"]].copy()
    clustered["cluster"] = df["cluster_merged"]
    clustered.insert(0, "row_id", range(len(clustered)))   # aligned with full embeddings order
    clustered.to_parquet(cache / f"clustered_{args.tag}.parquet", index=False)
    n_resid = int(df.loc[df["cluster_merged"] == -1, "dup_count"].sum())

    with httpx.Client(headers=headers, timeout=120.0) as client:
        print("Passe 3 — regroupement en thèmes ...")
        themes = propose_themes_strict(client, merged_df, 8, 12)
        print(f"  -> {len(themes)} thèmes proposés")
        theme_by_code = {t["code"]: t for t in themes}
        merged_df["theme_code"] = [assign_theme(client, r, themes) for r in merged_df.itertuples()]
    _write_catalog(merged_df, theme_by_code, themes, n_resid, args)

    print(f"\nOK — {len(merged_df)} problématiques fusionnées / {len(themes)} thèmes "
          f"(sources : {len(sources)}).")
    print(f"   -> clustered_{args.tag}.parquet + catalog_2level_{args.tag}.{{csv,md}}")
    print(f"   Étape suivante : RUN_TAG={args.tag} python -m src.explore_page  (explorer + CSV Grist)")


if __name__ == "__main__":
    main()
