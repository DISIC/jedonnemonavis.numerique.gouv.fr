import { Loader } from '@/src/components/ui/Loader';
import { getServerSideProps } from '@/src/pages/administration/dashboard/product/[id]/forms/[form_id]';
import {
	ButtonWithElements,
	FormWithElements
} from '@/src/types/prismaTypesExtended';
import { trpc } from '@/src/utils/trpc';
import { fr, FrIconClassName, RiIconClassName } from '@codegouvfr/react-dsfr';
import Alert from '@codegouvfr/react-dsfr/Alert';
import { Button as ButtonDSFR } from '@codegouvfr/react-dsfr/Button';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { tss } from 'tss-react/dsfr';
import FormDeleteModal from '../FormDeleteModal';
import AlertEmailPreviewModal from '../AlertEmailPreviewModal';

interface Props {
	form: FormWithElements;
	alertText: string;
	isAlertShown: boolean;
	setIsAlertShown: (value: boolean) => void;
	buttons: ButtonWithElements[];
	isLoading: boolean;
}

const delete_form_modal = createModal({
	id: 'delete-form-modal',
	isOpenedByDefault: false
});

const alert_email_preview_modal = createModal({
	id: 'alert-email-preview-modal',
	isOpenedByDefault: false
});
const SettingsTab = ({
	form,
	alertText,
	isAlertShown,
	setIsAlertShown,
	buttons,
	isLoading
}: Props) => {
	const router = useRouter();

	const { cx, classes } = useStyles();
	const [isCopied, setIsCopied] = useState(false);
	const [isAlertEmailPreviewOpen, setIsAlertEmailPreviewOpen] = useState(false);

	const deleteButton = trpc.button.delete.useMutation();

	const { data: meData } = trpc.user.me.useQuery({});
	const currentUser = meData?.data;
	const alertsPaused = currentUser?.alerts_enabled === false;

	const subscriptionQuery = trpc.formAlert.getSubscription.useQuery({
		form_id: form.id
	});
	const isSubscribed = subscriptionQuery.data?.data.enabled ?? false;

	const setSubscription = trpc.formAlert.setSubscription.useMutation({
		onSuccess: () => subscriptionQuery.refetch()
	});

	const isLocked = form.isTop250 || !!form.isDeleted;

	const deleteAllButtons = async () => {
		await Promise.all(
			buttons.map(button => {
				const { form, closedButtonLog, form_template_button, ...data } = button;
				return deleteButton.mutateAsync({
					buttonPayload: { ...data, deleted_at: new Date(), isDeleted: true },
					shouldLogEvent: false,
					product_id: form.product_id,
					title: button.title
				});
			})
		);
		router.push(
			`/administration/dashboard/product/${
				form.product_id
			}/forms?alert=${encodeURIComponent(
				`Le formulaire "${
					form.title || form.form_template.title
				}" et tous les liens d'intégration associés ont bien été fermés.`
			)}`
		);
	};

	if (isLoading) {
		return (
			<div className={cx(classes.loaderContainer)}>
				<Loader />
			</div>
		);
	}

	return (
		<div className={fr.cx('fr-grid-row')}>
			<div role="alert">
				<Alert
					className={fr.cx('fr-col-12', 'fr-mb-6v')}
					description={alertText}
					severity="success"
					small
					closable
					isClosed={!isAlertShown}
					onClose={() => setIsAlertShown(false)}
				/>
			</div>
			<h2 className={fr.cx('fr-col-12', 'fr-mb-7v')}>Paramètres</h2>

			<FormDeleteModal
				modal={delete_form_modal}
				form={form}
				onDelete={deleteAllButtons}
			/>
			<AlertEmailPreviewModal
				modal={alert_email_preview_modal}
				isOpen={isAlertEmailPreviewOpen}
				productTitle={form.product.title}
				formTitle={form.title || form.form_template.title}
			/>

			<div className={fr.cx('fr-col-12', 'fr-mb-10v')}>
				<span className={fr.cx('fr-text--bold')} style={{ userSelect: 'none' }}>
					Identifiant de formulaire
				</span>
				<span className={fr.cx('fr-ml-2v', 'fr-mr-4v')}>#{form.id}</span>
				<ButtonDSFR
					priority="secondary"
					size="small"
					onClick={() => {
						navigator.clipboard.writeText(form.id.toString());
						setIsCopied(true);
						setTimeout(() => setIsCopied(false), 2000);
					}}
					className="fr-mr-md-2v"
					iconId={isCopied ? 'fr-icon-check-line' : 'ri-file-copy-line'}
					iconPosition="right"
				>
					Copier
				</ButtonDSFR>
			</div>

			{!form.isDeleted && (
				<>
					<div className={fr.cx('fr-col-12', 'fr-col-md-8', 'fr-mb-6v')}>
						<h3 className={fr.cx('fr-mb-0', 'fr-h4')}>
							Configurer des alertes
						</h3>
					</div>
					<div className={fr.cx('fr-grid-row', 'fr-grid-row--middle')}>
						<div className={fr.cx('fr-col-12', 'fr-mb-10v')}>
							<p className={fr.cx('fr-mb-2v')}>
								<strong>
									Définissez les types de réponse qui ont besoin d’une attention
									particulière
								</strong>{' '}
								et soyez averti par email lorsqu’ils sont déposés. Vous pouvez
								également activer ou désactiver les alertes de tous vos
								formulaires et services numériques depuis le menu{' '}
								<a
									href={`/administration/dashboard/user/${currentUser?.id}/notifications`}
								>
									Notifications{' '}
									<i
										className={fr.cx(
											'fr-icon-notification-3-line',
											'fr-icon--sm'
										)}
									/>
								</a>{' '}
								de votre compte.
							</p>
							<span
								className={classes.previewEmailButton}
								role="button"
								onClick={() => {
									setIsAlertEmailPreviewOpen(true);
									alert_email_preview_modal.open();
								}}
							>
								Voir un exemple de mail d’alerte
							</span>
						</div>

						<div
							className={cx(
								classes.alertsSection,
								alertsPaused && classes.alertsPaused,
								fr.cx(!isLocked && 'fr-mb-12v')
							)}
						>
							{alertsPaused && (
								<div className={classes.alertsPausedNotice}>
									<p
										className={fr.cx('fr-mb-0', 'fr-text--lg', 'fr-text--bold')}
									>
										Alertes en pause sur votre compte
									</p>{' '}
									<a
										href={`/administration/dashboard/user/${currentUser?.id}/notifications`}
										className={fr.cx('fr-link')}
									>
										Réactiver les alertes
									</a>
								</div>
							)}
							<ToggleSwitch
								label="Activer les alertes sur le formulaire"
								inputTitle={`Alertes pour le formulaire ${form.title || ''}`}
								showCheckedHint={false}
								helperText={`Les emails d’alerte seront envoyées à l’email ${currentUser?.email}`}
								disabled={subscriptionQuery.isLoading || alertsPaused}
								checked={isSubscribed}
								onChange={checked =>
									setSubscription.mutate({
										form_id: form.id,
										enabled: checked
									})
								}
							/>
						</div>
					</div>
					{!isLocked && (
						<>
							<hr className={fr.cx('fr-col-12', 'fr-pb-12v')} />
							<div className={fr.cx('fr-col-12', 'fr-col-md-8', 'fr-mb-6v')}>
								<h3 className={fr.cx('fr-mb-0', 'fr-h4')}>
									Fermer le formulaire
								</h3>
							</div>
							<div className={fr.cx('fr-col-12', 'fr-card', 'fr-p-6v')}>
								<div className={fr.cx('fr-grid-row', 'fr-grid-row--middle')}>
									<div className={fr.cx('fr-col-12', 'fr-col-md-8')}>
										<p className={fr.cx('fr-mb-0')}>
											Le formulaire n'enregistrera plus de nouvelles réponses.
											Cette action est irréversible.
										</p>
									</div>
									<div
										className={cx(
											classes.buttonContainer,
											fr.cx('fr-col-12', 'fr-col-md-4')
										)}
									>
										<ButtonDSFR
											priority="tertiary"
											iconId="fr-icon-delete-line"
											style={{
												color: isLocked
													? undefined
													: fr.colors.decisions.text.default.error.default
											}}
											className={fr.cx('fr-ml-auto')}
											iconPosition="right"
											disabled={isLocked}
											onClick={() => {
												delete_form_modal.open();
											}}
										>
											Fermer le formulaire
										</ButtonDSFR>
									</div>
								</div>
							</div>
						</>
					)}
				</>
			)}
		</div>
	);
};
const useStyles = tss.withName({ SettingsTab }).create({
	container: {
		...fr.spacing('padding', {}),
		background: fr.colors.decisions.artwork.decorative.blueFrance.default,
		a: {
			color: fr.colors.decisions.text.title.blueFrance.default
		}
	},
	loaderContainer: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		height: '500px',
		width: '100%'
	},
	buttonsGroup: {
		display: 'flex',
		justifyContent: 'center',
		gap: fr.spacing('4v'),
		alignSelf: 'center',
		button: {
			a: {
				display: 'flex',
				alignItems: 'center'
			}
		},
		[fr.breakpoints.down('md')]: {
			marginTop: fr.spacing('4v'),
			button: {
				width: '100%',
				justifyContent: 'center'
			}
		}
	},
	content: {
		display: 'flex',
		alignItems: 'center',
		marginBottom: fr.spacing('3v'),
		p: {
			margin: 0
		},
		[fr.breakpoints.down('md')]: {
			flexDirection: 'column',
			alignItems: 'flex-start',
			marginBottom: fr.spacing('6v')
		}
	},
	indicatorIcon: {
		width: fr.spacing('12v'),
		height: fr.spacing('12v'),
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: '50%',
		backgroundColor: 'white'
	},
	icon: {
		color: fr.colors.decisions.background.flat.blueFrance.default,
		'::before': {
			'--icon-size': fr.spacing('7v')
		}
	},
	previewEmailButton: {
		textWrap: 'nowrap',
		fontSize: '0.875rem',
		color: fr.colors.decisions.text.actionHigh.blueFrance.default,
		backgroundImage: `linear-gradient(0deg, currentColor, currentColor)`,
		backgroundSize: '100% 1px',
		backgroundPosition: '0 100%',
		backgroundRepeat: 'no-repeat',
		'&:hover': {
			cursor: 'pointer',
			backgroundSize: '100% 2.25px'
		},
		[fr.breakpoints.down('md')]: {
			width: '100%',
			justifyContent: 'center'
		}
	},
	containerTitle: {
		textAlign: 'center',
		fontWeight: 'bold',
		fontSize: '1.125rem',
		lineHeight: '1.75rem'
	},
	buttonContainer: {
		display: 'flex',
		justifyContent: 'end',
		[fr.breakpoints.down('md')]: {
			marginTop: fr.spacing('4v'),
			button: {
				width: '100%',
				justifyContent: 'center'
			}
		}
	},
	alertsSection: {
		width: '100%',
		position: 'relative',
		'& .fr-toggle .fr-hint-text': { marginTop: fr.spacing('1v') },
		'& .fr-toggle__label': {}
	},
	alertsPaused: {
		padding: fr.spacing('6v'),
		borderRadius: fr.spacing('1v'),
		backgroundColor: fr.colors.decisions.background.default.grey.hover,
		'& .fr-toggle': { pointerEvents: 'none' }
	},
	alertsPausedNotice: {
		display: 'flex',
		alignItems: 'center',
		gap: fr.spacing('4v'),
		marginBottom: fr.spacing('3v'),
		[fr.breakpoints.down('sm')]: {
			flexDirection: 'column',
			alignItems: 'flex-start',
			gap: 0,
			marginBottom: fr.spacing('6v')
		}
	}
});

export default SettingsTab;

export { getServerSideProps };
