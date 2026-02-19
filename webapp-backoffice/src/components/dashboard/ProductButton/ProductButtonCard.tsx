import { Toast } from '@/src/components/ui/Toast';
import { ButtonWithElements } from '@/src/types/prismaTypesExtended';
import { fr } from '@codegouvfr/react-dsfr';
import Alert from '@codegouvfr/react-dsfr/Alert';
import Badge from '@codegouvfr/react-dsfr/Badge';
import Button from '@codegouvfr/react-dsfr/Button';
import { RightAccessStatus } from '@prisma/client';
import { push } from '@socialgouv/matomo-next';
import { useSession } from 'next-auth/react';
import React from 'react';
import { tss } from 'tss-react/dsfr';
import { ButtonModalType } from './interface';
import {
	buttonIntegrationTypesMapping,
	buttonStylesMapping
} from '@/src/utils/content';

interface Props {
	button: ButtonWithElements;
	onButtonClick: (
		modalType: ButtonModalType,
		button: ButtonWithElements
	) => void;
	ownRight: Exclude<RightAccessStatus, 'removed'>;
}

const ProductButtonCard = (props: Props) => {
	const { button, onButtonClick, ownRight } = props;
	const { data: session } = useSession();

	const [displayToast, setDisplayToast] = React.useState(false);

	const { cx, classes } = useStyles({
		isClosed: !!button.deleted_at
	});

	const renderButtonTags = () => {
		const tags = [];

		if (button.integration_type) {
			tags.push(
				<span
					key="integration-type"
					className={cx(classes.infoTag, fr.cx('fr-tag', 'fr-tag--sm'))}
					role="status"
					aria-label={`Format : ${button.integration_type}`}
				>
					Format&nbsp;:&nbsp;
					<b>{buttonIntegrationTypesMapping[button.integration_type].label}</b>
				</span>
			);
		}

		if (button.button_style) {
			tags.push(
				<span
					key="button-style"
					className={cx(classes.infoTag, fr.cx('fr-tag', 'fr-tag--sm'))}
					role="status"
					aria-label={`Style du bouton : ${button.button_style}`}
				>
					Style du bouton&nbsp;:&nbsp;
					<b>{buttonStylesMapping[button.button_style].label}</b>
				</span>
			);
		}

		if (button.form_template_button) {
			tags.push(
				<span
					key="button-template"
					className={cx(classes.infoTag, fr.cx('fr-tag', 'fr-tag--sm'))}
					role="status"
					aria-label={`Label du bouton : ${button.form_template_button.label}`}
				>
					Label&nbsp;:&nbsp;
					<b>{button.form_template_button.label}</b>
				</span>
			);
		}

		return tags.length > 0 ? (
			<div
				className={classes.tagsContainer}
				role="region"
				aria-label="Propriétés du bouton"
			>
				{tags}
			</div>
		) : null;
	};

	return (
		<>
			<Toast
				isOpen={displayToast}
				setIsOpen={setDisplayToast}
				autoHideDuration={2000}
				severity="info"
				message="URL copiée dans le presse papier !"
			/>
			<div className={cx(classes.card, fr.cx('fr-card', 'fr-p-2w'))}>
				<div
					className={fr.cx(
						'fr-grid-row',
						'fr-grid-row--gutters',
						'fr-grid-row--middle'
					)}
				>
					<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-7')}>
						<div className={classes.titleWithTags}>
							<p
								className={cx(
									classes.title,
									fr.cx('fr-mb-0', 'fr-grid-row', 'fr-grid-row--middle')
								)}
							>
								{button.title}&nbsp;
								{button.isDeleted && (
									<Badge
										as="span"
										severity="error"
										noIcon
										small
										className="fr-ml-2v"
									>
										Fermé
									</Badge>
								)}
							</p>
							{renderButtonTags()}
						</div>
						{(button.description || button.isDeleted) && (
							<p className={fr.cx('fr-mb-0', 'fr-mt-1v', 'fr-hint-text')}>
								{button.deleted_at
									? `Fermé le ${button.deleted_at.toLocaleDateString()}` +
									  (button.delete_reason ? ` : ${button.delete_reason}` : '')
									: button.description}
							</p>
						)}
					</div>

					<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-5')}>
						<div className={cx(classes.actionsContainer)}>
							{!button.isDeleted && (
								<>
									<Button
										priority="secondary"
										size="small"
										onClick={() => {
											onButtonClick('install', button);
											push(['trackEvent', 'Gestion boutons', 'Installer']);
										}}
										className="fr-mr-md-2v"
									>
										Copier le code
									</Button>
									{ownRight === 'carrier_admin' && (
										<>
											<Button
												priority="secondary"
												size="small"
												className="fr-mr-md-2v"
												onClick={() => {
													onButtonClick('edit', button);
													push(['trackEvent', 'Gestion boutons', 'Modifier']);
												}}
											>
												Modifier
											</Button>
											{session?.user.role.includes('admin') && (
												<Button
													priority="secondary"
													size="small"
													className="fr-mr-md-2v"
													onClick={() => {
														navigator.clipboard.writeText(
															`${
																process.env.NEXT_PUBLIC_FORM_APP_URL
															}/Demarches/${
																button.form.form_template.slug !== 'root'
																	? `avis/${button.form.id}`
																	: button.form.product_id
															}?button=${button.id}`
														);
														setDisplayToast(true);
													}}
													title={`${
														process.env.NEXT_PUBLIC_FORM_APP_URL
													}/Demarches/${
														button.form.form_template.slug !== 'root'
															? `avis/${button.form.id}`
															: button.form.product_id
													}?button=${button.id}`}
												>
													Copier l'URL
												</Button>
											)}
											<Button
												priority="secondary"
												size="small"
												className={classes.deleteButton}
												aria-label="Supprimer"
												title="Supprimer"
												onClick={() => {
													onButtonClick('delete', button);
													push(['trackEvent', 'Gestion boutons', 'Supprimer']);
												}}
											>
												<span className={fr.cx('fr-hidden-md', 'fr-mr-1v')}>
													Supprimer
												</span>
												<i
													aria-hidden="true"
													className={cx(
														fr.cx('fr-icon-delete-line', 'fr-icon--sm')
													)}
												/>
											</Button>
										</>
									)}
								</>
							)}
						</div>
					</div>
				</div>

				{button.closedButtonLog && (
					<div role="status">
						<Alert
							severity="error"
							title="Tentative de dépôt d'avis"
							description={
								<>
									<p>
										Une tentative de dépôt d'avis a été effectuée sur depuis ce
										lien fermé. Nous vous invitons à supprimer le code HTML
										correspondant de la page concernée.
									</p>
									<small>
										Dernière tentative :{' '}
										{button.closedButtonLog.updated_at.toLocaleString()} —
										Nombre total de tentatives : {button.closedButtonLog.count}
									</small>
								</>
							}
							closable
							className={cx(fr.cx('fr-mt-2w'), classes.alertButtonLog)}
						/>
					</div>
				)}
			</div>
		</>
	);
};

const useStyles = tss
	.withName(ProductButtonCard.name)
	.withParams<{ isClosed: boolean }>()
	.create(({ isClosed }) => ({
		card: {
			backgroundColor: isClosed
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
			alignItems: 'center',
			justifyContent: 'flex-end',
			paddingLeft: fr.spacing('11v'),
			button: {
				textOverflow: 'ellipsis',
				whiteSpace: 'nowrap'
			},
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
		titleWithTags: {
			display: 'flex',
			flexWrap: 'wrap',
			gap: fr.spacing('2v')
		},
		tagsContainer: {
			display: 'flex',
			flexWrap: 'wrap',
			gap: fr.spacing('1v')
		},
		infoTag: {
			background: fr.colors.decisions.background.actionLow.blueFrance.default,
			color: fr.colors.decisions.text.actionHigh.blueFrance.default
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
		deleteButton: {
			color: fr.colors.decisions.text.actionHigh.redMarianne.default,
			boxShadow: `inset 0 0 0 1px ${fr.colors.decisions.text.default.error.default}`,
			border: 'none'
		}
	}));

export default ProductButtonCard;
