import {
	ButtonWithClosedLog,
	ButtonWithForm
} from '@/src/types/prismaTypesExtended';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { Tag } from '@codegouvfr/react-dsfr/Tag';
import { Menu, MenuItem } from '@mui/material';
import { RightAccessStatus } from '@prisma/client';
import { push } from '@socialgouv/matomo-next';
import React from 'react';
import { tss } from 'tss-react/dsfr';
import { ButtonModalType } from './ButtonModal';
import Badge from '@codegouvfr/react-dsfr/Badge';
import Alert from '@codegouvfr/react-dsfr/Alert';

interface Props {
	button: ButtonWithForm & ButtonWithClosedLog;
	onButtonClick: (modalType: ButtonModalType, button?: ButtonWithForm) => void;
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

	const { cx, classes } = useStyles({
		isTest: button.isTest || false,
		isClosed: !!button.deleted_at
	});

	const isMobile = window.innerWidth <= fr.breakpoints.getPxValues().md;

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
						<p className={cx(classes.title, fr.cx('fr-mb-0'))}>
							{button.title}
						</p>
						{(button.description || button.deleted_at) && (
							<p className={fr.cx('fr-mb-0', 'fr-mt-1v', 'fr-hint-text')}>
								{button.deleted_at
									? `Fermé le ${button.deleted_at.toLocaleDateString()}` +
										(button.delete_reason ? ` : ${button.delete_reason}` : '')
									: button.description}
							</p>
						)}
					</div>

					<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-4')}>
						<div className={cx(classes.actionsContainer)}>
							{button.deleted_at ? (
								<Badge severity="error" noIcon>
									Fermé
								</Badge>
							) : (
								<>
									{button.isTest && <Tag className={cx(classes.tag)}>Test</Tag>}
									<Button
										priority="secondary"
										size="small"
										onClick={() => {
											onButtonClick('install', button);
											push(['trackEvent', 'Gestion boutons', 'Installer']);
											handleClose();
										}}
										className="fr-mr-md-2v"
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
										iconId={
											isMobile
												? menuOpen
													? 'ri-arrow-up-s-line'
													: 'ri-arrow-down-s-line'
												: 'ri-more-2-fill'
										}
										iconPosition={isMobile ? 'right' : undefined}
										className={cx(classes.buttonWrapper)}
									>
										{isMobile && 'Options'}
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
													onButtonClick('edit', button);
													handleClose();
												}}
											>
												<i
													className={cx(
														fr.cx(
															'fr-icon-edit-line',
															'fr-mr-2v',
															'fr-icon--sm'
														)
													)}
												/>
												Modifier
											</MenuItem>
										)}
										<MenuItem
											onClick={() => {
												navigator.clipboard.writeText(
													`${process.env.NEXT_PUBLIC_FORM_APP_URL}/Demarches/${button.form.product_id}?button=${button.id}`
												);
												handleClose();
											}}
										>
											<i
												className={cx(
													fr.cx('ri-file-copy-line', 'fr-mr-2v', 'fr-icon--sm')
												)}
											/>
											Copier le lien du formulaire
										</MenuItem>
										{ownRight === 'carrier_admin' && (
											<MenuItem
												onClick={() => {
													onButtonClick('delete', button);
													handleClose();
												}}
												style={{
													color:
														fr.colors.decisions.text.actionHigh.redMarianne
															.default
												}}
											>
												<i
													className={cx(
														fr.cx(
															'fr-icon-delete-line',
															'fr-mr-2v',
															'fr-icon--sm'
														)
													)}
												/>
												Fermer l'emplacement
											</MenuItem>
										)}
									</Menu>
								</>
							)}
						</div>
					</div>
				</div>

				{button.closedButtonLog && (
					<Alert
						severity="error"
						title="Tentative de dépôt d'avis"
						description={
							<>
								<p>
									Une tentative de dépôt d'avis a été effectuée sur cet
									emplacement fermé. Nous vous invitons à supprimer le code HTML
									correspondant de la page concernée.
								</p>
								<small>
									Dernière tentative :{' '}
									{button.closedButtonLog.updated_at.toLocaleString()} — Nombre
									total de tentatives : {button.closedButtonLog.count}
								</small>
							</>
						}
						closable
						className={cx(fr.cx('fr-mt-2w'), classes.alertButtonLog)}
						as="h4"
					/>
				)}
			</div>
		</>
	);
};

const useStyles = tss
	.withName(ProductButtonCard.name)
	.withParams<{ isTest: boolean; isClosed: boolean }>()
	.create(({ isTest, isClosed }) => ({
		card: {
			backgroundColor: isTest
				? fr.colors.decisions.border.default.grey.default
				: isClosed
					? fr.colors.decisions.background.default.grey.hover
					: fr.colors.decisions.background.alt.blueFrance.default,
			height: 'auto!important',
			backgroundImage: 'none!important'
		},
		title: {
			fontWeight: 'bold'
		},
		actionsContainer: {
			display: 'flex',
			flexWrap: 'wrap',
			alignItems: 'center',
			justifyContent: 'flex-end',
			paddingLeft: fr.spacing('11v'),
			[fr.breakpoints.down('md')]: {
				paddingLeft: 0,
				flexDirection: 'column',
				justifyContent: 'flex-start',
				gap: fr.spacing('4v'),
				button: {
					width: '100%',
					justifyContent: 'center'
				}
			}
		},
		buttonWrapper: {
			'&::before': {
				marginRight: '0 !important'
			}
		},
		alertButtonLog: {
			'.fr-link--close': {
				color: fr.colors.decisions.text.actionHigh.redMarianne.default
			}
		},
		tag: {}
	}));

export default ProductButtonCard;
