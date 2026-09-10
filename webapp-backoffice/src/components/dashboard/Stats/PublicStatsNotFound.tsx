import { fr } from '@codegouvfr/react-dsfr';
import Head from 'next/head';
import Image from 'next/image';
import { tss } from 'tss-react/dsfr';

const PublicStatsNotFound = () => {
	const { cx, classes } = useStyles();

	return (
		<div className={cx(fr.cx('fr-container'), classes.root)}>
			<Head>
				<title>Page non trouvée | Je donne mon avis</title>
				<meta name="robots" content="noindex" />
			</Head>
			<div className={classes.content}>
				<h1 className={fr.cx('fr-mb-6v')}>Page non trouvée</h1>
				<p className={cx(fr.cx('fr-text--sm', 'fr-mb-6v'), classes.mention)}>
					Erreur 404
				</p>
				<p className={fr.cx('fr-text--lead', 'fr-mb-0')}>
					La page que vous cherchez est introuvable. Si vous souhaitez consulter
					les statistiques de qualité des démarches les plus utilisées par les
					françaises et les français vous pouvez consulter l’observatoire{' '}
					<a
						className={fr.cx(
							'fr-link',
							'fr-link--icon-right',
							'fr-icon-external-link-line',
							'fr-text--lg'
						)}
						href="https://observatoire.numerique.gouv.fr/"
						target="_blank"
						rel="noopener noreferrer"
					>
						Vos démarches essentielles
						<span className={fr.cx('fr-sr-only')}>
							{' '}
							(ouvre une nouvelle fenêtre)
						</span>
					</a>
				</p>
			</div>
			<Image
				src="/assets/technical-error_picto_illu.svg"
				alt=""
				width={282}
				height={319}
				className={classes.illustration}
			/>
		</div>
	);
};

const useStyles = tss.withName({ PublicStatsNotFound }).create({
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

export default PublicStatsNotFound;
