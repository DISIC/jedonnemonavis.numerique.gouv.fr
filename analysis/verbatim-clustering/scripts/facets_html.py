"""Vue HTML autonome des facettes découvertes (les 3 axes).

Lit le CSV produit par `src.extract_facets` (config.FACETS_CSV) et écrit une page HTML
autoportante à côté, sans aucun appel réseau — rejouable pour n'importe quelle démarche.

Usage:
    DEMARCHE=product-3059 RUN_TAG=mcs200 uv run python scripts/facets_html.py
"""

from __future__ import annotations

import html
import sys

import pandas as pd

from src import config

POLARITES = [
    ("positif", "#18753C", "L'usager exprime une satisfaction / un retour favorable."),
    ("negatif", "#CE0500", "L'usager exprime une difficulté / une insatisfaction."),
    ("neutre", "#666666", "Constat, question ou suggestion sans charge affective nette."),
]


def _card(label: str, code: str, desc: str, vol: int, nb: int, mark: str = "") -> str:
    m = f'<span class="mark">{mark}</span>' if mark else ""
    vol_fr = f"{vol:,}".replace(",", " ")  # espace fine insécable pour les milliers
    return (
        '<div class="card">'
        f'<div class="card-head">{m}<span class="label">{html.escape(label)}</span></div>'
        f'<div class="code">{html.escape(code)}</div>'
        f'<div class="desc">{html.escape(desc)}</div>'
        f'<div class="metrics"><span class="vol">~{vol_fr}</span> réponses'
        f'<span class="sep">·</span>{nb} cluster{"s" if nb > 1 else ""}</div>'
        "</div>"
    )


