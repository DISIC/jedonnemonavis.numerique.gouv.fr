import React from 'react';

const escapeForRegex = (term: string): string =>
	term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const renderHighlightedText = (
	text: string,
	search: string
): React.ReactNode => {
	const lines = text.split('\n');
	const terms = (search || '')
		.split(/\s+/)
		.map(t => t.trim())
		.filter(Boolean)
		.map(escapeForRegex);

	if (terms.length === 0) {
		return lines.map((line, idx) => (
			<React.Fragment key={idx}>
				{line}
				{idx < lines.length - 1 && <br />}
			</React.Fragment>
		));
	}

	const splitRegex = new RegExp(`(${terms.join('|')})`, 'gi');
	const matchRegex = new RegExp(`^(?:${terms.join('|')})$`, 'i');

	return lines.map((line, lineIdx) => {
		const parts = line.split(splitRegex);
		return (
			<React.Fragment key={lineIdx}>
				{parts.map((part, partIdx) =>
					matchRegex.test(part) ? (
						<span key={partIdx}>{part}</span>
					) : (
						<React.Fragment key={partIdx}>{part}</React.Fragment>
					)
				)}
				{lineIdx < lines.length - 1 && <br />}
			</React.Fragment>
		);
	});
};
