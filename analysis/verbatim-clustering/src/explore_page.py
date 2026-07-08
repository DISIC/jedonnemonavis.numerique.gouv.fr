"""Step 6 — generate a self-contained HTML explorer linking verbatims to categories.

Joins cache/clustered.parquet (each verbatim already carries its cluster) with
out/catalog_2level.csv (cluster -> problématique -> thème), and renders a single
offline HTML file: a 2-level tree where each problématique expands to ALL its
verbatims, sorted by representativeness (cosine proximity to the cluster centroid).
Includes a separate "bruit" section (unclustered verbatims) and a global search.

Lazy rendering: a problématique's verbatim list is built only when expanded, so the
browser stays responsive even with ~70k rows. Data is embedded as JSON in the page.

⚠️ Verbatims are personal data: out/ is gitignored — keep this file local.

Usage:
    uv run python -m src.explore_page
"""

from __future__ import annotations

import json
import sys

import numpy as np
import pandas as pd
from sklearn.preprocessing import normalize

from . import config

INTENTION_CODE = {"good": "g", "bad": "b", "neutral": "n", "positive": "g", "negative": "b"}

# Synthetic category for the unclustered verbatims, so the relational tables stay
# complete (every verbatim references a problématique, every problématique a thème).
NOISE_THEME_CODE = "bruit"
NOISE_THEME_LABEL = "⚠️ Non catégorisé (bruit)"
NOISE_PROB_LABEL = "Non catégorisé"
NOISE_DESC = "Verbatims qu'aucun cluster dense n'a captés (longue traîne diffuse, textes très courts)."


