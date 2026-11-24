import { fr } from '@codegouvfr/react-dsfr';
import Image from 'next/image';
import { ReactNode } from 'react';
import { tss } from 'tss-react/dsfr';

type ErrorPageProps = {
	title: string;
	errorCode: string;
	lead: ReactNode;
	children?: ReactNode;
};

const ErrorPage = ({ title, errorCode, lead, children }: ErrorPageProps) => {
	const { classes, cx } = useStyles();

	return (
		<div className={cx(fr.cx('fr-container'), classes.root)}>
			<div className={classes.content}>
				<h1 className={fr.cx('fr-mb-6v')}>{title}</h1>
				<p className={cx(fr.cx('fr-text--sm', 'fr-mb-6v'), classes.mention)}>
					{errorCode}
				</p>
				<p className={fr.cx('fr-text--lead', 'fr-mb-6v')}>{lead}</p>
				{children}
			</div>
			<Image
				src="/Demarches/assets/technical-error_picto_illu.svg"
				alt=""
				width={282}
				height={319}
				className={classes.illustration}
			/>
		</div>
	);
};

const useStyles = tss.withName({ ErrorPage }).create({
	root: {
		maxWidth: 996,
		minHeight: '60vh',
		display: 'flex',
		alignItems: 'center',
		gap: fr.spacing('16v'),
		marginTop: fr.spacing('16v'),
		marginBottom: fr.spacing('20v'),
		[fr.breakpoints.down('md')]: {
			flexDirection: 'column-reverse',
			gap: fr.spacing('8v')
		}
	},
	content: {
		flex: '1 0 0',
		minWidth: 0
	},
	mention: {
		color: fr.colors.decisions.text.mention.grey.default
	},
	illustration: {
		flexShrink: 0,
		[fr.breakpoints.down('md')]: {
			maxHeight: 200,
			width: 'auto'
		}
	}
});

export default ErrorPage;
