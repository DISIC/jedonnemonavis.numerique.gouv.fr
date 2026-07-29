"""Page HTML autonome pour naviguer/filtrer les avis assignés aux facettes.

Lit assignments_<tag>.csv (de src.assign_facets) + facettes_<tag>.csv (pour les libellés)
et écrit une page autoportante : liste des avis avec leurs facettes (objet / thématiques /
polarité), recherche plein-texte, filtres par facette (OU dans un axe, ET entre axes) avec
compteurs dynamiques, et tri.

Deux modes :
  * (défaut)  page AUTONOME, données JSON embarquées, aucun appel réseau.
  * --grist   Custom Widget Grist : lit la table LIÉE en direct via l'API Grist
              (grist.onRecords), sans données embarquées → les verbatims restent dans Grist.
La logique de filtre/rendu est identique dans les deux cas.

Usage:
    DEMARCHE=product-3059 RUN_TAG=mcs200 uv run python scripts/assign_html.py           # autonome
    DEMARCHE=product-3059 RUN_TAG=mcs200 uv run python scripts/assign_html.py --grist    # widget Grist
"""

from __future__ import annotations

import argparse
import json
import sys

import pandas as pd

from src import config


def _sfx() -> str:
    return (f"_{config.RUN_TAG}" if config.RUN_TAG else "") + ("_ctx" if config.CONTEXT_ON else "")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--grist", action="store_true",
                    help="Génère la variante Custom Widget Grist (lit la table liée en direct).")
    args = ap.parse_args()

    assign_csv = config.OUT_DIR / f"assignments{_sfx()}.csv"
    if not assign_csv.exists():
        sys.exit(f"{assign_csv} introuvable — lance d'abord `python -m src.assign_facets`.")
    if not config.FACETS_CSV.exists():
        sys.exit(f"{config.FACETS_CSV} introuvable — lance d'abord `python -m src.extract_facets`.")

    fac = pd.read_csv(config.FACETS_CSV)
    obj_labels = dict(zip(fac[fac.axe == "objet"].code, fac[fac.axe == "objet"].label))
    th_labels = dict(zip(fac[fac.axe == "thematique_site"].code, fac[fac.axe == "thematique_site"].label))

    df = pd.read_csv(assign_csv).fillna("")
    reviews = [{
        "v": str(r.verbatim),
        "dup": int(r.dup_count) if str(r.dup_count).isdigit() else 1,
        "obj": [c for c in str(r.objets).split() if c],
        "th": [c for c in str(r.thematiques).split() if c],
        "pol": str(r.polarite),
    } for r in df.itertuples()]

    data = json.dumps({"reviews": reviews, "objLabels": obj_labels, "thLabels": th_labels},
                      ensure_ascii=False).replace("</", "<\\/")  # ne pas casser sur un </script> dans un verbatim
    tag = config.RUN_TAG + ("_ctx" if config.CONTEXT_ON else "")
    title = f"Avis × facettes — {config.DEMARCHE or 'démarche'} ({tag or 'run'})"

    page = r"""<!doctype html>
<html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>__TITLE__</title>
__HEAD_EXTRA__
<style>
  :root{--blue:#000091;--obj:#0063CB;--th:#18753C;--pos:#18753C;--neg:#CE0500;--neu:#666;--line:#e2e2e6;}
  *{box-sizing:border-box;}
  body{font-family:"Marianne",system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
    margin:0;color:#161616;background:#f4f4f8;line-height:1.5;}
  header{background:var(--blue);color:#fff;padding:18px 28px;}
  header h1{margin:0 0 3px;font-size:19px;}
  header p{margin:0;opacity:.82;font-size:12.5px;max-width:920px;}
  .toolbar{position:sticky;top:0;z-index:6;background:#fff;border-bottom:1px solid var(--line);
    padding:11px 28px;display:flex;flex-wrap:wrap;gap:12px;align-items:center;box-shadow:0 2px 8px rgba(0,0,0,.05);}
  .search{flex:1 1 260px;position:relative;}
  .search input{width:100%;padding:8px 12px 8px 32px;border:1px solid #ccc;border-radius:6px;font-size:14px;}
  .search::before{content:"🔍";position:absolute;left:10px;top:7px;font-size:13px;opacity:.6;}
  .toolbar select{padding:7px 9px;border:1px solid #ccc;border-radius:6px;font-size:13px;background:#fff;}
  .toolbar label{font-size:12px;color:#666;margin-right:4px;}
  .counter{font-weight:700;font-size:13.5px;white-space:nowrap;}
  #reset{border:1px solid #ccc;background:#fff;border-radius:6px;padding:6px 11px;cursor:pointer;font-size:12.5px;}
  #reset[hidden]{display:none;}
  .filters{background:#fff;border-bottom:1px solid var(--line);padding:6px 28px 12px;}
  .fgroup{border-top:1px solid #f0f0f3;padding:9px 0 4px;}
  .fgroup:first-child{border-top:none;}
  .fhead{display:flex;align-items:center;gap:8px;cursor:pointer;user-select:none;}
  .fhead h3{margin:0;font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:#555;}
  .fhead .caret{font-size:10px;color:#999;transition:transform .15s;}
  .fgroup.collapsed .caret{transform:rotate(-90deg);}
  .fgroup.collapsed .chips{display:none;}
  .fhead .active-badge{font-size:11px;background:var(--blue);color:#fff;border-radius:9px;padding:0 6px;}
  .chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:7px;max-height:132px;overflow:auto;}
  .chip{border:1px solid #ccc;background:#fff;border-radius:16px;padding:3px 11px;font-size:12.5px;
    cursor:pointer;user-select:none;transition:all .1s;white-space:nowrap;}
  .chip .n{opacity:.55;font-size:11px;margin-left:4px;}
  .chip:hover{border-color:#888;}
  .chip.zero{opacity:.32;cursor:default;pointer-events:none;}
  .chip.on{color:#fff;border-color:transparent;}
  .chips[data-axis=obj] .chip.on{background:var(--obj);}
  .chips[data-axis=th] .chip.on{background:var(--th);}
  .chip.on.pos{background:var(--pos);}.chip.on.neg{background:var(--neg);}.chip.on.neu{background:var(--neu);}
  #list{padding:16px 28px 44px;display:flex;flex-direction:column;gap:11px;}
  .card{background:#fff;border-radius:8px;padding:12px 15px;border-left:5px solid #ccc;box-shadow:0 1px 3px rgba(0,0,0,.07);}
  .card.pos{border-left-color:var(--pos);}.card.neg{border-left-color:var(--neg);}.card.neu{border-left-color:var(--neu);}
  .v{font-size:14.5px;margin-bottom:9px;white-space:pre-wrap;}
  .v mark{background:#fde68a;padding:0 1px;border-radius:2px;}
  .dup{font-size:11px;color:#fff;background:#8b8b96;border-radius:10px;padding:1px 7px;margin-left:6px;vertical-align:middle;}
  .badges{display:flex;flex-wrap:wrap;gap:6px;}
  .b{font-size:12px;border-radius:4px;padding:2px 9px;color:#fff;}
  .b.obj{background:var(--obj);}.b.th{background:var(--th);}
  .b.pol.pos{background:var(--pos);}.b.pol.neg{background:var(--neg);}.b.pol.neu{background:var(--neu);}
  .empty{color:#999;font-style:italic;padding:44px;text-align:center;}
</style></head><body>
<header>
  <h1>Avis × facettes — __DEMARCHE__ <span style="opacity:.7">(__TAG__)</span></h1>
  <p>Chaque avis classé sur 3 axes indépendants (objet · thématique site · polarité).
  Recherche + filtres : OU au sein d'un axe, ET entre axes. Échantillon de démonstration — proportions non représentatives.</p>
</header>
<div class="toolbar">
  <div class="search"><input id="q" type="search" placeholder="Rechercher dans les verbatims…" autocomplete="off"></div>
  <span><label for="sort">Tri</label><select id="sort">
    <option value="orig">Ordre d'origine</option>
    <option value="pol">Par polarité</option>
    <option value="long">Longueur (décroissant)</option>
  </select></span>
  <span class="counter" id="counter"></span>
  <button id="reset" hidden>Réinitialiser</button>
</div>
<div class="filters" id="filters"></div>
<div id="list"></div>
<script>
let DATA = __DATA_INIT__;
// Mode widget Grist : les ChoiceList arrivent en ["L", …] ; on mappe les enregistrements
// vers la même forme que le mode autonome. Les libellés stockés dans Grist servent d'identité.
function stripL(v){return Array.isArray(v)?v.filter(x=>x!=='L'):(v?String(v).split(',').map(s=>s.trim()).filter(Boolean):[]);}
function mapRecs(recs){
  const KEYS=['positif','negatif','neutre'];
  const reviews=recs.map(r=>({v:r.verbatim||'',dup:r.dup_count||1,obj:stripL(r.objets),
    th:stripL(r.thematiques),pol:KEYS.includes(r.polarite)?r.polarite:'neutre'}));
  const objLabels={},thLabels={};
  reviews.forEach(r=>{r.obj.forEach(o=>objLabels[o]=o);r.th.forEach(t=>thLabels[t]=t);});
  return {reviews,objLabels,thLabels};
}
const POL={positif:['pos','positif'],negatif:['neg','négatif'],neutre:['neu','neutre']};
const active={obj:new Set(),th:new Set(),pol:new Set()};
let query='';
const norm=s=>(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');

function hasFacet(r,axis,code){return axis==='pol'?r.pol===code:r[axis].includes(code);}
function passAxis(r,axis){const s=active[axis];return !s.size||[...s].some(c=>hasFacet(r,axis,c));}
function passSearch(r){return !query||norm(r.v).includes(query);}
function pass(r){return passSearch(r)&&passAxis(r,'obj')&&passAxis(r,'th')&&passAxis(r,'pol');}
// compteur dynamique : combien de résultats si on ajoutait ce chip, vu les AUTRES axes + la recherche
function dynCount(axis,code){return DATA.reviews.filter(r=>{
  if(!passSearch(r))return false;
  for(const a of ['obj','th','pol'])if(a!==axis&&!passAxis(r,a))return false;
  return hasFacet(r,axis,code);}).length;}

function chipsHtml(axis,codes,labelOf){
  return codes.map(c=>{const n=dynCount(axis,c);const on=active[axis].has(c);
    const extra=axis==='pol'?' '+POL[c][0]:'';
    return `<span class="chip${on?' on':''}${!n&&!on?' zero':''}${extra}" data-axis="${axis}" data-code="${c}">`+
           `${labelOf(c)}<span class="n">${n}</span></span>`;}).join('');}

function buildFilters(){
  const objCodes=Object.keys(DATA.objLabels).sort((a,b)=>dynCount('obj',b)-dynCount('obj',a));
  const thCodes=Object.keys(DATA.thLabels).sort((a,b)=>dynCount('th',b)-dynCount('th',a));
  const polCodes=Object.keys(POL);
  const grp=(axis,label,html)=>{const na=active[axis].size;const collapsed=axis==='obj'&&!na?' collapsed':'';
    return `<div class="fgroup${collapsed}" data-axis="${axis}"><div class="fhead"><span class="caret">▾</span>`+
      `<h3>${label}</h3>${na?`<span class="active-badge">${na}</span>`:''}</div>`+
      `<div class="chips" data-axis="${axis}">${html}</div></div>`;};
  document.getElementById('filters').innerHTML=
    grp('pol','Polarité',chipsHtml('pol',polCodes,c=>POL[c][1]))+
    grp('th','Thématique site',chipsHtml('th',thCodes,c=>DATA.thLabels[c]))+
    grp('obj','Objet',chipsHtml('obj',objCodes,c=>DATA.objLabels[c]));
  document.querySelectorAll('.chip:not(.zero)').forEach(el=>el.onclick=()=>{
    const {axis,code}=el.dataset;active[axis].has(code)?active[axis].delete(code):active[axis].add(code);
    buildFilters();render();});
  document.querySelectorAll('.fhead').forEach(h=>h.onclick=e=>{
    if(e.target.classList.contains('chip'))return;h.parentElement.classList.toggle('collapsed');});
  const anyFilter=active.obj.size||active.th.size||active.pol.size||query;
  document.getElementById('reset').hidden=!anyFilter;
}

function mark(text){if(!query)return document.createTextNode(text);
  const frag=document.createDocumentFragment();const nt=norm(text);let i=0,idx;
  while((idx=nt.indexOf(query,i))>=0){frag.appendChild(document.createTextNode(text.slice(i,idx)));
    const m=document.createElement('mark');m.textContent=text.slice(idx,idx+query.length);frag.appendChild(m);
    i=idx+query.length;}
  frag.appendChild(document.createTextNode(text.slice(i)));return frag;}

function render(){
  const list=document.getElementById('list');list.innerHTML='';
  let shown=DATA.reviews.filter(pass);
  const sort=document.getElementById('sort').value;
  if(sort==='pol'){const o={negatif:0,neutre:1,positif:2};shown.sort((a,b)=>o[a.pol]-o[b.pol]);}
  else if(sort==='long'){shown.sort((a,b)=>b.v.length-a.v.length);}
  document.getElementById('counter').textContent=`${shown.length} / ${DATA.reviews.length} avis`;
  if(!shown.length){list.innerHTML='<div class="empty">Aucun avis pour ces critères.</div>';return;}
  shown.forEach(r=>{
    const card=document.createElement('div');card.className='card '+POL[r.pol][0];
    const v=document.createElement('div');v.className='v';v.appendChild(mark(r.v));
    if(r.dup>1){const d=document.createElement('span');d.className='dup';d.textContent='×'+r.dup;v.appendChild(d);}
    const badges=document.createElement('div');badges.className='badges';
    r.obj.forEach(c=>badges.insertAdjacentHTML('beforeend',`<span class="b obj">${DATA.objLabels[c]||c}</span>`));
    r.th.forEach(c=>badges.insertAdjacentHTML('beforeend',`<span class="b th">${DATA.thLabels[c]||c}</span>`));
    badges.insertAdjacentHTML('beforeend',`<span class="b pol ${POL[r.pol][0]}">${POL[r.pol][1]}</span>`);
    card.appendChild(v);card.appendChild(badges);list.appendChild(card);});
}

document.getElementById('q').addEventListener('input',e=>{query=norm(e.target.value);buildFilters();render();});
document.getElementById('q').addEventListener('keydown',e=>{if(e.key==='Escape'){e.target.value='';query='';buildFilters();render();}});
document.getElementById('sort').addEventListener('change',render);
document.getElementById('reset').addEventListener('click',()=>{
  Object.values(active).forEach(s=>s.clear());query='';document.getElementById('q').value='';buildFilters();render();});
__BOOT__
</script>
</body></html>"""

    if args.grist:
        head_extra = '<script src="https://docs.getgrist.com/grist-plugin-api.js"></script>'
        data_init = "{reviews:[],objLabels:{},thLabels:{}}"
        boot = ("grist.ready({requiredAccess:'read table'});"
                "grist.onRecords(recs=>{DATA=mapRecs(recs);buildFilters();render();});")
    else:
        head_extra, data_init, boot = "", data, "buildFilters();render();"

    page = (page.replace("__TITLE__", title).replace("__DEMARCHE__", config.DEMARCHE or "démarche")
                .replace("__TAG__", tag or "run").replace("__HEAD_EXTRA__", head_extra)
                .replace("__BOOT__", boot).replace("__DATA_INIT__", data_init))
    out = config.OUT_DIR / f"assignments{_sfx()}{'_widget' if args.grist else ''}.html"
    out.write_text(page, encoding="utf-8")
    mode = "widget Grist (lecture live)" if args.grist else "autonome"
    print(f"-> {out}  ({len(reviews)} avis, mode {mode})")


if __name__ == "__main__":
    main()