def write_grist_csvs(df: pd.DataFrame, cat: pd.DataFrame, has_intention: bool) -> None:
    """Export 3 linked CSVs for Grist: themes -> problématiques -> verbatims.

    The HTML explorer's tree, flattened into relational tables a project manager can
    browse in Grist via linked sections (select a thème -> its problématiques ->
    their verbatims). `df` carries `_sim` (cosine proximity to the cluster centroid).
    """
    has_theme_desc = "theme_description" in cat.columns
    uniq_by_cluster = df["cluster"].value_counts().to_dict()

    # --- Problématiques (one row per cluster) + synthetic noise row ---
    prob_rows = []
    for r in cat.itertuples():
        c = int(r.cluster)
        prob_rows.append({
            "cluster": c,
            "theme_code": r.theme_code,
            "label": r.label,
            "description": r.description if isinstance(r.description, str) else "",
            "top_terms": r.top_terms if isinstance(getattr(r, "top_terms", ""), str) else "",
            "nb_reponses": int(r.size),
            "nb_verbatims_uniques": int(uniq_by_cluster.get(c, 0)),
        })
    noise_sub = df[df["cluster"] == -1]
    noise_answers = int(noise_sub["dup_count"].sum()) if "dup_count" in noise_sub else len(noise_sub)
    if len(noise_sub):
        prob_rows.append({
            "cluster": -1, "theme_code": NOISE_THEME_CODE, "label": NOISE_PROB_LABEL,
            "description": NOISE_DESC, "top_terms": "",
            "nb_reponses": noise_answers, "nb_verbatims_uniques": len(noise_sub),
        })
    prob_df = pd.DataFrame(prob_rows)

    # --- Thèmes (aggregate of their problématiques) ---
    theme_label = {r.theme_code: r.theme_label for r in cat.itertuples()}
    theme_desc = (
        {r.theme_code: (r.theme_description if isinstance(r.theme_description, str) else "")
         for r in cat.itertuples()} if has_theme_desc else {}
    )
    th = prob_df[prob_df["theme_code"] != NOISE_THEME_CODE].groupby("theme_code")
    theme_rows = []
    for code, g in th:
        theme_rows.append({
            "theme_code": code,
            "theme_label": theme_label.get(code, code),
            "theme_description": theme_desc.get(code, ""),
            "nb_problematiques": int(len(g)),
            "nb_reponses": int(g["nb_reponses"].sum()),
            "nb_verbatims_uniques": int(g["nb_verbatims_uniques"].sum()),
        })
    theme_df = pd.DataFrame(theme_rows).sort_values("nb_reponses", ascending=False)
    if len(noise_sub):
        theme_df = pd.concat([theme_df, pd.DataFrame([{
            "theme_code": NOISE_THEME_CODE, "theme_label": NOISE_THEME_LABEL,
            "theme_description": NOISE_DESC, "nb_problematiques": 1,
            "nb_reponses": noise_answers, "nb_verbatims_uniques": len(noise_sub),
        }])], ignore_index=True)

    # --- Verbatims (one row per unique verbatim) ---
    v = df.copy()
    v["representativite"] = v["_sim"]
    v["rang"] = v.groupby("cluster")["representativite"].rank(ascending=False, method="first")
    noise_mask = v["cluster"] == -1
    v.loc[noise_mask, "rang"] = v.loc[noise_mask, "dup_count"].rank(ascending=False, method="first")
    v["rang"] = v["rang"].fillna(0).astype(int)

    cl_theme_code = {int(r.cluster): r.theme_code for r in cat.itertuples()}
    cl_theme_label = {int(r.cluster): r.theme_label for r in cat.itertuples()}
    cl_prob = {int(r.cluster): r.label for r in cat.itertuples()}
    cl_theme_code[-1], cl_theme_label[-1], cl_prob[-1] = NOISE_THEME_CODE, NOISE_THEME_LABEL, NOISE_PROB_LABEL

    v["theme_code"] = v["cluster"].map(lambda c: cl_theme_code.get(int(c), "autre"))
    v["theme_label"] = v["cluster"].map(lambda c: cl_theme_label.get(int(c), "Autre"))
    v["problematique"] = v["cluster"].map(lambda c: cl_prob.get(int(c), "?"))
    v["representativite"] = v["representativite"].round(4)

    # Reading order mirrors the HTML: thème (volume desc) -> problématique (volume desc)
    # -> représentativité; bruit always last.
    theme_size = dict(zip(theme_df["theme_code"], theme_df["nb_reponses"]))
    prob_size = {int(r.cluster): int(r.size) for r in cat.itertuples()}
    prob_size[-1] = noise_answers
    v["_isnoise"] = noise_mask.astype(int)
    v["_tsize"] = v["theme_code"].map(lambda c: theme_size.get(c, 0))
    v["_psize"] = v["cluster"].map(lambda c: prob_size.get(int(c), 0))
    v = v.sort_values(["_isnoise", "_tsize", "_psize", "rang"], ascending=[True, False, False, True])

    vcols = ["cluster", "theme_code", "theme_label", "problematique", "verbatim", "dup_count"]
    if has_intention:
        vcols.append("intention")
    vcols += ["representativite", "rang"]
    verb_df = v[vcols]

    theme_df.to_csv(config.GRIST_THEMES_CSV, index=False, encoding="utf-8-sig")
    prob_df.sort_values(["theme_code", "nb_reponses"], ascending=[True, False]).to_csv(
        config.GRIST_PROBLEMATIQUES_CSV, index=False, encoding="utf-8-sig")
    verb_df.to_csv(config.GRIST_VERBATIMS_CSV, index=False, encoding="utf-8-sig")
    print(f"-> Grist CSVs : {config.GRIST_THEMES_CSV.name} ({len(theme_df)} thèmes), "
          f"{config.GRIST_PROBLEMATIQUES_CSV.name} ({len(prob_df)} problématiques), "
          f"{config.GRIST_VERBATIMS_CSV.name} ({len(verb_df):,} verbatims)")


