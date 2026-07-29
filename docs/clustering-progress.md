# Découverte de catégories par clustering — journal d'avancement

> Suivi du chantier « **découverte non-supervisée de catégories de verbatims** » (Phase 2).
> Objectif : faire **émerger les catégories depuis les données elles-mêmes**, et non depuis
> des connaissances métier figées à la main (ce que fait déjà la Phase 1, cf.
> [`classification-progress.md`](./classification-progress.md)).
> Mettre à jour ce fichier à chaque étape livrée.

- **Emplacement du code** : `analysis/verbatim-clustering/` (dossier d'analyse **offline**,
  hors des apps Next.js). N'écrit jamais en base et ne touche pas la prod.
- **Statut** : preuve de concept **concluante** — pipeline complet livré et exécuté de bout
  en bout sur des données réelles.

---

## 0. TL;DR (pour présentation)

On a pris **un seul service très utilisé** (la **déclaration de revenus**, ~77 000 verbatims
sur 6 mois), et **sans aucune catégorie prédéfinie**, on a laissé un algorithme regrouper les
commentaires qui « se ressemblent ». Résultat : **28 groupes (clusters) cohérents**, que l'IA a
ensuite **nommés automatiquement**. On y retrouve les grands thèmes attendus (complexité,
satisfaction, support) **et surtout des problématiques fines et concrètes** qu'une liste écrite
à la main n'aurait pas devinées :

- Annexes **2044 / 2042-C** (revenus fonciers) · **Prélèvement à la source** · **Frais réels**
- **Rattachement / enfants à charge** · **Revenus étrangers** (frontaliers, non-résidents)
- **Dons aux associations** · **Services à la personne** · **Changement d'adresse**
- **Double déclaration post-décès** · **Inclusion numérique des seniors** · **Auto-entrepreneurs**

Autrement dit : la donnée nous dit *de quoi les usagers parlent vraiment*, à partir de quoi on
peut bâtir (ou corriger) le catalogue métier au lieu de le deviner.

---

## 0 bis. Journal des runs par démarche

Suivi des démarches passées dans la pipeline. Chaque run vit dans `analysis/verbatim-clustering/
out/<demarche>/` (sorties) et `cache/<demarche>/` (intermédiaires). `min_samples=10` (défaut)
partout. Les CSV Grist (`themes/problematiques/verbatims_<tag>.csv`) sont générés par
`explore_page` pour chaque tag listé.

### `product-3059` — Déclaration de revenus (6 derniers mois)
70 478 verbatims uniques / 76 789 réponses.

| Tag | min_cluster_size | Clusters → Thèmes | % bruit | Note |
| --- | --- | --- | --- | --- |
| `mcs500` | 500 | 28 → 11 | 30,7 % | 1ère vue d'ensemble |
| `mcs200` | 200 | 77 → 11 | 37,7 % | **granularité fine retenue** |
| `noise500` | 100 (sur le résidu) | 46 → 13 | 42 % | repasse sur le bruit de mcs500 (21 604 uniques) |

### `product-2278` — DossierFacile / dossier locatif (tout l'historique)
3 931 verbatims uniques / 4 011 réponses (sur 8 840 avis — beaucoup sans verbatim).
Balayage : mcs20 = 35 clusters / 36,4 % bruit · mcs30 = 26 / 34,6 % · mcs50 = 16 / 31,7 %.

| Tag | min_cluster_size | Clusters → Thèmes | % bruit | Note |
| --- | --- | --- | --- | --- |
| `mcs30` | 30 | 26 → 11 | 34,6 % | **retenu** (profil proche du mcs500 de 3059) |
| `mcs30_ctx` | 30 | 26 → 10 | 34,6 % | variante contextualisée (mêmes clusters) |

**Pas de repasse bruit pour 2278** : le bruit (1 361 uniques / 1 383 réponses) est trop petit pour
re-clusteriser utilement (vs 21 604 pour 3059) → pas d'étape de fusion ; le contexte est appliqué
directement sur mcs30. **Effet du contexte plus net qu'attendu** : le détail « dossier validé par
des agents avant partage » a fait émerger un thème « Délais et blocages dans la validation » (522)
là où la version sans contexte l'éparpillait — gain métier réel.

Thèmes mcs30 (volume) : Satisfaction (830) · Dossiers partagés (295) · Redondance documentaire
(291) · Garanties/garants Visale (225) · Délais & rigidité (214) · Manque de feedback (202) ·
Technique/ergonomie (183) · Complexité des démarches (172) · Adoption par intermédiaires (77) ·
Urgence logement (71) · Accès/partage bloqués (68).

### `product-1690` — CESU / URSSAF (1 an)
29 682 verbatims uniques / 37 000 réponses (sur 37 019 avis ; 1 an). Bruit notablement bas
(~22-24 %, corpus bien structuré). Balayage : mcs100 = 56 clusters / 22,7 % bruit ·
mcs150 = 41 / 22,5 % · mcs250 = 29 / 23,8 %.

| Tag | min_cluster_size | Clusters → Thèmes | % bruit | Note |
| --- | --- | --- | --- | --- |
| `mcs100` | 100 | 56 → 10 | 22,7 % | **retenu** (granularité fine, bruit bas) |

Thèmes mcs100 (volume) : Satisfaction & reconnaissance (17 602) · Exonérations / régimes
spécifiques (3 528) · Saisie & pré-remplissage (2 140) · Connexion/authentification (1 807) ·
Ergonomie & visibilité (817) · Accessibilité seniors (795) · Accès au support humain (794) ·
Compréhension prélèvements/charges (787) · Validations & pertes de données (674) ·
Uniformisation de l'expérience (547).

