"""Découverte d'un référentiel À FACETTES depuis les clusters (par démarche).

Contexte (retour DGFIP, juin 2026) : une taxonomie hiérarchique unique mélange trois
axes orthogonaux et devient inexploitable. Un même verbatim relève en fait de plusieurs
dimensions à la fois. Ce script extrait, à partir des clusters déjà découverts, DEUX
référentiels séparés, à faire valider par le porteur de la démarche :

  * AXE A — OBJETS DE LA DÉMARCHE : de QUOI parle l'usager (objet métier concerné,
    spécifique à la démarche : types de revenus, changements de situation familiale…
    pour une déclaration de revenus). Le porteur ne peut en général pas agir dessus
    (règles métier/légales) mais a besoin de segmenter par là.
  * AXE B — THÉMATIQUES SITE : la NATURE de la difficulté rencontrée sur l'outil en
    ligne, indépendante de l'objet métier (ergonomie, parcours, clarté des rubriques,
    aide, pré-remplissage, accessibilité, bugs/lags). C'est l'axe ACTIONNABLE. Amorcé
    sur la liste fournie par le métier (Jules Bonnaud, DGFiP) pour parler leur langue.

La POLARITÉ (positif/négatif/neutre) est un 3e axe, mais il se tague par verbatim à
l'assignation — pas ici (ce n'est pas de la découverte).

Deux passes Albert :
  1. propose_facettes  — voit TOUS les clusters d'un coup, rend les deux listes.
  2. map_cluster       — rattache chaque cluster aux facettes (multi-label, enum) pour
                         la traçabilité + un volume INDICATIF par facette.

⚠️ Les volumes sont indicatifs (somme des clusters rattachés, avec recouvrement entre
axes). Les volumes exacts par facette ne tomberont qu'après la classification
avis-par-avis (un avis pouvant porter un objet ET plusieurs thématiques).

Entrée  : out/<demarche>/catalog_candidate_<tag>[_ctx].csv (de name_clusters)
Sorties : out/<demarche>/facettes_<tag>[_ctx].md   (livrable porteur, 2 listes)
          out/<demarche>/facettes_<tag>[_ctx].csv  (à plat : axe, code, label, …)

Usage:
    DEMARCHE=product-3059 RUN_TAG=mcs200 uv run python -m src.extract_facets
"""

from __future__ import annotations

import json
import sys
import time
import unicodedata

import httpx
import pandas as pd

from . import config

CHAT_URL = f"{config.ALBERT_BASE_URL}/chat/completions"
MAX_RETRIES = 6

# Amorce de l'axe B. Les 7 premières viennent du métier (mail Jules Bonnaud, DGFiP,
# 30/06/2026) ; `assistance_ia` est ajoutée par JDMA (niche stratégique que la passe 1
# avait tendance à fondre dans `aide_support`). Le LLM RÉUTILISE ces items et n'en ajoute
# un que si une thématique site réellement présente dans les verbatims manque.
SEED_THEMATIQUES = [
    ("ergonomie", "Ergonomie / interface",
     "Agencement, lisibilité et ergonomie générale de l'interface."),
    ("parcours", "Parcours utilisateur",
     "Enchaînement des étapes et navigation d'un bout à l'autre de la démarche."),
    ("clarte_rubriques", "Clarté des rubriques",
     "Intitulés, libellés et explications des rubriques/cases : compréhensibles ou non."),
    ("aide_support", "Disponibilité de l'aide (humaine)",
     "Accès à l'aide en ligne, au support ou à un conseiller (téléphone, accueil, guide)."),
    ("assistance_ia", "Assistance par IA / chatbot",
     "Demande ou usage d'une aide AUTOMATISÉE (chatbot, IA) pour guider, simplifier ou "
     "vérifier la déclaration. À NE PAS fondre dans l'aide humaine."),
    ("preremplissage", "Fonction de pré-remplissage",
     "Pré-remplissage des données : présence, exactitude, report d'une année sur l'autre."),
    ("accessibilite", "Accessibilité",
     "Accessibilité pour les publics fragiles (seniors, handicap), lisibilité, langage."),
    ("bugs_lags", "Bugs et lenteurs",
     "Dysfonctionnements techniques, erreurs, lenteurs/lags, indisponibilités."),
]


def _ascii_code(code: str) -> str:
    """Normalise un code en snake_case ASCII (le code sert dans les prompts, ES, la base)."""
    nfkd = unicodedata.normalize("NFKD", code)
    stripped = "".join(c for c in nfkd if not unicodedata.combining(c))
    return stripped.encode("ascii", "ignore").decode("ascii")


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


