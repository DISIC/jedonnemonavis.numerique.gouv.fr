import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { push } from '@socialgouv/matomo-next';
import Image from 'next/image';
import React from 'react';
import { tss } from 'tss-react/dsfr';

interface Props {
	onButtonClick: () => void;
}
const ProductEmptyState = (props: Props) => {
	const { onButtonClick } = props;
	const { cx, classes } = useStyles();

	return (
		<div className={cx(classes.container, fr.cx('fr-container'))}>
			<h1 className={cx(classes.blueText)}>Bienvenue !</h1>
			<div className={cx(fr.cx('fr-grid-row'), classes.rowContainer)}>
				<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-2')}>
					<Image
						className={cx(classes.headerImage)}
						src={'/assets/community.png'}
						alt=""
						width={120}
						height={120}
					/>{' '}
				</div>
				<div
					className={cx(
						fr.cx('fr-col', 'fr-col-12', 'fr-col-md-4'),
						classes.blocs
					)}
				>
					<h2 className={fr.cx('fr-h4')}>
						<span className={cx(classes.blueText)}>Je donne mon avis </span>{' '}
						n’est pas installé sur votre service ?
					</h2>
					<div className={cx(fr.cx('fr-pb-5v'), classes.subtitle)}>
						Commencez à{' '}
						<span className={cx(classes.boldText)}>récolter des avis </span>{' '}
						pour mieux connaître vos usagers.
					</div>
					<Button
						priority="primary"
						iconId="fr-icon-add-circle-line"
						iconPosition="right"
						className={cx(classes.btnService)}
						type="button"
						size="large"
						nativeButtonProps={{
							onClick: () => {
								onButtonClick();
								push(['trackEvent', 'BO - EmptyState', `Add Product`]);
							}
						}}
					>
						Ajouter un service
					</Button>
				</div>
				<div className={cx(classes.divider)} />
				<div
					className={cx(
						fr.cx('fr-col', 'fr-col-12', 'fr-col-md-4'),
						classes.blocs
					)}
				>
					<h2 className={fr.cx('fr-h4')}>
						<span className={cx(classes.blueText)}>Je donne mon avis</span> est
						déjà installé sur votre service ?
					</h2>
					<div className={cx(classes.subtitle)}>
						Accédez aux <span className={cx(classes.boldText)}>avis</span> et
						aux <span className={cx(classes.boldText)}>statistiques</span> en
						vous faisant inviter par vos collègues.
					</div>
				</div>
			</div>
		</div>
	);
};

const useStyles = tss.create({
	container: {
		...fr.spacing('padding', {
			topBottom: '16v'
		}),
		padding: '4rem',
		margin: '3rem auto',
		background: '#F3F6FE'
	},
	rowContainer: {
		paddingTop: '2rem'
	},
	headerImage: {
		[fr.breakpoints.down('md')]: {
			display: 'none'
		}
	},
	blocs: {
		display: 'flex',
		flexDirection: 'column',
		gap: 5
	},
	subtitle: {
		fontSize: '18px'
	},
	blueText: {
		color: fr.colors.decisions.text.actionHigh.blueFrance.default
	},
	divider: {
		borderLeft: '1px solid gray;',
		margin: '0 3rem'
	},
	boldText: {
		fontWeight: 'bold'
	},
	btnService: {
		[fr.breakpoints.down('md')]: {
			marginBottom: '2rem'
		}
	}
});

export default ProductEmptyState;
