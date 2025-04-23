import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { push } from '@socialgouv/matomo-next';
import Image from 'next/image';
import React from 'react';
import { tss } from 'tss-react/dsfr';

interface Props {
	onButtonClick: () => void;
	isSmall?: boolean;
}
const NoButtonsPanel = (props: Props) => {
	const { onButtonClick, isSmall } = props;
	const { cx, classes } = useStyles();

	const getTitle = () => {
		return isSmall ? (
			<div className={cx(classes.smallTitle)}>C'est quoi un bouton JDMA ?</div>
		) : (
			<h3 className={cx(classes.title)}>C'est quoi un bouton JDMA ?</h3>
		);
	};

	return (
		<div className={cx(classes.container, fr.cx('fr-container', 'fr-p-8v', 'fr-p-md-12v'))}>
			{getTitle()}
			<div
				className={cx(
					fr.cx(
						'fr-grid-row',
						'fr-grid-row--left',
						'fr-grid-row--middle',
						'fr-pb-3v'
					),
					classes.maxWidth
				)}
			>
				<div className={fr.cx('fr-col-3')}>
					<Image
						src="/assets/chat_picto.svg"
						alt="C'est quoi un bouton JDMA ?"
						width={120}
						height={120}
						className={cx(classes.image)}
					/>
				</div>
				<div
					className={cx(
						fr.cx('fr-col-9', 'fr-pl-2v', 'fr-pl-md-0'),
						classes.textContainer
					)}
				>
					<p className={cx(fr.cx('fr-mb-0'), classes.text)}>
						Le bouton JDMA se place sur votre service numérique pour récolter
						l’avis de vos usagers.
					</p>
				</div>
			</div>
			<div className={fr.cx('fr-grid-row', 'fr-grid-row--left', 'fr-pb-3v')}>
				<div className={fr.cx('fr-col-3')}>
					<Image
						src="/assets/install_picto.svg"
						alt="C'est quoi un bouton JDMA ?"
						width={120}
						height={120}
						className={cx(classes.image)}
					/>
				</div>
				<div
					className={cx(
						fr.cx('fr-col-9', 'fr-pl-2v', 'fr-pl-md-0'),
						classes.textContainer
					)}
				>
					<p className={cx(fr.cx('fr-mb-0'), classes.text)}>
						Pour installer le bouton sur votre service numérique, insérez le
						code HTML fourni par la plateforme et commencez à récolter des avis.
					</p>
				</div>
			</div>
			<Button
				className={cx(classes.button)}
				priority="primary"
				iconId="fr-icon-add-circle-line"
				iconPosition="right"
				type="button"
				size={isSmall ? 'small' : 'medium'}
				nativeButtonProps={{
					onClick: event => {
						event.preventDefault();
						push(['trackEvent', 'BO - EmptyState', `Create-button`]);
						onButtonClick();
					}
				}}
			>
				Créer un bouton JDMA
			</Button>
		</div>
	);
};

const useStyles = tss.create({
	container: {
		...fr.spacing('padding', {}),
		background: fr.colors.decisions.artwork.background.blueCumulus.default,
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'flex-start',
		alignItems: 'flex-start'
	},
	title: {
		fontWeight: 'bold',
		fontSize: '28px',
		color: fr.colors.decisions.text.title.blueFrance.default,
		[fr.breakpoints.down('sm')]: {
			marginBottom: fr.spacing('4v'),
		}
	},
	smallTitle: {
		fontWeight: 'bold',
		fontSize: '16px',
		color: fr.colors.decisions.text.title.blueFrance.default
	},
	maxWidth: {
		width: '100%'
	},
	textContainer: {
		display: 'flex',
		alignItems: 'center'
	},
	row: {
		gap: '24px',
		paddingBottom: '12px'
	},
	text: {
		fontSize: '18px',
		[fr.breakpoints.down('sm')]: {
			fontSize: '16px'
		}
	},
	button: {
		alignSelf: 'center',
		marginTop: fr.spacing('4v'),
		[fr.breakpoints.down('md')]: {
			width: '100%',
			justifyContent: 'center'
		}
	},
	image: {
		[fr.breakpoints.down('md')]: {
			alignSelf: 'center',
			display: 'block',
			margin: '0 auto',
			width: '100%',
		}
	}
});

export default NoButtonsPanel;
