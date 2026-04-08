export const isExactPhraseSearch = (search: string): boolean =>
	search.startsWith('"') && search.endsWith('"') && search.length > 2;

export const getExactPhrase = (search: string): string =>
	search.slice(1, -1);

export const stripAccents = (str: string): string =>
	str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const ACCENT_GROUPS: Record<string, string> = {
	a: 'aàâäã',
	e: 'eéèêë',
	i: 'iîï',
	o: 'oôö',
	u: 'uùûü',
	y: 'yÿ',
	c: 'cç'
};

const CHAR_TO_GROUP: Record<string, string> = {};
for (const group of Object.values(ACCENT_GROUPS)) {
	for (const char of group) {
		CHAR_TO_GROUP[char] = `[${group}]`;
		CHAR_TO_GROUP[char.toUpperCase()] = `[${group}${group.toUpperCase()}]`;
	}
}

export const buildAccentAwarePattern = (term: string): string => {
	const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	let pattern = '';
	for (const char of escaped) {
		pattern += CHAR_TO_GROUP[char] ?? char;
	}
	return pattern;
};
