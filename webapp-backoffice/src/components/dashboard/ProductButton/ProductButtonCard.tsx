import { formatDateToFrenchString } from '@/src/utils/tools';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { Tag } from '@codegouvfr/react-dsfr/Tag';
import { Button as PrismaButtonType, RightAccessStatus } from '@prisma/client';
import React from 'react';
import { Menu, MenuItem } from '@mui/material';
import { tss } from 'tss-react/dsfr';
import { push } from '@socialgouv/matomo-next';

interface Props {
	button: PrismaButtonType;
	onButtonClick: (modalType: string, button?: PrismaButtonType) => void;
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
						<p className={fr.cx('fr-mb-0')}>{button.title}</p>
						<p className={fr.cx('fr-mb-0', 'fr-hint-text')}>
							{button.description}
						</p>
					</div>

					<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-4')}>
						<div className={cx(classes.actionsContainer)}>
							{button.isTest && <Tag className={cx(classes.tag)}>Test</Tag>}
							<Button
								id="button-options"
								aria-controls={menuOpen ? 'option-menu' : undefined}
								aria-haspopup="true"
								aria-expanded={menuOpen ? 'true' : undefined}
								priority="secondary"
								size="small"
								onClick={handleClick}
								iconId={
									menuOpen ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'
								}
								iconPosition="right"
							>
								Options
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
										onButtonClick('install', button);
										push(['trackEvent', 'Gestion boutons', 'Installer']);
										handleClose();
									}}
								>
									Voir le code
								</MenuItem>
								<MenuItem
									onClick={() => {
										navigator.clipboard.writeText(
											`https://jedonnemonavis.numerique.gouv.fr/Demarches/${button.product_id}?button=${button.id}`
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
				: fr.colors.decisions.background.default.grey.default
		},
		actionsContainer: {
			display: 'flex',
			flexWrap: 'wrap',
			alignItems: 'center',
			justifyContent: 'flex-end',
			paddingLeft: fr.spacing('11v')
		},
		tag: {}
	}));

export default ProductButtonCard;
