import escapeHtml from 'escape-html';
import { Descendant, Text } from 'slate';
import { jsx } from 'slate-hyperscript';

const ALLOWED_LINK_SCHEMES = ['http:', 'https:', 'mailto:', 'tel:'];

const sanitizeLinkUrl = (url: unknown): string => {
	if (typeof url !== 'string') return '';
	const trimmed = url.trim();
	if (!trimmed) return '';
	if (trimmed.startsWith('/') || trimmed.startsWith('#')) return trimmed;
	try {
		const parsed = new URL(trimmed);
		if (ALLOWED_LINK_SCHEMES.includes(parsed.protocol.toLowerCase())) {
			return parsed.toString();
		}
	} catch {}
	return '';
};

export const deserialize = (
	el: any,
	markAttributes: any = {}
): (string | Descendant | null)[] | Descendant | string | null => {
	if (el.nodeType === Node.TEXT_NODE) {
		return jsx('text', markAttributes, el.textContent);
	} else if (el.nodeType !== Node.ELEMENT_NODE) {
		return null;
	}

	const nodeAttributes = { ...markAttributes };

	// define attributes for text nodes
	switch (el.nodeName) {
		case 'STRONG':
		case 'B':
			nodeAttributes.bold = true;
			break;
		case 'EM':
		case 'I':
			nodeAttributes.italic = true;
			break;
		case 'U':
			nodeAttributes.underline = true;
			break;
	}

	const children = Array.from(el.childNodes)
		.map(node => deserialize(node, nodeAttributes))
		.flat();

	if (children.length === 0) {
		children.push(jsx('text', nodeAttributes, ''));
	}

	switch (el.nodeName) {
		case 'BODY':
			return jsx('fragment', {}, children);
		case 'BR':
			return '\n';
		case 'BLOCKQUOTE':
			return jsx('element', { type: 'quote' }, children);
		case 'P':
			return jsx('element', { type: 'paragraph' }, children);
		case 'A':
			return jsx(
				'element',
				{ type: 'link', url: el.getAttribute('href') },
				children
			);
		default:
			return children;
	}
};

export const serialize = (node: any) => {
	if (Text.isText(node)) {
		let string = escapeHtml(node.text);

		if ('bold' in node && node.bold) {
			string = `<strong>${string}</strong>`;
		}
		if ('italic' in node && node.italic) {
			string = `<em>${string}</em>`;
		}
		if ('underline' in node && node.underline) {
			string = `<u>${string}</u>`;
		}

		return string;
	}

	const children = node.children.map((n: any) => serialize(n)).join('');

	switch (node.type) {
		case 'quote':
			return `<blockquote><p>${children}</p></blockquote>`;
		case 'paragraph':
			return `<p>${children}</p>`;
		case 'link': {
			const safeUrl = sanitizeLinkUrl(node.url);
			if (!safeUrl) return children;
			return `<a href="${escapeHtml(safeUrl)}">${children}</a>`;
		}
		default:
			return children;
	}
};