def main() -> None:
    if not config.CLUSTERED_PARQUET.exists():
        sys.exit("cache/clustered.parquet missing — run `python -m src.cluster` first.")
    cat_path = config.CATALOG_2LEVEL_CSV
    if not cat_path.exists():
        sys.exit(f"{cat_path} missing — run `python -m src.consolidate` first.")

    df = pd.read_parquet(config.CLUSTERED_PARQUET)
    embeddings = np.load(config.EMBEDDINGS_NPY_READ)
    cat = pd.read_csv(cat_path)
    print(f"{len(df):,} verbatims · {len(cat)} problématiques · {cat['theme_code'].nunique()} thèmes")

    # Representativeness: cosine similarity to the (normalized) cluster centroid.
    emb = normalize(embeddings)
    sim = np.full(len(df), np.nan, dtype=np.float32)
    labels = df["cluster"].to_numpy()
    for c in cat["cluster"].unique():
        idx = np.where(labels == c)[0]
        if len(idx) == 0:
            continue
        centroid = normalize(emb[idx].mean(axis=0, keepdims=True))
        sim[idx] = (emb[idx] @ centroid.T).ravel()
    df["_sim"] = sim

    has_intention = "intention" in df.columns

    # Tabular export for Grist: 3 linked tables (thèmes -> problématiques -> verbatims).
    write_grist_csvs(df, cat, has_intention)

    def verbatim_rows(sub: pd.DataFrame, by_sim: bool) -> list[dict]:
        sub = sub.sort_values("_sim", ascending=False) if by_sim else sub.sort_values("dup_count", ascending=False)
        rows = []
        for r in sub.itertuples():
            row = {"t": r.verbatim, "n": int(r.dup_count)}
            if has_intention:
                row["i"] = INTENTION_CODE.get(str(getattr(r, "intention", "")).lower(), "n")
            rows.append(row)
        return rows

    # Build the theme -> problématique -> verbatims tree.
    cat_by_cluster = {int(r.cluster): r for r in cat.itertuples()}
    theme_order = (cat.groupby("theme_code")["size"].sum().sort_values(ascending=False).index.tolist())
    themes = []
    for tcode in theme_order:
        tc = cat[cat["theme_code"] == tcode]
        tlabel = tc["theme_label"].iloc[0]
        probs = []
        for r in tc.sort_values("size", ascending=False).itertuples():
            sub = df[df["cluster"] == int(r.cluster)]
            probs.append({
                "label": r.label,
                "desc": r.description if isinstance(r.description, str) else "",
                "size": int(r.size),
                "unique": len(sub),
                "verbatims": verbatim_rows(sub, by_sim=True),
            })
        themes.append({"label": tlabel, "code": tcode,
                       "size": int(tc["size"].sum()), "problematiques": probs})

    noise_sub = df[df["cluster"] == -1]
    noise = {"size": int(noise_sub["dup_count"].sum()), "unique": len(noise_sub),
             "verbatims": verbatim_rows(noise_sub, by_sim=False)}

    data = {
        "themes": themes,
        "noise": noise,
        "total_classified": int(cat["size"].sum()),
        "has_intention": has_intention,
    }
    payload = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")
    html = _HTML_TEMPLATE.replace("__DATA__", payload).replace("__DEMARCHE__", config.DEMARCHE or "démarche")
    out = config.EXPLORE_HTML
    out.write_text(html, encoding="utf-8")
    mb = out.stat().st_size / 1e6
    print(f"-> {out}  ({mb:.1f} MB)  — ouvre-le dans un navigateur")