### `product-3354` — Contact Police Nationale / tchat (tout l'historique)
5 356 verbatims uniques / 5 549 réponses (sur ~13 000 avis ; tout l'historique).
Balayage : mcs30 = 25 clusters / 30,4 % bruit · mcs50 = 13 / 19,8 % · mcs80 = 11 / 22,3 %.

| Tag | min_cluster_size | Clusters → Thèmes | % bruit | Note |
| --- | --- | --- | --- | --- |
| `mcs30` | 30 | 25 → 12 | 30,4 % | **retenu** (granularité ; mcs50 dispo si vue plus ramassée) |

Thèmes mcs30 (volume) : Satisfaction globale (1 722) · Gratitude envers les agents (391) ·
Expérience positive du tchat (340) · Réponses insuffisantes/absentes (330) · Inefficacité &
absence de suivi (257) · Chaos des canaux de signalement (188) · Harcèlement & impunité (137) ·
Interruptions brutales du tchat (137) · Attente d'un impact concret (129) · Redirection vers le
17 (115) · Accès restreint aux démarches (97) · Humain vs automatisé (61).

### `product-1789` — CAF / prime d'activité (2 ans)
27 976 verbatims uniques / 32 891 réponses (sur 32 902 avis ; 2 ans). Déclaration de ressources,
pré-remplissage, droit à la prime d'activité. Balayage : mcs100 = 49 clusters / 30,9 % bruit ·
mcs150 = 42 / 30,1 % · mcs250 = 28 / 28,5 %.

| Tag | min_cluster_size | Clusters → Thèmes | % bruit | Note |
| --- | --- | --- | --- | --- |
| `mcs100` | 100 | 49 → 10 | 30,9 % | run de base (sans contexte) |
| `noise100` | 50 (sur le bruit) | 34 → … | 21,4 % (du sous-ens.) | repasse bruit (récupère ~78 %) |
| `merged100` | — | 23 → 10 | **6,0 %** | **fusion retenue** (mcs100 + noise100) |

Repasse bruit **rentable** (bruit de 8 652 uniques, assez gros). Fusion `merged100` : 83 sources
(49 + 34) → 23 problématiques / 10 thèmes, bruit **30,9 % → 6,0 %**. Fusion assez agressive (le bruit
CAF recoupe beaucoup les thèmes connus) ; émergence notable : thème « Stress & anxiété » (782).
Variante avec contexte non faite (en attente du blurb 1789).

Thèmes mcs100 (volume) : Satisfaction & reconnaissance (6 782) · Déclaration automatisée/pré-remplie
(4 303) · Ergonomie & fluidité (2 927) · Clarté & accessibilité de l'info (1 879) · Incompréhension
des droits/mécanismes (1 750) · Barrières techniques & maîtrise numérique (1 638) · Support humain
(1 564) · Absence de feedback (971) · Revenus & cas spécifiques (964) · Montants fiscaux vs sociaux (658).

---

## 1. Le principe général

La chaîne suit une approche classique et éprouvée de *topic modeling* moderne (la même idée que
l'outil open-source **BERTopic**), en 6 temps :

```
  Verbatims (texte)
        │
   1.   ├─ Extraction + nettoyage        → des phrases propres, dédupliquées
   2.   ├─ Embeddings (vectorisation)    → chaque phrase devient un vecteur de 1024 nombres
   3.   ├─ Réduction de dimension (UMAP) → 1024 → 5 dimensions, en gardant la structure
   4.   ├─ Clustering (HDBSCAN)          → regroupe les vecteurs proches, isole le « bruit »
   5.   ├─ Mots caractéristiques (c-TF-IDF) + exemples représentatifs par groupe
   6.   └─ Nommage automatique (LLM Albert) → un libellé + une description par groupe
        │
        ▼
  Catalogue candidat (thème → problématique), à valider par un humain
```

Chaque étape est détaillée ci-dessous avec **l'outil utilisé** et **le concept** sous-jacent.

---

## 2. Étape par étape

### Étape 1 — Extraction & nettoyage
**Outil** : requête SQL exécutée dans **DBeaver** sur la base de prod → export **CSV** ;
script `src/clean.py` (Python, `pandas`).

**Ce qu'on fait** : on extrait les verbatims (champ libre des avis, `Answer.field_code =
'verbatim'`) pour la démarche « déclaration de revenus » (`product_id = 3059`) sur les
6 derniers mois. Puis on nettoie : on retire les commentaires trop courts (< 5 caractères) et
on **déduplique**.

> **Concept — la déduplication pondérée.** Les verbatims contiennent énormément de répétitions
> triviales (« merci », « RAS », « parfait »…). Si on les gardait tels quels, ces répétitions
> écraseraient l'analyse. On ne garde donc **qu'un exemplaire de chaque texte identique**, mais
> on mémorise **combien de fois il apparaît** (`dup_count`). On garde ainsi la vraie volumétrie
> sans laisser le bruit dominer.

**Résultat** : 76 805 lignes brutes → **70 478 verbatims uniques** (représentant 76 789 avis).

### Étape 2 — Embeddings (vectorisation du texte)
**Outil** : **API Albert** (DINUM, souveraine), modèle **`openweight-embeddings` = bge-m3**
(multilingue, bon en français) ; script `src/embed.py`.

> **Concept — qu'est-ce qu'un embedding ?** Un *embedding* transforme une phrase en une liste de
> nombres (ici **1024 nombres**, un « vecteur »). La propriété magique : deux phrases de **sens
> proche** donnent deux vecteurs **proches dans l'espace**, même si elles n'emploient pas les
> mêmes mots (« c'est compliqué » et « pas simple du tout » se retrouvent côte à côte). C'est ce
> qui permet ensuite de regrouper par **sens** et pas par mots-clés.

On utilise **le même modèle d'embeddings que la classification de prod** → les découvertes sont
directement transposables dans le système existant.

> **Détails techniques** : appels par **paquets de 64** verbatims (plafond imposé par Albert),
> avec **mise en cache sur disque** (on ne recalcule jamais un embedding) et **limitation de
> débit** pour rester sous le quota. 70 478 verbatims = ~1 100 requêtes, ~12 min.

**Résultat** : une matrice de **70 478 × 1024** nombres.

### Étape 3 — Réduction de dimension (UMAP)
**Outil** : **UMAP** (*Uniform Manifold Approximation and Projection*), bibliothèque `umap-learn`.

> **Concept — pourquoi réduire ?** Regrouper des points en **1024 dimensions** fonctionne mal :
> en très grande dimension, tous les points semblent « également loin » les uns des autres
> (c'est la *malédiction de la dimension*). UMAP **projette** les 1024 dimensions vers **5
> dimensions** en s'efforçant de **préserver le voisinage** : ce qui était proche le reste, ce
> qui était loin le reste. On obtient un espace compact où les groupes deviennent nets.

### Étape 4 — Clustering (HDBSCAN)
**Outil** : **HDBSCAN** (*Hierarchical Density-Based Spatial Clustering*), bibliothèque `hdbscan`.

> **Concept — clustering par densité.** HDBSCAN cherche les **zones denses** de points (beaucoup
> de verbatims très semblables) et en fait des clusters. Ses deux atouts décisifs ici :
> 1. **Il n'a pas besoin qu'on lui dise combien de groupes chercher** — il les découvre. (C'est
>    le cœur du « depuis les données ».)
> 2. **Il sait dire « je ne sais pas »** : les points isolés, qui n'appartiennent à aucune zone
>    dense, sont étiquetés **bruit** plutôt que rangés de force. Notre taux de bruit (~31 %)
>    correspond à la longue traîne des commentaires uniques ou très divers.
>
> Le réglage principal est **`min_cluster_size`** : la taille minimale d'un groupe. Plus il est
> grand, moins on a de clusters (mais plus gros / plus généraux) ; plus il est petit, plus on a
> de clusters fins (au risque de sur-fragmenter).

### Étape 5 — Description des clusters (mots-clés + exemples)
**Outil** : `src/cluster.py` (scikit-learn).

- **Mots caractéristiques — c-TF-IDF.**
  > **Concept.** Le TF-IDF classique mesure quels mots sont importants dans *un document*. La
  > variante **c-TF-IDF** (*class-based*) traite **chaque cluster comme un seul gros document** et
  > répond à : « quels mots sont **typiques de ce cluster** par rapport à tous les autres ? » Ça
  > donne, pour chaque groupe, sa **signature lexicale** (ex. cluster 6 → *2044, annexe, fonciers,
  > biens, location*). On pondère par `dup_count` pour refléter la vraie fréquence.

- **Exemples représentatifs.**
  > **Concept.** Pour chaque cluster on calcule son **centre de gravité** (le vecteur moyen), puis
  > on prend les verbatims **les plus proches de ce centre** (mesure de **similarité cosinus**).
  > Ce sont les commentaires les plus « typiques » du groupe — parfaits pour comprendre/illustrer.

### Étape 6 — Nommage automatique (LLM)
**Outil** : **API Albert**, modèle de chat **`openweight-small`**, sortie **JSON structurée** ;
script `src/name_clusters.py`.

> **Concept.** On donne à l'IA, pour chaque cluster, ses **mots caractéristiques + 8 exemples**,
> et on lui demande de renvoyer un **libellé court**, une **description en une phrase**, et un
> **thème parent**. La sortie est contrainte au format JSON (pas de texte libre) → exploitable
> directement. C'est ce qui transforme « le cluster n°6 » en « *Complexité des annexes 2044 pour
> revenus fonciers* ».

**Résultat** : `out/catalog_candidate.csv` — le **catalogue candidat** découvert.

---

## 3. Résultats obtenus

### Balayage de granularité (réglage `min_cluster_size`)
On a comparé 3 réglages (l'embedding étant en cache, c'est quasi gratuit) :

| `min_cluster_size` | nb de clusters | % de bruit |
| --- | --- | --- |
| **500** (vue d'ensemble) | **28** | 30,7 % |
| 200 (équilibré) | 77 | 37,7 % |
| 100 (fin) | 118 | 38,4 % |

Premier catalogue : mcs=500 / 28 clusters. **Base retenue ensuite : mcs=200 / 77 clusters**
(cf. §4 quater) — la granularité fine capte des catégories de niche noyées dans le bruit à
mcs=500, et la consolidation les replie en thèmes parents propres.

### Exemples de catégories découvertes (mcs=500)

| Réponses | Problématique découverte | Thème (auto) |
| --- | --- | --- |
| 5 364 | Expérience positive de simplicité | Satisfaction |
| 5 136 | **Complexité des annexes 2044/2042-C (revenus fonciers)** | Ergonomie des formulaires |
| 4 453 | Formulaire « trop compliqué / pas clair » | Compréhension |
| 3 723 | Déclaration de plus en plus compliquée au fil des ans | Compréhension |
| 2 797 | **Compréhension du prélèvement à la source** | Clarté |
| 2 198 | **Localisation des dons aux associations** | Parcours |
| 2 080 | Satisfaction du contact téléphonique / agent | Relation humaine |
| 2 059 | **Inclusion numérique des seniors** | Accessibilité |
| 1 581 | **Rattachement / enfants à charge** | Règles familiales |
| 1 151 | **Revenus étrangers (frontaliers, non-résidents)** | Cas particuliers |
| 1 086 | **Changement d'adresse non géré** | Données personnelles |
| 1 081 | **Frais réels** | Navigation |
| 629 | **Double déclaration post-décès** | Situations familiales |
| 582 | **Auto-entrepreneurs / indépendants** | Cas particuliers |

(catalogue complet dans `out/catalog_candidate.csv` ; rapports détaillés avec exemples dans
`out/clusters_mcs500.md`, `_mcs200.md`, `_mcs100.md` ; carte 2D interactive dans `out/scatter.html`.)

### Lecture
- Les grands axes **recoupent** le catalogue métier (complexité, satisfaction, support).
- Mais la donnée fait émerger **~10 problématiques spécifiques et actionnables** (2044, dons,
  prélèvement à la source, seniors, enfants à charge, revenus étrangers, frais réels, post-décès,
  auto-entrepreneurs, changement d'adresse) qu'une liste à la main aurait difficilement anticipées.

---

## 4. Limites du premier jet (identifiées)

1. **Le niveau « thème » (parent) est fragmenté.** Chaque cluster ayant été nommé *isolément*,
   l'IA a produit ~26 thèmes pour 28 clusters, avec des quasi-doublons (« ergonomie des
   formulaires » vs « ergonomie du service »). → à corriger par une **passe de consolidation**.
2. **Le signal positif se disperse** en ~7 clusters disant tous « satisfait ». → à fusionner.
3. **Taux de bruit ~31 %** : un tiers des verbatims uniques ne sont rattachés à aucun cluster.
   Acceptable pour une première vue, mais améliorable.

---

## 4 bis. Passe de consolidation des thèmes — LIVRÉE ✅

**Outil** : `src/consolidate.py`, **API Albert** (chat, 2 passes). Corrige les limites 1 & 2.

- **Passe 1** : on montre à Albert **les 28 (libellé + description) d'un coup** → il propose des
  thèmes parents cohérents, non redondants, en fusionnant les quasi-doublons.
- **Passe 2** : on **rattache chaque cluster** à un thème via un appel à sortie contrainte
  (`enum` des codes de thème) → rattachement toujours valide, couverture exhaustive.

**Résultat** : **26 thèmes fragmentés → 11 thèmes propres**, les 28 problématiques rattachées,
les 7 clusters « satisfaction » fusionnés en un seul thème. Livrables : `out/catalog_2level.md`
(arbre thème→problématique avec descriptions et volumes) et `out/catalog_2level.csv`.

Les 11 thèmes : Expérience positive (17 472) · Complexité du formulaire (10 195) · Situations
fiscales spécifiques (7 986) · Complexité croissante (3 723) · Relation/service client (3 423) ·
Prélèvement à la source (2 797) · Technique & authentification (2 673) · Accessibilité/seniors
(2 059) · Cas juridiques sensibles (1 707) · Absence de confirmation (937) · Cohérence
inter-plateformes (582).

> Détail de promotion : 2 codes de thème générés contiennent des accents
> (`prélèvement_a_la_source`, `expérience_utilisateur_positive`) → normaliser en ASCII avant
> d'injecter dans `ClassificationCategory` (le `code` sert dans les prompts, ES et la base).

## 4 ter. Explorateur HTML verbatims ↔ catégories — LIVRÉ ✅

**Outil** : `src/explore_page.py` → `out/explore.html` (page autonome, hors-ligne, ~14 Mo).

Joint `clustered.parquet` (chaque verbatim porte son cluster) avec `catalog_2level.csv` →
arbre thème → problématique dépliable, chaque problématique montrant **tous ses verbatims**
triés par **représentativité** (proximité cosinus au centre du cluster). Rendu paresseux par
paquets (fluide à 70k lignes). Tags d'intention, `×N` des doublons, **recherche globale** (≥3
car., surlignée, chemin thème›problématique), et **section « Bruit »** (21 604 non classés).
Fichier **local/gitignoré** (données personnelles). Rejouable après tout reclustering.

## 4 quater. Analyse du bruit + rebuild en granularité fine — LIVRÉ ✅

Constat utilisateur : le bucket « non catégorisé » (~31 %) contenait des verbatims clairement
rattachables (satisfaction courte : « très bien », « nickel »…).

- **Pourquoi** : (1) HDBSCAN est prudent (les points de frange → bruit) ; (2) les textes très
  courts ont un embedding instable ; (3) **on clusterise les verbatims _uniques_ sans pondérer
  par la fréquence** → « non merci » ×264 = un seul point isolé → bruit malgré le volume.
- **Test du rattachement par seuil cosinus** (`scripts/reassign_preview.py`, lecture seule) :
  **écarté**. bge-m3 a un plancher de similarité élevé (tout est à 0,45-0,65), donc un seuil bas
  rapatrie 99 % sans discernement et **misassigne** (« Non tout est parfait » → cluster Complexité) ;
  un seuil haut laisse de vraies plaintes en bruit. Outil trop grossier.
- **Bonne stratégie retenue** : **rebuild à granularité fine (mcs=200, 77 clusters)** + nommage +
  consolidation. Les signaux perdus réapparaissent en clusters propres (anxiété d'exactitude « j'espère
  avoir bien rempli » ×498, **demande d'assistance IA/chatbot** ×375, signature électronique…).
  Résultat : **11 thèmes / 77 problématiques** (`out/catalog_2level.{md,csv}`), explorer régénéré.
  Compromis assumé : bruit à 37,7 % (vs 30,7 %) — prix de la finesse, surtout du déchet + positifs
  ultra-courts déjà couverts.
- **Robustesse** : `_chat_json` (name_clusters + consolidate) gagne un **backoff sur 429/5xx**
  (l'endpoint chat Albert est limité ~100/min ; enchaîner 77+78 appels le saturait).

### Le bruit a un plancher structurel — et c'est normal

Constat : passer de mcs=500 à mcs=200 a **augmenté** le bruit (23 235 → 27 907 réponses). C'est
attendu : `min_cluster_size` règle la **granularité**, pas le bruit (cœurs plus petits/serrés →
plus de points de frange en dehors).

Le vrai bouton anti-bruit est **`min_samples`**. Balayage à mcs=200 (`scripts/minsamples_sweep.py`,
lecture seule) :

| min_samples | clusters | bruit (réponses) |
| --- | --- | --- |
| 1 | 77 | 22 337 (**29,1 %**) |
| 3 | 79 | 25 451 (33,1 %) |
| 5 | 73 | 27 045 (35,2 %) |
| 10 (défaut) | 77 | 27 907 (36,3 %) |

**Même à `min_samples=1`, le bruit plafonne à ~29 %** (à peine mieux que mcs=500). Conclusion :
HDBSCAN ne regroupe que les **zones denses** ; sur du texte libre, ~30 % des verbatims sont une
**longue traîne diffuse** (ultra-courts, uniques, ou non-feedback type « néant ») qui ne formera
jamais de zone dense, quel que soit le réglage. **Ce n'est pas un défaut à corriger.**

> 🔑 **Clustering ≠ classification.** Le clustering sert à **DÉCOUVRIR** les catégories (et laisse
> structurellement ~30 % en bruit). Pour **ASSIGNER chaque** verbatim (y compris le bruit), le bon
> outil est la **classification** — précisément le pipeline LLM Albert de la Phase 1, avec le
> catalogue découvert comme ensemble fermé + une classe « autre ». Le LLM comprend le **sens** (pas
> besoin de densité) : « très satisfait » → Satisfaction, « usine à gaz » → Complexité, seul le vrai
> déchet → autre. **Les deux briques s'emboîtent : découverte (clustering) → assignation (classif).**

## 4 quinquies. Clustering récursif sur le bruit — LIVRÉ ✅

Idée : relancer toute la pipeline sur **uniquement les verbatims en bruit** de la salve mcs=500
(21 604 uniques). En retirant les gros clusters, UMAP recalcule une carte où la structure interne
du bruit n'est plus écrasée → des sous-groupes émergent. Outillage : `src/extract_subset.py`
(slice les lignes `cluster==-1`, ré-indexe, réutilise les embeddings du cache → pas de re-embed) +
`RUN_TAG=noise500`. `clean.parquet`/`embeddings.npy` sont devenus taguables (l'entrée d'un run =
un jeu, complet ou sous-ensemble).

**Résultat** (mcs=100 sur le résidu) : **46 clusters / 13 thèmes**, et **42 % de bruit restant**
(9 151 uniques vraiment diffus). Donc **~57 % du bruit initial avait une structure récupérable**.
Catégories de niche révélées (invisibles au 1er passage) : **cases spécifiques** (2UU/2VV, PER
6NS/6NT) 1 480 · **cas particuliers** (EHPAD, Pinel, LMNP, assurance-vie) 1 425 · **incertitude/
vérification** 1 122 · **assistance par un tiers** 1 106 · **préférence papier** 588 · **crédits
d'impôt/réductions** 581 · **assistance IA** 467 · **coordonnées bancaires** 355. Le reste = diffus
déjà connu (satisfaction 3 572, complexité générale 1 790). Artefacts tagués `_noise500`.

**Leçon** : le bruit n'est pas que du déchet — ~moitié contient des catégories réelles. Le
clustering récursif mine la longue traîne ; complémentaire de la classification LLM (assignation).

## 4 sexies. Sorties par démarche + CSV bruts + export Grist — LIVRÉ ✅

En vue du **test sur d'autres démarches** (au-delà de la déclaration de revenus) et d'un
partage aux chefs de projet via **Grist**, refonte des sorties :

- **Un dossier par démarche** : toutes les sorties vont dans `out/<demarche>/` et
  `cache/<demarche>/`. Le slug est **dérivé du `product_id`** du CSV par `src.clean`
  (ex. `product-3059`) et mémorisé dans `cache/active_demarche.txt` ; les étapes suivantes
  reprennent la démarche active, surchargeable par `DEMARCHE=`. Le run déclaration de revenus
  existant a été **migré** dans `cache/product-3059/` + `out/product-3059/` (embeddings
  conservés, zéro recalcul). `config.py` réécrit pour porter cette dimension + une fonction
  `use_demarche()`.
- **Fix latent au passage** : `clean.parquet`/`embeddings.npy` décrivent le *jeu de données*,
  pas la granularité. Les lecteurs prennent le fichier taggé d'un sous-ensemble s'il existe
  (`clean_noise500.parquet`), sinon le **corpus complet partagé** (`*_READ` dans config). Sans
  ça, le flux documenté `clean/embed` (non taggés) puis `cluster RUN_TAG=mcs500` cassait sur
  une démarche neuve (cherchait `embeddings_mcs500.npy`).
- **`clusters_raw_<tag>.csv`** (nouveau, `cluster.py`) : résultat **brut AVANT tout LLM** —
  1 ligne/cluster (`product_id`, `run_tag`, `cluster`, `n_answers`, `n_unique`, `pct_answers`,
  `top_terms`, `example_1..8`). Le matériau de découverte sans interprétation.
- **Export Grist en 3 tables liées** (nouveau, `explore_page.py`) — pendant tabulaire de
  `explore.html` : `themes_<tag>.csv` (theme_code/label/description + volumes),
  `problematiques_<tag>.csv` (cluster→theme_code, label, desc, top_terms, volumes),
  `verbatims_<tag>.csv` (cluster→problématique, verbatim, dup_count, intention,
  representativite, rang). Le **bruit** = thème+problématique `bruit` synthétiques (cluster
  `-1`) pour que toutes les références résolvent. `consolidate.py` persiste désormais
  `theme_description` (colonne consommée par la table Thèmes).
- **Validé e2e** sur `product-3059`/mcs500 : intégrité référentielle OK (theme_codes ⊆ Thèmes,
  clusters ⊆ Problématiques), volumétrie conservée (Σ dup_count = Σ nb_reponses = 76 789),
  21 604 verbatims en bruit correctement rattachés. ⚠️ `theme_description` vide pour ce run
  (catalogue antérieur à la colonne) → se remplit en rejouant `consolidate`.

> Reste à faire côté Grist : import des 3 CSV + câblage des colonnes Reference + page à
> 3 sections liées (accompagnement prévu avec l'utilisateur).

## 4 septies. Contexte démarche optionnel pour le LLM — LIVRÉ ✅

Injection d'un **contexte factuel** par démarche dans les **seules étapes LLM** (`name_clusters`,
`consolidate`) pour des libellés plus fins (jargon/sigles : 2044, Visale, CESU+, « le 17 »).
**Sans biais de découverte** : les clusters sont figés par HDBSCAN en amont, le LLM ne fait que
les nommer. Pas d'injection à l'embedding (préfixe = dégradation des vecteurs) ni au clustering.

- Fichier `contexts/<demarche>.txt` (factuel, pas de catégories a priori). Créés pour 3059, 2278,
  1690, 3354 (à relire). Activation par `CTX=1`.
- Sorties dépendantes du contexte suffixées **`_ctx`** (`catalog_2level_<tag>_ctx.*`,
  `themes/problematiques/verbatims_<tag>_ctx.csv`) → comparables côte à côte. Clustering partagé
  (pas de re-calcul ; on rejoue juste les 3 étapes aval). `config.py` : `CONTEXT_ON`, `_VSFX`,
  `context_block()`.
- **Démo** (product-3354, mcs30) : le contexte regroupe la satisfaction éclatée (1722+391+340 →
  2453 « expérience positive du tchat »), identifie le canal (tchat / téléphone vers le 17) et
  passe de 12 à 10 thèmes mieux fusionnés. Variante `_ctx` disponible dans `out/product-3354/`.

## 4 octies. Push automatique vers Grist (API) — LIVRÉ ✅

Au lieu de l'import manuel + câblage des références + montage de la page liée, deux scripts font
tout via l'**API REST Grist** (testé sur grist.numerique.gouv.fr, doc `wPjmDnSpSEom`, org `jdma`).

- `src/grist_push.py` : crée `Themes/Problematiques/Verbatims_<tag>`, pousse les lignes (lots de
  **500** — Grist renvoie 413 au-delà), et crée les colonnes **Reference** `theme_ref`
  (Problematiques→Themes) et `prob_ref` (Verbatims→Problematiques). La valeur d'une Ref = le rowId
  de la cible, résolu par le script (map clé→rowId via GET). `--replace` recrée si déjà présent.
- `src/grist_page.py` : crée la **page à 3 sections liées** via les *user actions*
  (`CreateViewSection`, puis `UpdateRecord` sur `_grist_Views_section` pour `linkSrcSectionRef` /
  `linkTargetColRef`). Cascade Thème→Problématique→Verbatim.
- Config `.env` : `GRIST_BASE_URL`, `GRIST_DOC_ID`, `GRIST_API_KEY` (+ `.env.example` documenté).
- **Validé e2e** sur 3059/mcs200 : 12 thèmes / 78 problématiques / 70 478 verbatims poussés,
  références résolues à 100 %, page liée fonctionnelle (vérifié dans `_grist_Views_section`).
- Pièges résolus : NaN→None (sérialisation JSON), lots de 500 (413), noms de colonnes Ref
  sans collision de casse (`prob_ref` car `problematique` existe déjà en texte).
- Tables nommées `<Base>_<tag>` → un run avec contexte (`_ctx`) cohabite avec le run simple dans
  le même doc pour comparaison.

> ⚠️ Sécurité : le token API utilisé pour ce test a été partagé en clair → à régénérer.

## 4 nonies. Fusion intelligente de deux runs (corpus + bruit) — LIVRÉ ✅

`src/merge_runs.py` : fusionne deux runs de la MÊME démarche (typiquement le run corpus complet +
sa repasse sur le bruit) en **une taxonomie unique**, dédoublonnée. Chaque verbatim est rangé une
seule fois (base si clusterisé, sinon repasse-bruit si récupéré, sinon bruit résiduel). L'union des
deux catalogues est re-consolidée par le LLM en 3 passes : (1) proposer un jeu fusionné de
problématiques (quasi-doublons fusionnés, niches conservées), (2) rattacher chaque source à une
problématique fusionnée (enum), (3) regrouper en thèmes (prompt **renforcé** `propose_themes_strict`
qui force le regroupement — sans ça le LLM faisait 1 thème par problématique). Sortie = un run normal
(tag `merged500`) → `explore_page` / `grist_push` le consomment tels quels. Mode `--retheme-only`
pour rejouer la seule passe thèmes.

**Résultat 3059 (`merged500`, mcs500 + noise500)** : 74 problématiques sources → **40 fusionnées /
10 thèmes**. Bruit **30 % → 12 %** des réponses (23 235 → 9 231 ; +14 004 réponses récupérées).
Les niches du bruit apparaissent bien (cases 2UU/2VV, PER, EHPAD, Pinel, LMNP, assurance-vie,
assistance IA, papier, coordonnées bancaires) regroupées sous « Compréhension des mécanismes
fiscaux », « Cas fiscaux spécifiques », « Déclarations particulières ». Intégrité Grist validée
(volume 76 789, refs OK). Livrables : `clustered_merged500.parquet`, `catalog_2level_merged500.*`,
`explore_merged500.html`, `{themes,problematiques,verbatims}_merged500.csv`.

**Variante contextualisée `merged500_ctx`** : pipeline LLM rejouée avec le contexte démarche
(`CTX=1`), à partir des clusters déjà produits (clustering inchangé). `merge_runs` lit les
catalogues `_ctx` via `--catalog-suffix _ctx`. Résultat : 42 problématiques / 10 thèmes, volume
76 789, **bruit résiduel identique (9 151)** — le contexte ne change pas la couverture, il
**rééquilibre/renomme** les thèmes (isole « Dons/crédits/déductions », « Déclarations spécifiques »,
libellés plus métier). Effet **modéré** sur 3059 (clusters déjà parlants), contrairement à 3354.

## 4 decies. Retour DGFIP → catégorisation à facettes (3 axes) — LIVRÉ ✅ (découverte du référentiel)

**Contexte** : retour de Jules Bonnaud (Data Analyst DGFiP), mail du 30/06/2026, sur les deux
versions poussées dans Grist (**V1 = `merged500_ctx`** avec contexte, **V2 = `merged500`** sans).
Verdict : *« griefs avec les 2 versions »*, qui s'appliquent globalement. **La différence V1/V2
était justement l'injection de contexte au nommage → preuve empirique que le contexte ne règle pas
les griefs de fond** (ils sont structurels). Trois griefs :
1. **Produits vs thématiques mélangés** : la hiérarchie unique confond l'**objet fiscal** (de QUOI
   parle l'usager : revenus fonciers/étrangers, rattachement, décès… — non actionnable) et la
   **thématique site** (ergonomie, clarté, aide, pré-remplissage, accessibilité, bugs — actionnable).
   Un cluster « produit » donne le QUOI sans la nature de la problématique.
2. **Positif/négatif mélangés** : « satisfaction » en tête fausse la lecture (~15k « contents »,
   contredit les ~80 % de satisfaction quanti) ; des libellés à connotation négative pleins de
   verbatims positifs (ex. « accès difficile au service téléphonique » ~4k, en fait majoritairement
   « bon contact / bonne aide »).
3. **Divers** : sens de l'intention « neutral » et de la « représentativité » (= proximité cosinus au
   centre du cluster), catégories minuscules à côté d'énormes, co-occurrence des thèmes (multi-label).

**Diagnostic** : une taxonomie hiérarchique unique **conflate 3 axes orthogonaux**. Bascule vers un
modèle à **facettes** : **A. Objets de la démarche** (spécifique, ~non actionnable) · **B.
Thématiques site** (actionnable) · **C. Polarité** (positif/négatif/neutre, par verbatim). Le
clustering **reste l'outil de découverte** mais son rôle rétrécit à « miner le référentiel objet » ;
la polarité n'est pas découverte (valeurs fixes) ; la satisfaction se **lit sur l'axe C**, ce n'est
plus une pseudo-catégorie.

**Livré** :
- `src/extract_facets.py` (`DEMARCHE=… RUN_TAG=… uv run python -m src.extract_facets`) : 2 passes
  Albert — (1) extrait les **deux référentiels** (objets / thématiques site) depuis
  `catalog_candidate_<tag>.csv`, **axe B amorcé** sur la liste métier (7 items DGFiP +
  `assistance_ia` ajouté par JDMA) ; (2) **rattache chaque cluster** (multi-label, enum) →
  traçabilité + **volume indicatif** par facette. Interdit toute thématique de sentiment (polarité =
  axe séparé), autorise `thématiques=[]` pour les avis purement polarité, normalise les codes en
  ASCII, purge les facettes fantômes (0 cluster rattaché), compte les clusters « purement polarité ».
  Sorties `facettes_<tag>.{md,csv}` (chemins `FACETS_MD`/`FACETS_CSV` ajoutés à `config.py`).
- `scripts/facets_html.py` (`uv run python scripts/facets_html.py`) : **vue HTML autoportante à 3
  colonnes** depuis le CSV — aucun appel réseau, rejouable pour n'importe quelle démarche. Sortie
  `facettes_<tag>.html`.
- **Run 3059/mcs200** : **16 objets** (annexes, immobilier, locatifs meublés, étrangers, dons,
  SCPI/fonciers, cases spécifiques, plus-values mobilières, PAS, services à la personne,
  auto-entrepreneur, charges déductibles, frais réels, pensions alimentaires, rattachement enfants,
  décès) · **8 thématiques site** (7 seed + `assistance_ia`) · **9 clusters / ~8 266 réponses
  purement polarité** (= la satisfaction globale, désormais isolée sur l'axe C). L'assistance IA
  (cluster 18) — invisible dans une 1ʳᵉ version où elle était fondue dans `aide_support` — réapparaît
  grâce au seed.

**Coexiste avec l'ancien rendu** (2 niveaux → Grist via `explore_page`/`grist_push`, toujours
fonctionnel) : filenames distincts (`facettes_*` vs `themes_/problematiques_/verbatims_*`), on choisit
l'un ou l'autre. ⚠️ Le **push Grist des facettes n'est pas encore câblé** (sortie CSV à plat, pas les
3 tables liées).

**Limites identifiées** (→ argumentent le passage à l'assignation avis-par-avis) :
- **Variance run-à-run** de la passe 1 (LLM non-déterministe même à `temperature=0`) : le set de
  thématiques *découvertes* est volatile (un run : 8 thèmes tout-seed ; un autre : ~12 avec niches).
  **Seul l'amorce est stable** → seeder les niches stratégiques (`assistance_ia` a survécu ainsi),
  traiter la sortie comme un **brouillon à valider avec le porteur**.
- **Volumes de l'axe A non fiables** : des clusters génériques (66/22/71 sur 3059) sont rattachés à
  ~tous les objets et les gonflent, + misattributions ponctuelles (cluster décès → IA). L'attribution
  *par cluster* est trop grossière pour des objets qui partagent des clusters hétérogènes → les
  **volumes fiables + la polarité ne viendront que de l'assignation avis-par-avis** (chaque verbatim
  est homogène : un objet, un sentiment).
- Coquilles de code générées par le LLM à corriger si le référentiel est retenu :
  `cases_specifices` → `cases_specifiques`, `rattachement_enfants_majors` → `_majeurs`.

**Note infra** : la clé Albert de test avait **expiré le 29/06/2026** (token JWT `expires`), d'où des
401/403. **Régénérée** (nouvelle expiration ~05/07/2027), reportée dans les 2 `.env` (analysis +
backoffice). Palier expérimentation → à re-régénérer périodiquement (idem pour le backfill/prod).

## 4 undecies. Assignation avis-par-avis (3 axes) + page navigable — LIVRÉ ✅ (prototype)

**Étape 2** (assignation) après la découverte du référentiel (§4 decies). Prend les 3 axes comme
**ensemble fermé** et fait classer **chaque verbatim** par Albert, indépendamment sur les 3 axes.
C'est ici que tombent les **vrais volumes + la polarité** — l'attribution *par cluster* de §4 decies
était trop grossière (clusters génériques rattachés partout) ; au niveau verbatim, chaque avis est
homogène (un objet, un sentiment).

- `src/assign_facets.py` (`DEMARCHE=… RUN_TAG=… ASSIGN_N=60 uv run python -m src.assign_facets`) :
  échantillon **déterministe et varié** (quelques verbatims très fréquents + tirage `random_state=42`),
  1 appel Albert / verbatim, sortie contrainte `{objets[], thematiques[], polarite ∈
  {positif,negatif,neutre}}` (objet/thématique peuvent être vides). Sortie `assignments_<tag>.csv`.
- `scripts/assign_html.py` : **page HTML autonome** — recherche plein-texte (accent-insensible,
  surlignée), filtres par facette (**OU** intra-axe, **ET** inter-axes) avec **compteurs dynamiques**
  (recalculés selon les autres filtres, chips à 0 grisés), tri (ordre/polarité/longueur), groupes
  repliables. **Conçue portable en Custom Widget Grist** : rendu isolé dans `render()`, hook
  `grist.onRecords` + forme `mapRec` documentés dans le `<script>`. Sortie `assignments_<tag>.html`.
- **Run 3059/mcs200, 60 avis** : 15 avec objet, 23 avec thématique, **37 purement polarité**
  (ressentis courts « merci / parfait / RAS » → objet=∅, thématique=∅ + polarité) → la satisfaction
  se lit bien sur l'axe C. ⚠️ Échantillon **non représentatif** (mélange fréquents + aléatoire) →
  proportions de polarité indicatives seulement.

**Push Grist LIVRÉ ✅** : `src/grist_push_assignments.py`
(`DEMARCHE=… RUN_TAG=… uv run python -m src.grist_push_assignments [--replace]`) crée la table
`Assignments_<tag>` et pousse un avis/ligne. Les 3 axes sont **typés pour un filtrage NATIF Grist**
(pas besoin de widget) : `polarite` en **Choice** (couleurs pos/neg/neu), `objets` + `thematiques`
en **ChoiceList** (libellés lisibles, encodage `["L", …]`). Run **3059/mcs200 = 400 avis** poussés
dans `Assignments_mcs200` (doc `wPjmDnSpSEom`). Clé API Grist **régénérée** (l'ancienne, partagée en
clair, révoquée).

**Reste pour ce volet** : monter encore en volume (co-occurrences que Jules demandait) ; **widget
custom Grist** OPTIONNEL (vue en cartes `assign_html.py` portée en Custom Widget — nécessite
d'héberger la page en HTTPS + que l'instance autorise l'URL ; les verbatims restent dans Grist,
jamais sur l'hébergeur).

## 5. Prochaines étapes (proposées)

1. ~~**Passe de consolidation des thèmes**~~ ✅ **fait** (§4 bis).
2. ~~**Analyse/réduction du bruit + drill-down mcs=200**~~ ✅ **fait** (§4 quater) — plancher de
   bruit structurel ~29 % confirmé.
3. ~~**Sorties par démarche, CSV bruts, export Grist**~~ ✅ **fait** (§4 sexies, §4 octies).
4. ~~**Contexte démarche optionnel pour le LLM**~~ ✅ **fait** (§4 septies).
5. ~~**Fusion intelligente corpus + bruit**~~ ✅ **fait** (§4 nonies).
6. ~~**Généralisation multi-démarches**~~ ✅ **en cours** : 4 démarches traitées (3059, 2278, 1690,
   3354), poussées dans Grist. Démarche **1789** (2 ans) à venir. Voir §0 bis.
7. **Boucler découverte → assignation** (toujours ouvert) : prendre le catalogue découvert comme
   ensemble fermé et le faire **classer par le LLM Albert** sur tous les verbatims (y compris le bruit
   résiduel) → couverture quasi-totale. Pont vers le pipeline de classification Phase 1.
8. **Comparatif équitable DGFIP** (toujours ouvert) : relancer le pipeline sur « Gérer mes biens
   immobiliers » puis confronter à leur catégorisation manuelle (5 cat / 13 sous-cat, ~1541 verbatims).
9. **Comparaison au catalogue métier JDMA** (toujours ouvert) : couvert / manquant / à scinder / fusionner.

---

## 6. Environnement technique & reproduction

- **Langage** : Python **3.11** (épinglé), géré par **uv** (gestionnaire d'environnement rapide).
  L'environnement est isolé (`.venv`), sans toucher au Python système.
- **Bibliothèques** : `umap-learn`, `hdbscan`, `scikit-learn`, `pandas`, `numpy`, `httpx`
  (appels Albert), `plotly` (carte 2D). **Pas de `torch`** : les embeddings sont calculés
  côté serveur Albert, donc aucun gros runtime ML en local.
- **Confidentialité** : les verbatims sont des **données personnelles**. Les dossiers `data/`,
  `cache/`, `out/` sont **gitignorés** ; aucun verbatim brut n'est committé.
- **Reproduire** (depuis `analysis/verbatim-clustering/`) :
  ```powershell
  uv sync                                    # installe l'environnement
  # placer le CSV exporté dans data/, renseigner la clé Albert dans .env
  python -m src.clean                        # 1-2. nettoyage + dédup
  python -m src.embed                        # 2.  embeddings (reprenable)
  python scripts/sweep.py                    # 3-5. balayage de granularité
  python -m src.cluster --min-cluster-size 500   # clustering retenu + carte 2D
  python -m src.name_clusters                # 6.  nommage LLM -> catalog_candidate.csv
  ```

---

## 7. Pourquoi c'est utile (résumé décisionnel)

- **Le catalogue ne dépend plus uniquement de l'intuition métier** : on le confronte (ou on le
  fonde) sur ce que les usagers disent réellement, démarche par démarche.
- **On détecte les angles morts** : des problématiques fréquentes et concrètes (annexes 2044,
  prélèvement à la source, seniors…) que personne n'aurait pensé à lister.
- **C'est souverain et reproductible** : 100 % Albert (DINUM) + outils open-source, rejouable sur
  n'importe quelle démarche, sans donnée envoyée à un service tiers.
