/**
 * Détection des données personnelles dans un texte libre (verbatims).
 *
 * ⚠️ FICHIER MIROIR — toute modification doit être reportée à l'identique dans
 * `webapp-backoffice/src/utils/personal-data.ts`. Les deux apps sont deux
 * projets Next indépendants (pas de monorepo, `@/*` cantonné à chaque racine) :
 * c'est la même convention que pour `prisma/schema.prisma`.
 *
 * Deux usages, un seul jeu de motifs :
 *
 * 1. **webapp-form** — avertir l'usager pendant la rédaction et bloquer l'envoi
 *    tant que la donnée est présente. On ne veut pas la collecter du tout.
 * 2. **webapp-backoffice** — masquer à la lecture ce qui est déjà en base
 *    (liste des avis, exports CSV/XLSX, open API `GET /avis`). Le texte reste
 *    intact en base : le masquage est réversible, contrairement à un backfill.
 *
 * ── Ce qui est volontairement absent ────────────────────────────────────────
 *
 * Les motifs qui repèrent une **mention** de document sans contenir la donnée
 * elle-même — « carte vitale », « titre de séjour », « passeport » — sont
 * exclus. « Ma carte vitale n'est pas prise en compte » est un verbatim
 * parfaitement légitime, sans aucune donnée personnelle : le masquer ne
 * protège personne, et bloquer l'usager dessus le priverait de son avis pour
 * rien. Ces motifs restent utiles pour **compter** (requête d'audit SQL), pas
 * pour masquer.
 *
 * Même logique pour `date_naissance` : seule la forme « né(e) le <date> » est
 * retenue. Une date nue est bien plus souvent la date d'une démarche
 * (« j'ai déposé mon dossier le 12/05/2025 ») qu'une date de naissance.
 */

/**
 * Niveau de confiance du motif.
 *
 * `fort` : la forme ne laisse pas de doute (une adresse e-mail est une adresse
 * e-mail). `moyen` : la forme est celle d'une donnée personnelle mais un faux
 * positif reste possible — un nombre à 7 chiffres peut être un montant.
 *
 * Les deux niveaux sont traités de la même façon aujourd'hui. La distinction
 * est conservée parce qu'elle permet de rétrograder `moyen` en simple
 * avertissement non bloquant si le taux de faux positifs s'avère trop élevé,
 * sans toucher aux motifs eux-mêmes.
 */
export type PersonalDataLevel = 'fort' | 'moyen';

export type PersonalDataCategory =
	| 'email'
	| 'telephone'
	| 'num_secu_sociale'
	| 'iban_rib'
	| 'carte_bancaire'
	| 'plaque_immatriculation'
	| 'num_dossier_reference'
	| 'num_long'
	| 'num_moyen'
	| 'adresse_postale'
	| 'date_naissance'
	| 'nom_prenom';

type PersonalDataPattern = {
	category: PersonalDataCategory;
	level: PersonalDataLevel;
	/** Libellé affiché à l'usager, sujet de la phrase « … détecté(e) ». */
	label: string;
	/** Accord du participe passé dans cette phrase. */
	feminine?: boolean;
	regex: RegExp;
	/**
	 * Groupe capturant à masquer, quand le motif doit reconnaître un contexte
	 * plus large que la donnée elle-même. `n° de dossier 2024123456` se repère
	 * grâce au mot « dossier », mais seul le nombre doit être masqué — masquer
	 * le mot « dossier » rendrait le verbatim illisible sans rien protéger.
	 *
	 * Absent = tout le motif est la donnée.
	 */
	group?: number;
};

/**
 * Remplaçant inséré à la place de la donnée.
 *
 * Longueur fixe, volontairement : restituer la longueur d'origine
 * (`06 ** ** ** **`) redonne la forme de la donnée, donc une partie de
 * l'information. Le back-office repère cette chaîne exacte pour l'afficher
 * avec une infobulle ; les exports et l'API la laissent telle quelle, lisible
 * par un humain qui ouvre le CSV.
 */
