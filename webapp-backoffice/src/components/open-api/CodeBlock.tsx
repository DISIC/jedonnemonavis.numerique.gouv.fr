import React from 'react';
import { tss } from 'tss-react/dsfr';
import { fr } from '@codegouvfr/react-dsfr';

interface CodeBlockProps {
	children: string;
	className?: string;
}

const CodeBlock = ({ children, className }: CodeBlockProps) => {
	const { classes, cx } = useStyles();

	return <pre className={cx(classes.codeBlock, className)}>{children}</pre>;
};

const useStyles = tss.withName(CodeBlock.name).create(() => ({
	codeBlock: {
		backgroundColor: '#1e1e1e',
		color: '#d4d4d4',
		padding: fr.spacing('4v'),
		borderRadius: fr.spacing('2v'),
		fontSize: '0.9rem',
		overflow: 'auto',
		fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
		boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
		border: '1px solid #333'
	}
}));

export default CodeBlock;