def _facet_items_schema(name: str) -> dict:
    item = {
        "type": "object", "additionalProperties": False,
        "properties": {
            "code": {"type": "string", "description": "identifiant stable snake_case"},
            "label": {"type": "string", "description": "libellé court"},
            "description": {"type": "string", "description": "1 phrase"},
        },
        "required": ["code", "label", "description"],
    }
    return {
        "type": "json_schema",
        "json_schema": {
            "name": name, "strict": True,
            "schema": {
                "type": "object", "additionalProperties": False,
                "properties": {
                    "objets": {"type": "array", "items": item},
                    "thematiques": {"type": "array", "items": item},
                },
                "required": ["objets", "thematiques"],
            },
        },
    }


def propose_facettes(client: httpx.Client, rows: pd.DataFrame) -> tuple[list[dict], list[dict]]:
    seed_block = "\n".join(f"- {code} : {label} — {desc}" for code, label, desc in SEED_THEMATIQUES)
    system = (
        "Tu es analyste de la voix de l'usager sur une démarche administrative en ligne. "
        "On te donne la liste des problématiques découvertes par clustering (libellé + "
        "description + mots-clés). Tu dois en extraire DEUX référentiels ORTHOGONAUX — un "
        "même verbatim relève souvent des deux à la fois, ne les confonds pas :\n\n"
        "AXE A — OBJETS DE LA DÉMARCHE : de QUOI parle l'usager, l'objet métier concerné, "
        "SPÉCIFIQUE à cette démarche (p. ex. pour une déclaration de revenus : les types de "
        "revenus — fonciers, étrangers, capitaux… — et les changements de situation familiale "
        "— rattachement d'enfant, décès, divorce…). C'est le QUOI, en général non actionnable "
        "par le porteur (règles légales).\n\n"
        "AXE B — THÉMATIQUES SITE : la NATURE de la difficulté rencontrée sur l'OUTIL en ligne, "
        "INDÉPENDANTE de l'objet métier (ergonomie, parcours, clarté des rubriques, aide, "
        "pré-remplissage, accessibilité, bugs/lags). C'est le POURQUOI/COMMENT, l'axe "
        "actionnable.\n\n"
        "Pour l'AXE B, PARS de cette liste de référence fournie par le métier et RÉUTILISE ces "
        "items tels quels (mêmes codes) ; n'AJOUTE un nouvel item que si une thématique site "
        "réellement présente dans les verbatims n'y figure pas ; ne crée jamais de doublon :\n"
        f"{seed_block}\n\n"
        "IMPORTANT — LA POLARITÉ EST UN AXE SÉPARÉ : ne crée AUCUNE thématique de sentiment "
        "(pas de 'satisfaction', 'expérience positive', 'mécontentement', etc.). Le fait qu'un "
        "verbatim soit positif ou négatif est taggé à part, par verbatim ; ce n'est jamais une "
        "thématique site.\n"
        "PRÉSERVE LES NICHES DISTINCTES même si elles sont adjacentes à un item d'amorce : ne "
        "fonds pas dans un item générique une problématique spécifique et clairement présente "
        "(p. ex. l'assistance par IA/chatbot reste distincte de l'aide humaine).\n\n"
        "Règles : listes dédupliquées, granularité homogène, codes en snake_case ASCII strict "
        "(sans accents ni caractères spéciaux). Ne mets AUCUN objet métier dans l'axe B, ni "
        "AUCUNE thématique site dans l'axe A. Fonde-toi uniquement sur les problématiques "
        "fournies, n'invente rien. Réponds via le format structuré."
    )
    system += config.context_block()
    listing = "\n".join(
        f"- [{int(r.size)} réponses] {r.label} : {r.description} (mots-clés : {r.top_terms})"
        for r in rows.itertuples()
    )
    out = _chat_json(client, system, f"Problématiques découvertes :\n{listing}",
                     _facet_items_schema("facettes"))
    return out["objets"], out["thematiques"]


