import React, { useState } from 'react';
import { tss } from 'tss-react/dsfr';
import { fr } from '@codegouvfr/react-dsfr';
import { Button } from '@codegouvfr/react-dsfr/Button';

interface CodeBlockProps {
	children: string;
	className?: string;
	language?: 'bash' | 'javascript' | 'python' | 'json';
	hideCopy?: boolean;
}

const CodeBlock = ({
	children,
	className,
	language,
	hideCopy = false
}: CodeBlockProps) => {
	const { classes, cx } = useStyles();
	const [copied, setCopied] = useState(false);

	const renderHighlightedCode = (code: string, lang?: string) => {
		if (!lang) return code;

		const lines = code.split('\n');
		return lines.map((line, lineIndex) => {
			if (line.trim() === '') {
				return <div key={lineIndex}>&nbsp;</div>;
			}

			const tokens = tokenizeLine(line, lang);
			return (
				<div key={lineIndex}>
					{tokens.map((token, tokenIndex) => (
						<span key={tokenIndex} className={token.type}>
							{token.value}
						</span>
					))}
				</div>
			);
		});
	};

	const tokenizeLine = (line: string, lang: string) => {
		const tokens: Array<{ type: string; value: string }> = [];
		let remaining = line;

		const patterns = getPatterns(lang);

		while (remaining.length > 0) {
			let matched = false;

			for (const pattern of patterns) {
				const match = remaining.match(pattern.regex);
				if (match && match.index === 0) {
					tokens.push({ type: pattern.className, value: match[0] });
					remaining = remaining.slice(match[0].length);
					matched = true;
					break;
				}
			}

			if (!matched) {
				tokens.push({ type: '', value: remaining[0] });
				remaining = remaining.slice(1);
			}
		}

		return tokens;
	};

	const getPatterns = (lang: string) => {
		switch (lang) {
			case 'bash':
				return [
					{ regex: /^(curl|GET|POST|PUT|DELETE)\b/, className: 'keyword' },
					{ regex: /^(-[A-Za-z]+)/, className: 'flag' },
					{ regex: /^(https?:\/\/[^\s"']+)/, className: 'url' },
					{ regex: /^(".*?")/, className: 'string' },
					{ regex: /^('.*?')/, className: 'string' },
					{ regex: /^(#.*$)/, className: 'comment' }
				];
			case 'javascript':
				return [
					{
						regex:
							/^\b(const|let|var|function|async|await|fetch|return|if|else|try|catch|import|export|from)\b/,
						className: 'keyword'
					},
					{ regex: /^('.*?'|".*?"|`.*?`)/, className: 'string' },
					{ regex: /^(\/\/.*$)/, className: 'comment' },
					{ regex: /^\b(true|false|null|undefined)\b/, className: 'boolean' }
				];
			case 'python':
				return [
					{
						regex:
							/^\b(import|from|def|class|if|else|elif|for|while|try|except|finally|with|as|return|yield|lambda|async|await)\b/,
						className: 'keyword'
					},
					{ regex: /^('.*?'|".*?")/, className: 'string' },
					{ regex: /^(#.*$)/, className: 'comment' },
					{ regex: /^\b(True|False|None)\b/, className: 'boolean' },
					{
						regex:
							/^\b(print|len|str|int|float|list|dict|set|tuple|requests)\b/,
						className: 'builtin'
					}
				];
			case 'json':
				return [
					{ regex: /^(".*?")\s*:/, className: 'property' },
					{ regex: /^:\s*(".*?")/, className: 'string' },
					{ regex: /^:\s*(true|false|null)/, className: 'boolean' },
					{ regex: /^:\s*(\d+)/, className: 'number' }
				];
			default:
				return [];
		}
	};

	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(children);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error('Failed to copy text: ', err);
		}
	};

	return (
		<div className={classes.codeBlockContainer}>
			{language && (
				<div className={classes.languageLabel}>
					{language === 'bash'
						? 'Shell'
						: language.charAt(0).toUpperCase() + language.slice(1)}
				</div>
			)}
			<pre
				className={cx(
					classes.codeBlock,
					language && classes.codeBlockWithLabel,
					className
				)}
			>
				{language ? renderHighlightedCode(children, language) : children}
			</pre>
			{!hideCopy && (
				<Button
					className={classes.copyButton}
					size="small"
					priority="tertiary no outline"
					iconId={copied ? 'ri-file-line' : 'ri-file-copy-line'}
					onClick={copyToClipboard}
					title={copied ? 'Copié !' : 'Copier le code'}
				>
					{copied ? 'Copié !' : 'Copier'}
				</Button>
			)}
		</div>
	);
};

const useStyles = tss.withName(CodeBlock.name).create(() => ({
	codeBlockContainer: {
		position: 'relative',
		marginBottom: fr.spacing('4v')
	},
	languageLabel: {
		position: 'absolute',
		top: fr.spacing('2v'),
		left: fr.spacing('4v'),
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
		color: '#d4d4d4',
		padding: `${fr.spacing('1v')} ${fr.spacing('2v')}`,
		borderRadius: fr.spacing('1v'),
		fontSize: '0.75rem',
		fontWeight: 'bold',
		textTransform: 'uppercase',
		zIndex: 1
	},
	codeBlock: {
		backgroundColor: '#1e1e1e',
		color: '#d4d4d4',
		padding: fr.spacing('4v'),
		borderRadius: fr.spacing('2v'),
		fontSize: '0.9rem',
		overflow: 'auto',
		fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
		boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
		border: '1px solid #333',
		margin: 0,
		'& .keyword': {
			color: '#569cd6'
		},
		'& .string': {
			color: '#ce9178'
		},
		'& .comment': {
			color: '#6a9955',
			fontStyle: 'italic'
		},
		'& .boolean': {
			color: '#569cd6'
		},
		'& .number': {
			color: '#b5cea8'
		},
		'& .property': {
			color: '#9cdcfe'
		},
		'& .builtin': {
			color: '#dcdcaa'
		},
		'& .flag': {
			color: '#c586c0'
		},
		'& .url': {
			color: '#4ec9b0'
		}
	},
	codeBlockWithLabel: {
		paddingTop: fr.spacing('12v')
	},
	copyButton: {
		position: 'absolute',
		top: fr.spacing('2v'),
		right: fr.spacing('2v'),
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
		color: '#d4d4d4',
		border: '1px solid rgba(255, 255, 255, 0.2)',
		zIndex: 1,
		'&:hover': {
			backgroundColor: 'rgba(255, 255, 255, 0.2)'
		}
	}
}));

export default CodeBlock;