def main() -> None:
    if not config.FACETS_CSV.exists():
        sys.exit(f"{config.FACETS_CSV} introuvable — lance d'abord `python -m src.extract_facets` "
                 f"(ou vérifie DEMARCHE/RUN_TAG).")
    df = pd.read_csv(config.FACETS_CSV)
    objets = df[df["axe"] == "objet"].sort_values("volume_indicatif", ascending=False)
    themes = df[df["axe"] == "thematique_site"].sort_values("volume_indicatif", ascending=False)

    obj_cards = "\n".join(
        _card(r.label, r.code, r.description, int(r.volume_indicatif), int(r.nb_clusters))
        for r in objets.itertuples()
    )
    th_cards = "\n".join(
        _card(r.label, r.code, r.description, int(r.volume_indicatif), int(r.nb_clusters),
              mark="⭐" if str(r.seed) == "métier" else "🔍")
        for r in themes.itertuples()
    )
    pol_cards = "\n".join(
        f'<div class="card pol"><div class="card-head">'
        f'<span class="dot" style="background:{color}"></span>'
        f'<span class="label">{code}</span></div>'
        f'<div class="desc">{html.escape(desc)}</div></div>'
        for code, color, desc in POLARITES
    )

    tag = config.RUN_TAG + ("_ctx" if config.CONTEXT_ON else "")
    title = f"Facettes — {config.DEMARCHE or 'démarche'} ({tag or 'run'})"
    page = f"""<!doctype html>
<html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(title)}</title>
<style>
  :root {{ --blue:#000091; --a:#0063CB; --b:#18753C; --c:#6A6AF4; }}
  * {{ box-sizing:border-box; }}
  body {{ font-family:"Marianne",system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
    margin:0; color:#161616; background:#f6f6f6; line-height:1.5; }}
  header {{ background:var(--blue); color:#fff; padding:24px 32px; }}
  header h1 {{ margin:0 0 6px; font-size:22px; }}
  header p {{ margin:0; opacity:.85; font-size:14px; max-width:900px; }}
  .note {{ background:#fff4d6; border-left:4px solid #ffca00; padding:10px 14px;
    margin:16px 32px; font-size:13px; border-radius:0 4px 4px 0; }}
  .cols {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(320px,1fr));
    gap:20px; padding:20px 32px 40px; align-items:start; }}
  .axis {{ background:#fff; border-radius:8px; overflow:hidden;
    box-shadow:0 1px 4px rgba(0,0,0,.08); }}
  .axis-head {{ padding:14px 18px; color:#fff; }}
  .axis-head h2 {{ margin:0; font-size:16px; }}
  .axis-head .sub {{ font-size:12.5px; opacity:.9; margin-top:3px; }}
  .axis-head .count {{ float:right; font-size:13px; opacity:.9; }}
  .axis.a .axis-head {{ background:var(--a); }}
  .axis.b .axis-head {{ background:var(--b); }}
  .axis.c .axis-head {{ background:var(--c); }}
  .body {{ padding:12px; }}
  .card {{ border:1px solid #e5e5e5; border-radius:6px; padding:11px 13px; margin-bottom:10px; }}
  .card:last-child {{ margin-bottom:0; }}
  .card-head {{ display:flex; align-items:center; gap:6px; }}
  .label {{ font-weight:600; font-size:14.5px; }}
  .mark {{ font-size:13px; }}
  .code {{ font-family:ui-monospace,Menlo,Consolas,monospace; font-size:11.5px;
    color:#666; margin:2px 0 5px; }}
  .desc {{ font-size:13px; color:#3a3a3a; }}
  .metrics {{ font-size:12px; color:#666; margin-top:7px; }}
  .metrics .vol {{ font-weight:700; color:#161616; }}
  .metrics .sep {{ margin:0 6px; }}
  .card.pol .dot {{ width:11px; height:11px; border-radius:50%; display:inline-block; }}
  footer {{ padding:0 32px 30px; font-size:12px; color:#888; }}
</style></head><body>
<header>
  <h1>Facettes découvertes — {html.escape(config.DEMARCHE or 'démarche')} <span style="opacity:.7">({html.escape(tag or 'run')})</span></h1>
  <p>Trois axes <strong>orthogonaux</strong> extraits des problématiques découvertes par clustering.
  Un avis se positionne indépendamment sur chaque axe : il peut porter un objet ET une ou plusieurs
  thématiques ET une polarité — ou seulement une polarité (« tout va bien »), sans objet ni thématique.</p>
</header>
<div class="note"><strong>Volumes indicatifs</strong> : somme des clusters rattachés à chaque facette,
avec recouvrement entre axes. Les volumes exacts par facette (et la polarité) ne tomberont qu'après
la classification avis-par-avis. Brouillon à valider avec le porteur.</div>
<div class="cols">
  <section class="axis a">
    <div class="axis-head"><span class="count">{len(objets)} facettes</span>
      <h2>Axe A — Objets de la démarche</h2>
      <div class="sub">De quoi parle l'usager. Spécifique à la démarche, en général non actionnable.</div></div>
    <div class="body">{obj_cards}</div>
  </section>
  <section class="axis b">
    <div class="axis-head"><span class="count">{len(themes)} facettes</span>
      <h2>Axe B — Thématiques site</h2>
      <div class="sub">Nature de la difficulté sur l'outil (axe actionnable). ⭐ liste métier · 🔍 émergé.</div></div>
    <div class="body">{th_cards}</div>
  </section>
  <section class="axis c">
    <div class="axis-head"><span class="count">3 valeurs</span>
      <h2>Axe C — Polarité</h2>
      <div class="sub">Sentiment de l'usager, taggé par verbatim. Règle le mélange positif/négatif.</div></div>
    <div class="body">{pol_cards}</div>
  </section>
</div>
<footer>Source : {html.escape(config.FACETS_CSV.name)} · pipeline verbatim-clustering (Albert / DINUM).</footer>
</body></html>"""

    out = config.FACETS_MD.with_suffix(".html")
    out.write_text(page, encoding="utf-8")
    print(f"-> {out}")
    print(f"   {len(objets)} objets · {len(themes)} thématiques · 3 polarités")


if __name__ == "__main__":
    main()