def map_cluster(client: httpx.Client, row, objets: list[dict], themes: list[dict]) -> dict:
    obj_codes = [o["code"] for o in objets]
    th_codes = [t["code"] for t in themes]
    schema = {
        "type": "json_schema",
        "json_schema": {
            "name": "cluster_facets", "strict": True,
            "schema": {
                "type": "object", "additionalProperties": False,
                "properties": {
                    "objets": {"type": "array",
                               "items": {"type": "string", "enum": obj_codes},
                               "description": "0, 1 ou plusieurs objets métier (vide si transverse)"},
                    "thematiques": {"type": "array",
                                    "items": {"type": "string", "enum": th_codes},
                                    "description": "0, 1 ou plusieurs thématiques site (vide si "
                                                   "le cluster ne porte que sur la polarité)"},
                },
                "required": ["objets", "thematiques"],
            },
        },
    }
    obj_block = "\n".join(f"- {o['code']} : {o['label']} — {o['description']}" for o in objets)
    th_block = "\n".join(f"- {t['code']} : {t['label']} — {t['description']}" for t in themes)
    system = (
        "On te donne une problématique découverte et deux référentiels (objets métier, "
        "thématiques site). Indique à quel(s) objet(s) elle se rapporte (VIDE si transverse / "
        "aucun objet métier précis) et à quelle(s) thématique(s) site elle correspond. "
        "Si le cluster n'exprime qu'une satisfaction ou une insatisfaction GLOBALE, sans porter "
        "sur une difficulté précise ni un objet (ex. « parfait », « merci », « nul »), renvoie "
        "objets=[] ET thematiques=[] : il ne relève que de la polarité. Réponds via le format "
        "structuré."
    )
    system += config.context_block()
    user = (
        f"OBJETS disponibles :\n{obj_block}\n\nTHÉMATIQUES SITE disponibles :\n{th_block}\n\n"
        f"Problématique à rattacher :\n{row.label} : {row.description}\n"
        f"(mots-clés : {row.top_terms})"
    )
    return _chat_json(client, system, user, schema)


