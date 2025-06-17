import { fr } from '@codegouvfr/react-dsfr';
import Image from 'next/image';
import React from 'react';
import { tss } from 'tss-react/dsfr';

const NoReviewsDashboardPanel = () => {
	const { cx, classes } = useStyles();

	return (
		<div className={cx(classes.mainContainer, fr.cx('fr-container'))}>
			<Image
				src="/assets/chat_picto.svg"
				alt="Picto feuille de route"
				width={120}
				height={120}
			/>
			<div className={classes.container}>
				<span className={classes.smallTitle}>
					Il n’y a aucun avis pour le moment
				</span>
				<p className={fr.cx('fr-mt-3v', 'fr-mb-0')}>
					Vous n’avez pas encore reçu d’avis de la part de vos utilisateurs.
				</p>
				<p className={fr.cx('fr-mb-3v')}>
					En attendant, vous pouvez découvrir nos conseils pour bien placer le
					bouton de récolte d’avis :
				</p>
				<a href="#" target="_blank">
					Améliorer le placement de votre bouton
				</a>
			</div>
		</div>
	);
};

const useStyles = tss.create({
	mainContainer: {
		...fr.spacing('padding', {}),
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		gap: fr.spacing('6v'),
		maxWidth: '65%',
		[fr.breakpoints.down('md')]: {
			flexDirection: 'column',
			maxWidth: '100%'
		}
	},
	container: {
		...fr.spacing('padding', {}),
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
		a: {
			color: fr.colors.decisions.text.title.blueFrance.default
		}
	},
	smallTitle: {
		fontWeight: 'bold',
		fontSize: '20px',
		lineHeight: '28px'
	}
});

export default NoReviewsDashboardPanel;
