import DOMPurify from 'isomorphic-dompurify';

const ALLOWED_TAGS = [
	'a',
	'b',
	'blockquote',
	'br',
	'em',
	'i',
	'li',
	'ol',
	'p',
	'strong',
	'u',
	'ul',
	'span'
];

const ALLOWED_ATTR = ['href', 'target', 'rel'];

export const sanitizeRichHtml = (input: string | null | undefined): string => {
	if (!input) return '';
	return DOMPurify.sanitize(input, {
		ALLOWED_TAGS,
		ALLOWED_ATTR,
		ALLOWED_URI_REGEXP:
			/^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
		FORBID_ATTR: ['style', 'onerror', 'onload', 'onclick'],
		FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form']
	});
};