def main() -> None:
    try:  # console Windows en cp1252 : éviter un crash sur les caractères hors table
        sys.stdout.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):
        pass
    if not config.albert_configured():
        sys.exit("Albert not configured (.env).")
    if config.CONTEXT_ON and not config.DEMARCHE_CONTEXT:
        sys.exit(f"CTX activé mais aucun contexte : crée contexts/{config.DEMARCHE}.txt (blurb factuel).")
    candidate = config.CATALOG_CANDIDATE_CSV
    if not candidate.exists():
        sys.exit(f"{candidate} missing — run `python -m src.name_clusters` first "
                 f"(ou vérifie DEMARCHE/RUN_TAG).")

    print(f"Démarche : {config.DEMARCHE or '(aucune)'} · tag : {config.RUN_TAG or '(none)'} · "
          f"contexte : {'ON (_ctx)' if config.CONTEXT_ON and config.DEMARCHE_CONTEXT else 'off'}")
    rows = pd.read_csv(candidate)
    rows = rows[rows["cluster"] != -1].copy()  # défensif : jamais le bruit
    print(f"{len(rows)} problématiques chargées depuis {candidate.name}")

    seed_codes = {c for c, _, _ in SEED_THEMATIQUES}
    headers = {"Authorization": f"Bearer {config.ALBERT_API_KEY}"}
    with httpx.Client(headers=headers, timeout=120.0) as client:
        print("Passe 1 — extraction des deux référentiels ...")
        objets, themes = propose_facettes(client, rows)
        for item in (*objets, *themes):  # codes ASCII stricts (servent en prompt/ES/base)
            item["code"] = _ascii_code(item["code"])
        print(f"  -> {len(objets)} objets, {len(themes)} thématiques site "
              f"({sum(t['code'] in seed_codes for t in themes)} repris de la liste métier)")

        print("Passe 2 — rattachement de chaque cluster (traçabilité + volumes) ...")
        obj_vol: dict[str, int] = {o["code"]: 0 for o in objets}
        th_vol: dict[str, int] = {t["code"]: 0 for t in themes}
        obj_clusters: dict[str, list] = {o["code"]: [] for o in objets}
        th_clusters: dict[str, list] = {t["code"]: [] for t in themes}
        polarity_only: list[int] = []   # clusters ne relevant que de la polarité (2 axes vides)
        polarity_vol = 0
        for r in rows.itertuples():
            m = map_cluster(client, r, objets, themes)
            for code in m["objets"]:
                if code in obj_vol:
                    obj_vol[code] += int(r.size)
                    obj_clusters[code].append(int(r.cluster))
            for code in m["thematiques"]:
                if code in th_vol:
                    th_vol[code] += int(r.size)
                    th_clusters[code].append(int(r.cluster))
            if not m["objets"] and not m["thematiques"]:
                polarity_only.append(int(r.cluster))
                polarity_vol += int(r.size)
            print(f"  cluster {r.cluster} ({int(r.size):,}) -> objets={m['objets']} "
                  f"thématiques={m['thematiques']}")

    # Purge des facettes fantômes (proposées en passe 1 mais rattachées à aucun cluster).
    dropped = [o["code"] for o in objets if obj_vol[o["code"]] == 0] + \
              [t["code"] for t in themes if th_vol[t["code"]] == 0]
    if dropped:
        print(f"Facettes fantômes purgées (0 cluster rattaché) : {', '.join(dropped)}")
    objets = [o for o in objets if obj_vol[o["code"]] > 0]
    themes = [t for t in themes if th_vol[t["code"]] > 0]
    print(f"Clusters purement polarité (objet vide + thématique vide) : "
          f"{len(polarity_only)} clusters · ~{polarity_vol:,} réponses")

    # --- CSV à plat -----------------------------------------------------------
    records = []
    for o in sorted(objets, key=lambda x: obj_vol[x["code"]], reverse=True):
        records.append({"axe": "objet", "code": o["code"], "label": o["label"],
                        "description": o["description"], "seed": "",
                        "volume_indicatif": obj_vol[o["code"]],
                        "nb_clusters": len(obj_clusters[o["code"]]),
                        "clusters": " ".join(map(str, obj_clusters[o["code"]]))})
    for t in sorted(themes, key=lambda x: th_vol[x["code"]], reverse=True):
        records.append({"axe": "thematique_site", "code": t["code"], "label": t["label"],
                        "description": t["description"],
                        "seed": "métier" if t["code"] in seed_codes else "découvert",
                        "volume_indicatif": th_vol[t["code"]],
                        "nb_clusters": len(th_clusters[t["code"]]),
                        "clusters": " ".join(map(str, th_clusters[t["code"]]))})
    pd.DataFrame.from_records(records).to_csv(config.FACETS_CSV, index=False, encoding="utf-8-sig")

    # --- Markdown (livrable porteur) -----------------------------------------
    with config.FACETS_MD.open("w", encoding="utf-8") as f:
        f.write(f"# Facettes découvertes — {config.DEMARCHE or 'démarche'} "
                f"({config.RUN_TAG or 'run'}{'_ctx' if config.CONTEXT_ON else ''})\n\n")
        f.write(f"**Trois axes orthogonaux** extraits des {len(rows)} problématiques découvertes "
                "par clustering. Un même verbatim se positionne **indépendamment** sur chaque "
                "axe : il peut porter un objet ET une ou plusieurs thématiques ET une polarité — "
                "ou seulement une polarité (avis « tout va bien »), sans objet ni thématique.\n\n")
        f.write("> **Volumes indicatifs** : somme des clusters rattachés à chaque facette, avec "
                "recouvrement possible entre axes. Les volumes exacts par facette ne tomberont "
                "qu'après la classification avis-par-avis (un avis portant un objet + plusieurs "
                "thématiques + une polarité).\n\n")

        f.write("## Axe A — Objets de la démarche\n")
        f.write("*De quoi parle l'usager. Spécifique à la démarche, en général non actionnable "
                "(règles métier/légales), mais utile pour segmenter.*\n\n")
        for o in sorted(objets, key=lambda x: obj_vol[x["code"]], reverse=True):
            f.write(f"### {o['label']} — ~{obj_vol[o['code']]:,} réponses "
                    f"({len(obj_clusters[o['code']])} clusters)\n")
            f.write(f"`{o['code']}` — {o['description']}\n\n")

        f.write("## Axe B — Thématiques site *(axe actionnable)*\n")
        f.write("*Nature de la difficulté sur l'outil, indépendante de l'objet métier. "
                "⭐ = repris de la liste de référence (métier DGFiP + JDMA) ; 🔍 = émergé des "
                "verbatims.*\n\n")
        for t in sorted(themes, key=lambda x: th_vol[x["code"]], reverse=True):
            mark = "⭐" if t["code"] in seed_codes else "🔍"
            f.write(f"### {mark} {t['label']} — ~{th_vol[t['code']]:,} réponses "
                    f"({len(th_clusters[t['code']])} clusters)\n")
            f.write(f"`{t['code']}` — {t['description']}\n\n")

        f.write("## Axe C — Polarité *(taggée par verbatim)*\n")
        f.write("*Sentiment de l'usager, INDÉPENDANT de l'objet et de la thématique — c'est ce "
                "qui règle le mélange positif/négatif remonté par la DGFiP. Valeurs fixes, "
                "attribuées à l'assignation avis-par-avis (pas au niveau cluster, un même "
                "cluster contenant du positif ET du négatif).*\n\n")
        f.write("- `positif` — l'usager exprime une satisfaction / un retour favorable.\n")
        f.write("- `negatif` — l'usager exprime une difficulté / une insatisfaction.\n")
        f.write("- `neutre` — constat, question ou suggestion sans charge affective nette.\n\n")
        f.write(f"> Indicateur de découverte : **{len(polarity_only)} clusters** "
                f"(~{polarity_vol:,} réponses) ne portent QUE la polarité — que de la "
                "satisfaction/insatisfaction globale, sans objet ni thématique. Ces avis "
                "n'auront qu'un tag de polarité (c'est normal et voulu).\n")

    print(f"\n-> {config.FACETS_MD}\n-> {config.FACETS_CSV}")
    print(f"   {len(objets)} objets · {len(themes)} thématiques site "
          f"· {len(polarity_only)} clusters purement polarité")


if __name__ == "__main__":
    main()
