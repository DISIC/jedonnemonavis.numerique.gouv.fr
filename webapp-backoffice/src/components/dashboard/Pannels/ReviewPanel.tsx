import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import React from 'react';
import { tss } from 'tss-react/dsfr';

interface Props {
	improveBtnClick: () => void;
	sendInvitationBtnClick: () => void;
}

const ProductEmptyState = (props: Props) => {
	const { improveBtnClick, sendInvitationBtnClick } = props;
	const { cx, classes } = useStyles();

	return (
		<div
			className={cx(classes.container, classes.boldText, fr.cx('fr-container'))}
		>
			<div className={cx(classes.boldText, classes.subtitle)}>
				En attendant vos premiers avis...
			</div>
			<div
				className={cx(
					fr.cx('fr-grid-row', 'fr-grid-row--center'),
					classes.rowContainer
				)}
			>
				<div
					className={cx(
						fr.cx('fr-col', 'fr-col-12', 'fr-col-md-4'),
						classes.blocs
					)}
				>
					<div className={cx(fr.cx('fr-pb-5v'))}>
						Nos conseil pour obtenir plus d'avis !
					</div>
					<Button
						priority="secondary"
						className={cx(classes.btnService)}
						type="button"
						size="medium"
						nativeButtonProps={{
							onClick: event => {
								event.preventDefault();
								improveBtnClick();
							}
						}}
					>
						Améliorer le placement de votre bouton
					</Button>
				</div>
				<div className={cx(classes.divider)} />
				<div
					className={cx(
						fr.cx('fr-col', 'fr-col-12', 'fr-col-md-4'),
						classes.blocs
					)}
				>
					<div className={cx(fr.cx('fr-pb-5v'))}>
						Invitez de nouveaux administrateurs.
					</div>
					<Button
						priority="secondary"
						className={cx(classes.btnService)}
						type="button"
						size="medium"
						nativeButtonProps={{
							onClick: event => {
								event.preventDefault();
								sendInvitationBtnClick();
							}
						}}
					>
						Envoyer une invitation
					</Button>
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
		padding: '1.5rem',
		background: '#F3F6FE',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'column'
	},
	rowContainer: {
		width: '100%'
	},

	blocs: {
		display: 'flex',
		flexDirection: 'column',
		padding: '0 !important'
	},
	subtitle: {
		fontSize: '18px',
		paddingBottom: '2rem'
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