export const PERSONAL_DATA_MASK = '[donnée personnelle masquée]';

/**
 * Ordre significatif : à chevauchement égal, le premier motif gagne. Les
 * motifs forts et spécifiques passent donc avant les motifs numériques
 * génériques, pour que `06 12 34 56 78` soit rapporté comme « téléphone » et
 * non comme « suite de chiffres ».
 */
const PATTERNS: PersonalDataPattern[] = [
	{
		category: 'email',
		level: 'fort',
		label: 'Adresse e-mail',
		feminine: true,
		// Les formes obfusquées « nom (at) domaine . fr » sont couvertes : un
		// usager qui contourne une détection naïve cherche justement à être
		// recontacté, c'est le cas qu'on veut attraper.
		regex:
			/[a-z0-9._%+-]+\s*(?:@|\(\s*at\s*\)|\[\s*at\s*\])\s*[a-z0-9._-]+\s*\.\s*[a-z]{2,10}/gi
	},
	{
		category: 'telephone',
		level: 'fort',
		label: 'Numéro de téléphone',
		regex: /(?:\+\s?33|0033|\b0)[\s.-]?[1-9](?:[\s.-]?\d{2}){4}(?!\d)/g
	},
	{
		category: 'num_secu_sociale',
		level: 'fort',
		label: 'Numéro de sécurité sociale',
		regex:
			/\b[12][\s.-]?\d{2}[\s.-]?(?:0[1-9]|1[0-2]|[2-9]\d)[\s.-]?\d{2}[\s.-]?\d{3}[\s.-]?\d{3}(?:[\s.-]?\d{2})?(?!\d)/g
	},
	{
		category: 'iban_rib',
		level: 'fort',
		label: 'IBAN',
		regex: /\bFR\s?\d{2}(?:\s?[0-9A-Z]{4}){5}(?:\s?[0-9A-Z]{1,3})?\b/gi
	},
	{
		category: 'carte_bancaire',
		level: 'fort',
		label: 'Numéro de carte bancaire',
		regex: /\b(?:\d{4}[\s-]?){3}\d{4}(?!\d)/g
	},
	{
		category: 'plaque_immatriculation',
		level: 'fort',
		label: "Plaque d'immatriculation",
		feminine: true,
		regex: /\b[a-z]{2}[\s-]\d{3}[\s-][a-z]{2}\b/gi
	},
	{
		category: 'nom_prenom',
		level: 'moyen',
		label: 'Nom',
		// Seule l'auto-identification explicite est reconnue. Détecter un nom
		// propre isolé dans un texte français est hors de portée d'une regex :
		// on attraperait « Pôle Emploi » ou « Paris » à chaque ligne.
		//
		// Pas de drapeau `i` : la phrase déclenchante tolère sa majuscule de début
		// de phrase explicitement, mais le nom capturé doit rester sensible à la
		// casse — sinon « je m'appelle et rien ne marche » capturerait « et rien ne ».
		regex:
			/(?:[Jj]e m['’]appelle|[Mm]on nom est|[Jj]e me nomme)\s+((?:\p{Lu}[\p{L}'’-]+\s*){1,3})/gu,
		group: 1
	},
	{
		category: 'date_naissance',
		level: 'moyen',
		label: 'Date de naissance',
		feminine: true,
		regex: /(?:n[ée]e?\s+le\s+)([0-3]?\d[/.-][0-1]?\d[/.-](?:19|20)\d{2})/gi,
		group: 1
	},
	{
		category: 'adresse_postale',
		level: 'moyen',
		label: 'Adresse postale',
		feminine: true,
		regex:
			/\b\d{1,4}\s?(?:bis|ter|quater)?\s?(?:rue|avenue|av\.|boulevard|bd\.?|impasse|all[ée]e|chemin|place|route|quai|square|voie|r[ée]sidence|lotissement|cours)\b(?:\s+[a-zà-ÿ'’-]+){0,4}/gi
	},
	{
		category: 'num_dossier_reference',
		level: 'moyen',
		label: 'Numéro de dossier',
		regex:
			/(?:dossier|d[ée]marche|r[ée]f[ée]rence|r[ée]f\.|num[ée]ro|n°|no\.|identifiant|matricule|allocataire|adh[ée]rent|contrat|commande|facture|client|assur[ée]|b[ée]n[ée]ficiaire)[^0-9.!?;\n]{0,20}(\d{4,})/gi,
		group: 1
	},
	{
		category: 'num_long',
		level: 'moyen',
		label: 'Suite de chiffres',
		feminine: true,
		regex: /\b\d{9,}\b/g
	},
	{
		category: 'num_moyen',
		level: 'moyen',
		label: 'Suite de chiffres',
		feminine: true,
		regex: /\b\d{6,8}\b/g
	}
];

export type PersonalDataMatch = {
	category: PersonalDataCategory;
	level: PersonalDataLevel;
	label: string;
	feminine: boolean;
	/** Bornes dans le texte d'origine, `[start, end)`. */
	start: number;
	end: number;
	value: string;
};

/**
 * Localise l'index du groupe capturant dans le texte d'origine.
 *
 * `RegExp.exec` ne donne pas la position des groupes sans le drapeau `d`
 * (`hasIndices`), pas disponible sur toutes les cibles de build du projet. On
 * retrouve donc le groupe par recherche dans le motif complet, ce qui est sûr
 * ici : le groupe est par construction une sous-chaîne du motif.
 */
function locateGroup(
	fullMatch: string,
	fullStart: number,
	group: string
): { start: number; end: number } {
	const offset = fullMatch.lastIndexOf(group);
	if (offset === -1) {
		return { start: fullStart, end: fullStart + fullMatch.length };
	}
	return { start: fullStart + offset, end: fullStart + offset + group.length };
}

/**
 * Toutes les occurrences trouvées, triées par position, **sans chevauchement**.
 *
 * Un même fragment peut satisfaire plusieurs motifs : `06 12 34 56 78` est à la
 * fois un téléphone et une suite de 10 chiffres. On ne garde que le premier
 * motif de la liste qui le couvre, pour que le message à l'usager nomme la
 * donnée le plus précisément possible.
 */
export function detectPersonalData(text: string): PersonalDataMatch[] {
	if (!text) return [];

	const matches: PersonalDataMatch[] = [];

	for (const pattern of PATTERNS) {
		// `lastIndex` est porté par l'objet RegExp lui-même : sans remise à zéro,
		// deux appels successifs sur des textes différents repartiraient du
		// décalage laissé par le précédent.
		pattern.regex.lastIndex = 0;

		let execResult: RegExpExecArray | null;
		while ((execResult = pattern.regex.exec(text)) !== null) {
			// Un motif qui peut matcher le vide ferait boucler `exec` indéfiniment.
			if (execResult[0] === '') {
				pattern.regex.lastIndex++;
				continue;
			}

			// Un groupe peut se terminer par l'espace qu'il a consommé en répétant
			// (`(?:\p{Lu}\p{L}+\s*){1,3}`). L'inclure dans les bornes collerait le
			// remplaçant au mot suivant.
			const captured = (
				pattern.group !== undefined ? execResult[pattern.group] : execResult[0]
			)?.replace(/\s+$/, '');
			if (!captured) continue;

			const { start, end } =
				pattern.group !== undefined
					? locateGroup(execResult[0], execResult.index, captured)
					: {
							start: execResult.index,
							end: execResult.index + execResult[0].length
					  };

			const overlapsKept = matches.some(m => start < m.end && end > m.start);
			if (overlapsKept) continue;

			matches.push({
				category: pattern.category,
				level: pattern.level,
				label: pattern.label,
				feminine: pattern.feminine ?? false,
				start,
				end,
				value: captured
			});
		}
	}

	return matches.sort((a, b) => a.start - b.start);
}

/** Raccourci sans allocation de tableau, pour les chemins chauds. */
export function hasPersonalData(text: string): boolean {
	return detectPersonalData(text).length > 0;
}

/**
 * Champs libres dont le contenu est collecté **volontairement**, avec le
 * consentement explicite de l'usager. Jamais masqués.
 *
 * `contact_email` est le bloc « Adresse mail » (`input_email`, masqué par
 * défaut, activable par la démarche) : « Vous pouvez laisser votre adresse
 * email si vous acceptez d'être recontacté. » Le masquer supprimerait le seul
 * canal de rappel dont dispose l'agent — on détruirait la fonctionnalité en
 * croyant protéger l'usager.
 */
export const UNMASKED_FIELD_CODES = new Set(['contact_email']);

/**
 * Applique le masquage à une réponse, en tenant compte du champ dont elle
 * vient. Seul point d'entrée à utiliser côté back-office : liste des avis,
 * worker d'export et open API partagent ainsi la même règle d'exemption.
 *
 * Les réponses à choix fermé (`radio`, `checkbox`) sont renvoyées telles
 * quelles : leur texte est le libellé d'une option du formulaire, jamais une
 * saisie de l'usager.
 */
export function maskAnswerText(
	answer: { field_code?: string | null; kind?: string | null },
	text: string | null | undefined
): string {
	if (!text) return text ?? '';
	if (answer.kind !== 'text') return text;
	if (answer.field_code && UNMASKED_FIELD_CODES.has(answer.field_code))
		return text;

	return maskPersonalData(text);
}

/**
 * Remplace chaque donnée détectée par {@link PERSONAL_DATA_MASK}.
 *
 * Le reste du verbatim est préservé mot pour mot : c'est tout l'intérêt du
 * masquage par fragment plutôt que par avis entier — l'agent garde un retour
 * exploitable là où supprimer l'avis lui ferait perdre l'information utile.
 */
export function maskPersonalData(text: string | null | undefined): string {
	if (!text) return text ?? '';

	const matches = detectPersonalData(text);
	if (matches.length === 0) return text;

	let out = '';
	let cursor = 0;
	for (const match of matches) {
		out += text.slice(cursor, match.start) + PERSONAL_DATA_MASK;
		cursor = match.end;
	}
	return out + text.slice(cursor);
}

/**
 * Phrase d'alerte affichée à l'usager, façon maquette :
 * « Numéro de téléphone détecté. Veuillez supprimer cette donnée personnelle
 * afin de pouvoir envoyer l'avis ».
 *
 * Les doublons sont fusionnés sur le libellé, pas sur la catégorie : trois
 * numéros dans le même verbatim donnent une seule mention, et `num_long` et
 * `num_moyen`, qui partagent un libellé, n'en produisent qu'une.
 */
export function describePersonalData(matches: PersonalDataMatch[]): string {
	if (matches.length === 0) return '';

	const seen = new Set<string>();
	const unique = matches.filter(m => {
		if (seen.has(m.label)) return false;
		seen.add(m.label);
		return true;
	});

	// Seul le premier libellé garde sa majuscule : il ouvre la phrase.
	const labels = unique.map((m, index) =>
		index === 0 ? m.label : m.label.charAt(0).toLowerCase() + m.label.slice(1)
	);
	const subject =
		labels.length === 1
			? labels[0]
			: `${labels.slice(0, -1).join(', ')} et ${labels[labels.length - 1]}`;

	const plural = unique.length > 1;
	const participle = plural
		? 'détectés'
		: unique[0].feminine
		? 'détectée'
		: 'détecté';

	const what = plural ? 'ces données personnelles' : 'cette donnée personnelle';

	return `${subject} ${participle}. Veuillez supprimer ${what} afin de pouvoir envoyer l'avis.`;
}
