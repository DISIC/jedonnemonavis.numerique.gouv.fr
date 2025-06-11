import { ButtonWithForm } from '@/src/types/prismaTypesExtended';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { Tag } from '@codegouvfr/react-dsfr/Tag';
import { Menu, MenuItem } from '@mui/material';
import { RightAccessStatus } from '@prisma/client';
import { push } from '@socialgouv/matomo-next';
import React from 'react';
import { tss } from 'tss-react/dsfr';

interface Props {
	button: ButtonWithForm;
	onButtonClick: (modalType: string, button?: ButtonWithForm) => void;
	ownRight: Exclude<RightAccessStatus, 'removed'>;
}

const ProductButtonCard = (props: Props) => {
	const { button, onButtonClick, ownRight } = props;
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const menuOpen = Boolean(anchorEl);
	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
		push(['trackEvent', 'BO - Product', `Open-Menu`]);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};

	const { cx, classes } = useStyles({ isTest: button.isTest || false });

	return (
		<>
			<div
				className={cx(classes.card, fr.cx('fr-card', 'fr-my-3v', 'fr-p-2w'))}
			>
				<div
					className={fr.cx(
						'fr-grid-row',
						'fr-grid-row--gutters',
						'fr-grid-row--middle'
					)}
				>
					<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-8')}>
						<p className={cx(classes.title, fr.cx('fr-mb-0'))}>{button.title}</p>
						{button.description && (
							<p className={fr.cx('fr-mb-0', 'fr-mt-1v', 'fr-hint-text')}>
								{button.description}
							</p>
						)}
					</div>

					<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-4')}>
						<div className={cx(classes.actionsContainer)}>
							{button.isTest && <Tag className={cx(classes.tag)}>Test</Tag>}
							<Button
								priority="secondary"
								size="small"
								onClick={() => {
									onButtonClick('install', button);
									push(['trackEvent', 'Gestion boutons', 'Installer']);
									handleClose();
								}}
								className='fr-mr-2v'
							>
								Voir le code
							</Button>
							<Button
								id="button-options"
								aria-controls={menuOpen ? 'option-menu' : undefined}
								aria-haspopup="true"
								aria-expanded={menuOpen ? 'true' : undefined}
								title={`Ouvrir le menu contextuel du bouton « ${button.title} »`}
								priority="secondary"
								size="small"
								onClick={handleClick}
								iconId={'ri-more-2-fill'}
								className={cx(classes.buttonWrapper)}
							>
								<span
									className={fr.cx('fr-hidden')}
								>{`Ouvrir le menu contextuel du bouton « ${button.title} »`}</span>
							</Button>
							<Menu
								id="option-menu"
								open={menuOpen}
								anchorEl={anchorEl}
								onClose={handleClose}
								MenuListProps={{
									'aria-labelledby': 'button-options'
								}}
							>
								{ownRight === 'carrier_admin' && (
									<MenuItem
										onClick={() => {
											onButtonClick('edit', button), handleClose();
										}}
									>
										Modifier
									</MenuItem>
								)}
								{/* <MenuItem onClick={() => onButtonClick('merge')}>
								Fusionner avec un autre bouton
							</MenuItem>
							<MenuItem
								onClick={() => onButtonClick('archive', button)}
								style={{
									color: fr.colors.decisions.background.flat.error.default
								}}
							>
								Archiver bouton
							</MenuItem> */}
								<MenuItem
									onClick={() => {
										navigator.clipboard.writeText(
											`https://jedonnemonavis.numerique.gouv.fr/Demarches/${button.form.product_id}?button=${button.id}`
										);
										handleClose();
									}}
								>
									Copier le lien du formulaire
								</MenuItem>
							</Menu>
							{/* {!button.isTest && (
								<Button
									size="small"
									onClick={() => {
										onButtonClick('install', button);
										push(['trackEvent', 'Gestion boutons', 'Installer']);
									}}
								>
									Installer
								</Button>
							)} */}
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

const useStyles = tss
	.withName(ProductButtonCard.name)
	.withParams<{ isTest: boolean }>()
	.create(({ isTest }) => ({
		card: {
			backgroundColor: isTest
				? fr.colors.decisions.border.default.grey.default
				: fr.colors.decisions.background.alt.blueFrance.default,
			height: 'auto!important',
			backgroundImage: 'none!important',
		},
		title: {
			fontWeight: 'bold',
		},
		actionsContainer: {
			display: 'flex',
			flexWrap: 'wrap',
			alignItems: 'center',
			justifyContent: 'flex-end',
			paddingLeft: fr.spacing('11v')
		},
		buttonWrapper: {
			'&::before': {
				marginRight: '0 !important'
			}
		},
		tag: {}
	}));

export default ProductButtonCard;