_HTML_TEMPLATE = r"""<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Verbatims par catégorie — __DEMARCHE__</title>
<style>
  :root { --bg:#f6f6f9; --card:#fff; --ink:#1b1b35; --muted:#666; --line:#e3e3ee;
          --accent:#000091; --g:#18753c; --b:#ce0500; --n:#929292; }
  * { box-sizing:border-box; }
  body { margin:0; font:15px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
         color:var(--ink); background:var(--bg); }
  header { position:sticky; top:0; background:var(--card); border-bottom:1px solid var(--line);
           padding:14px 20px; z-index:10; }
  h1 { font-size:18px; margin:0 0 8px; }
  .sub { color:var(--muted); font-size:13px; }
  #q { width:100%; max-width:520px; padding:9px 12px; margin-top:10px; border:1px solid var(--line);
       border-radius:8px; font-size:14px; }
  main { padding:16px 20px 60px; max-width:1100px; margin:0 auto; }
  details { background:var(--card); border:1px solid var(--line); border-radius:10px; margin:8px 0; }
  details[open] { box-shadow:0 1px 4px rgba(0,0,0,.04); }
  summary { cursor:pointer; padding:12px 14px; font-weight:600; list-style:none; display:flex;
            align-items:center; gap:10px; }
  summary::-webkit-details-marker { display:none; }
  summary .chev { transition:transform .15s; color:var(--muted); }
  details[open] > summary .chev { transform:rotate(90deg); }
  .theme > summary { font-size:16px; color:var(--accent); }
  .prob { margin:8px 10px; border-color:var(--line); }
  .prob > summary { font-weight:600; }
  .count { color:var(--muted); font-weight:400; font-size:13px; }
  .desc { color:var(--muted); font-size:13px; padding:0 14px 10px 36px; margin-top:-4px; }
  .vlist { padding:4px 14px 14px; }
  .v { padding:8px 10px; border-top:1px solid var(--line); display:flex; gap:10px; align-items:flex-start; }
  .v:first-child { border-top:none; }
  .dot { width:9px; height:9px; border-radius:50%; margin-top:6px; flex:none; }
  .g{background:var(--g)} .b{background:var(--b)} .n{background:var(--n)}
  .dup { color:var(--muted); font-size:12px; flex:none; min-width:42px; text-align:right; }
  .txt { white-space:pre-wrap; word-break:break-word; }
  mark { background:#fde68a; }
  .noise > summary { color:#8a6d00; }
  .hint { color:var(--muted); font-size:12px; padding:4px 14px; }
  .legend { font-size:12px; color:var(--muted); margin-top:6px; }
  .legend b{font-weight:600;} .sw{display:inline-block;width:9px;height:9px;border-radius:50%;vertical-align:middle;margin:0 3px 0 8px;}
</style>
</head>
<body>
<header>
  <h1>Verbatims par catégorie — __DEMARCHE__</h1>
  <div class="sub" id="meta"></div>
  <input id="q" type="search" placeholder="Rechercher dans tous les verbatims… (min. 3 caractères)">
  <div class="legend" id="legend"></div>
</header>
<main id="root"></main>

<script id="data" type="application/json">__DATA__</script>
<script>
const DATA = JSON.parse(document.getElementById('data').textContent);
const root = document.getElementById('root');
const esc = s => s.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));

let totalUnique = 0, totalAnswers = DATA.total_classified;
DATA.themes.forEach(t => t.problematiques.forEach(p => totalUnique += p.unique));
document.getElementById('meta').textContent =
  `${DATA.themes.length} thèmes · ${DATA.themes.reduce((a,t)=>a+t.problematiques.length,0)} problématiques · `
  + `${totalAnswers.toLocaleString('fr')} réponses classées · ${DATA.noise.unique.toLocaleString('fr')} en bruit`;
if (DATA.has_intention) document.getElementById('legend').innerHTML =
  `Intention : <span class="sw g"></span>positif <span class="sw b"></span>négatif <span class="sw n"></span>neutre · trié par représentativité`;

function vHTML(v, query) {
  let t = esc(v.t);
  if (query) { const re = new RegExp('('+query.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','ig'); t = t.replace(re,'<mark>$1</mark>'); }
  const dot = DATA.has_intention ? `<span class="dot ${v.i||'n'}"></span>` : '';
  const dup = v.n>1 ? `<span class="dup">×${v.n}</span>` : `<span class="dup"></span>`;
  return `<div class="v">${dot}${dup}<span class="txt">${t}</span></div>`;
}

function renderList(container, verbatims, query) {
  // Render in chunks to stay responsive on big clusters.
  container.innerHTML = '';
  let i = 0; const N = verbatims.length;
  (function chunk(){
    const frag = document.createElement('div');
    const end = Math.min(i+500, N);
    let h = ''; for (; i<end; i++) h += vHTML(verbatims[i], query);
    frag.innerHTML = h; container.appendChild(frag);
    if (i<N) requestAnimationFrame(chunk);
  })();
}

function buildTree() {
  root.innerHTML = '';
  DATA.themes.forEach(t => {
    const theme = document.createElement('details'); theme.className='theme';
    theme.innerHTML = `<summary><span class="chev">▶</span>${esc(t.label)} <span class="count">— ${t.size.toLocaleString('fr')} réponses · ${t.problematiques.length} problématiques</span></summary>`;
    t.problematiques.forEach(p => {
      const d = document.createElement('details'); d.className='prob';
      d.innerHTML = `<summary><span class="chev">▶</span>${esc(p.label)} <span class="count">— ${p.size.toLocaleString('fr')} réponses (${p.unique.toLocaleString('fr')} uniques)</span></summary>`
        + (p.desc?`<div class="desc">${esc(p.desc)}</div>`:'')
        + `<div class="vlist"></div>`;
      const list = d.querySelector('.vlist');
      d.addEventListener('toggle', () => { if (d.open && !list.dataset.done) { list.dataset.done='1'; renderList(list, p.verbatims); } }, {once:false});
      theme.appendChild(d);
    });
    root.appendChild(theme);
  });
  // Noise section.
  const noise = document.createElement('details'); noise.className='noise';
  noise.innerHTML = `<summary><span class="chev">▶</span>⚠️ Bruit — non catégorisé <span class="count">— ${DATA.noise.size.toLocaleString('fr')} réponses (${DATA.noise.unique.toLocaleString('fr')} uniques)</span></summary><div class="hint">Verbatims qu'aucun cluster dense n'a captés (trié par fréquence).</div><div class="vlist"></div>`;
  const nlist = noise.querySelector('.vlist');
  noise.addEventListener('toggle', () => { if (noise.open && !nlist.dataset.done){ nlist.dataset.done='1'; renderList(nlist, DATA.noise.verbatims); }});
  root.appendChild(noise);
}

// Global search across everything (capped for performance).
const CAP = 2000;
function search(query) {
  const ql = query.toLowerCase();
  root.innerHTML = '';
  let shown = 0, matches = 0;
  const out = document.createElement('div');
  const all = [];
  DATA.themes.forEach(t => t.problematiques.forEach(p => p.verbatims.forEach(v => all.push([v,`${t.label} › ${p.label}`]))));
  DATA.noise.verbatims.forEach(v => all.push([v,'⚠️ Bruit']));
  let h = '';
  for (const [v,path] of all) {
    if (v.t.toLowerCase().includes(ql)) { matches++;
      if (shown < CAP) { h += `<div class="v"><span class="dup">×${v.n}</span><span class="txt"><span class="count">${esc(path)}</span><br>${(()=>{let t=esc(v.t);const re=new RegExp('('+query.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','ig');return t.replace(re,'<mark>$1</mark>');})()}</span></div>`; shown++; }
    }
  }
  const info = document.createElement('div'); info.className='hint';
  info.textContent = `${matches.toLocaleString('fr')} verbatim(s) contenant « ${query} »` + (matches>CAP?` (affichage limité aux ${CAP} premiers)`:'');
  const box = document.createElement('details'); box.className='prob'; box.open=true;
  box.innerHTML = `<summary><span class="chev">▶</span>Résultats de recherche</summary><div class="vlist">${h}</div>`;
  root.appendChild(info); root.appendChild(box);
}

let timer;
document.getElementById('q').addEventListener('input', e => {
  clearTimeout(timer); const q = e.target.value.trim();
  timer = setTimeout(() => { if (q.length>=3) search(q); else buildTree(); }, 200);
});

buildTree();
</script>
</body>
</html>
"""


if __name__ == "__main__":
    main()
