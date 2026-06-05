import { User } from '@/prisma/generated/zod';
import AccountLayout from '@/src/layouts/Account/AccountLayout';
import { trpc } from '@/src/utils/trpc';
import { normalizeString } from '@/src/utils/tools';
import AlertEmailPreviewModal from '@/src/components/dashboard/Form/AlertEmailPreviewModal';
import NotificationsEmailPreviewModal from '@/src/components/dashboard/Form/NotificationsEmailPreviewModal';
import { Loader } from '@/src/components/ui/Loader';
import { fr } from '@codegouvfr/react-dsfr';
import Accordion from '@codegouvfr/react-dsfr/Accordion';
import Button from '@codegouvfr/react-dsfr/Button';
import { Input } from '@codegouvfr/react-dsfr/Input';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import RadioButtons from '@codegouvfr/react-dsfr/RadioButtons';
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch';
import { NotificationFrequency } from '@prisma/client';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import { tss } from 'tss-react/dsfr';
import { getServerSideProps } from '.';

interface Props {
	isOwn: Boolean;
	userId: number;
	user: User;
}

const alert_email_preview_modal = createModal({
	id: 'alert-email-preview-modal',
	isOpenedByDefault: false
});

const notifications_email_preview_modal = createModal({
	id: 'notifications-email-preview-modal',
	isOpenedByDefault: false
});

const NotificationsAccount: React.FC<Props> = props => {
	const { userId, isOwn, user } = props;
	const utils = trpc.useUtils();
	const router = useRouter();

	const { mutateAsync: updateUser } = trpc.user.update.useMutation({
		onSuccess: async () => {
			router.replace(router.asPath, undefined, { scroll: false });
		}
	});

	const [search, setSearch] = React.useState('');
	const [validatedSearch, setValidatedSearch] = React.useState('');
	const [isAlertEmailPreviewOpen, setIsAlertEmailPreviewOpen] =
		React.useState(false);
	const [isNotificationsEmailPreviewOpen, setIsNotificationsEmailPreviewOpen] =
		React.useState(false);

	const activeQuery = trpc.formAlert.getActiveSubscriptionGroups.useQuery();
	const catalogQuery = trpc.formAlert.getMySubscriptions.useQuery({
		search: validatedSearch || undefined
	});

	const activeGroups = activeQuery.data?.data ?? [];
	const catalogGroups = catalogQuery.data?.data ?? [];
	const catalogTruncated = catalogQuery.data?.truncated ?? false;

	const filteredActiveGroups = React.useMemo(() => {
		const q = normalizeString(validatedSearch.trim()).toLowerCase();
		if (!q) return activeGroups;
		return activeGroups.filter(g =>
			normalizeString(g.product.title).toLowerCase().includes(q)
		);
	}, [activeGroups, validatedSearch]);

	const previewSample = React.useMemo(() => {
		const firstGroup =
			activeGroups.find(g => g.forms.length > 0) ??
			catalogGroups.find(g => g.forms.length > 0);
		return {
			productTitle: firstGroup?.product.title,
			formTitle: firstGroup?.forms[0]?.title
		};
	}, [activeGroups, catalogGroups]);

	const isInitialLoading = activeQuery.isLoading && catalogQuery.isLoading;
	const hasAnyService = activeGroups.length > 0 || catalogGroups.length > 0;
	const combinedGroups = React.useMemo(
		() => [...filteredActiveGroups, ...catalogGroups],
		[filteredActiveGroups, catalogGroups]
	);

	const invalidateSubs = () => {
		utils.formAlert.getMySubscriptions.invalidate();
		utils.formAlert.getActiveSubscriptionGroups.invalidate();
	};

	const setSubscription = trpc.formAlert.setSubscription.useMutation({
		onSuccess: invalidateSubs
	});
	const setSubscriptionsForProduct =
		trpc.formAlert.setSubscriptionsForProduct.useMutation({
			onSuccess: invalidateSubs
		});

	const { classes, cx } = useStyles();

	const handleNotificationsChange = async (
		notifications: boolean,
		notificationsFrequency: NotificationFrequency
	): Promise<void> => {
		await updateUser({
			id: userId,
			user: {
				notifications,
				notifications_frequency: notificationsFrequency
			}
		});
	};

	const handleAlertsEnabledChange = async (
		alertsEnabled: boolean
	): Promise<void> => {
		await updateUser({
			id: userId,
			user: { alerts_enabled: alertsEnabled }
		});
	};

	const handleFormToggle = (formId: number, enabled: boolean) => {
		setSubscription.mutate({ form_id: formId, enabled });
	};

	const handleProductToggle = (productId: number, enabled: boolean) => {
		setSubscriptionsForProduct.mutate({ product_id: productId, enabled });
	};

	const renderServiceGroup = (group: (typeof catalogGroups)[number]) => {
		const allEnabled = group.forms.every(f => f.enabled);
		const anyEnabled = group.forms.some(f => f.enabled);
		const partial = anyEnabled && !allEnabled;

		return (
			<Accordion
				key={group.product.id}
				titleAs="h5"
				className={classes.serviceItem}
				label={
					<span className={classes.accordionLabel}>
						<span
							className={cx(
								classes.masterToggleGuard,
								partial && classes.partialToggle
							)}
							onClick={e => e.stopPropagation()}
						>
							<ToggleSwitch
								label={
									<span className="fr-sr-only">
										Alertes pour {group.product.title}
									</span>
								}
								inputTitle={`alerts-product-${group.product.id}`}
								checked={anyEnabled}
								disabled={!user.alerts_enabled}
								onChange={() =>
									handleProductToggle(group.product.id, !allEnabled)
								}
								showCheckedHint={false}
							/>
						</span>
						<strong className={classes.productTitle}>
							{group.product.title}
						</strong>
					</span>
				}
			>
				<ul className={classes.formsList}>
					{group.forms.map(form => (
						<li key={form.id} className={classes.formItem}>
							<ToggleSwitch
								label={form.title}
								inputTitle={`alerts-form-${form.id}`}
								checked={form.enabled}
								disabled={!user.alerts_enabled}
								onChange={checked => handleFormToggle(form.id, checked)}
								showCheckedHint={false}
								labelPosition="right"
							/>
						</li>
					))}
				</ul>
			</Accordion>
		);
	};

	return (
		<>
			<AlertEmailPreviewModal
				modal={alert_email_preview_modal}
				isOpen={isAlertEmailPreviewOpen}
				productTitle={previewSample.productTitle}
				formTitle={previewSample.formTitle}
			/>
			<NotificationsEmailPreviewModal
				modal={notifications_email_preview_modal}
				isOpen={isNotificationsEmailPreviewOpen}
				frequency={user.notifications_frequency}
				productTitle={previewSample.productTitle}
				formTitle={previewSample.formTitle}
			/>
			<AccountLayout isOwn={isOwn} user={user}>
				<Head>
					<title>
						{`${user.firstName} ${user.lastName}`} | Compte Notifications | Je
						donne mon avis
					</title>
					<meta
						name="description"
						content={`${user.firstName} ${user.lastName} | Form Notifications | Je donne mon avis`}
					/>
				</Head>
				<div className={classes.column}>
					<div className={classes.headerWrapper}>
						<h2>Notifications</h2>
					</div>
					<div className={classes.notificationsWrapper}>
						<h3 className={fr.cx('fr-mb-2v')}>Synthèse</h3>
						<p className={fr.cx('fr-text--sm')}>
							Recevez une synthèse des nouveaux avis pour l’intégralité des
							Services numériques que vous administrez
						</p>
						<hr className={fr.cx('fr-pb-10v')} />
						<form className={classes.form}>
							<ToggleSwitch
								label="Activer la synthèse"
								inputTitle="notifications"
								defaultChecked={user.notifications}
								showCheckedHint={false}
								onChange={e =>
									handleNotificationsChange(e, user.notifications_frequency)
								}
								className={fr.cx('fr-mb-2v')}
							/>

							{user.notifications && (
								<>
									<RadioButtons
										legend={<strong>Fréquence de la synthèse</strong>}
										name="notifications-frequency"
										className={fr.cx('fr-mb-0')}
										options={[
											{
												label:
													'Journalière (tous les jours à 08h heure de Paris)',
												nativeInputProps: {
													value: user.notifications_frequency,
													checked: user.notifications_frequency === 'daily',
													onChange: () =>
														handleNotificationsChange(true, 'daily')
												}
											},
											{
												label:
													'Hebdomadaire (tous les lundis à 08h heure de Paris)',
												nativeInputProps: {
													value: user.notifications_frequency,
													checked: user.notifications_frequency === 'weekly',
													onChange: () =>
														handleNotificationsChange(true, 'weekly')
												}
											},
											{
												label:
													'Mensuelle (tous les premiers lundis de chaque mois à 08h heure de Paris)',
												nativeInputProps: {
													value: user.notifications_frequency,
													checked: user.notifications_frequency === 'monthly',
													onChange: () =>
														handleNotificationsChange(true, 'monthly')
												}
											}
										]}
									/>
									<div className={fr.cx('fr-callout', 'fr-mb-0')}>
										<ul>
											<li>
												Vous recevrez un seul mail de synthèse par période,{' '}
												<strong>
													pour l’intégralité de vos services numériques.
												</strong>
											</li>
											<li>
												En l'absence de nouveaux avis sur la totalité de vos
												services, aucun mail de synthèse ne vous sera envoyé.
											</li>
											<li>
												Cette synthèse ne remplace pas les alertes, que vous
												pouvez définir sur chaque formulaire.
											</li>
										</ul>
										<span
											className={classes.previewEmailButton}
											role="button"
											onClick={() => {
												setIsNotificationsEmailPreviewOpen(true);
												notifications_email_preview_modal.open();
											}}
										>
											Voir un exemple de mail de synthèse
										</span>
									</div>
								</>
							)}
						</form>
					</div>
					<div className={classes.notificationsWrapper}>
						<h3 className={fr.cx('fr-mb-2v')}>Alertes</h3>
						<p className={fr.cx('fr-text--sm')}>
							Recevez une alerte sur le formulaire de votre choix, dès que vous
							recevez des avis
						</p>
						<hr className={fr.cx('fr-pb-10v')} />
						<ToggleSwitch
							label="Activer les alertes"
							inputTitle="alerts-enabled"
							checked={user.alerts_enabled}
							showCheckedHint={false}
							onChange={checked => handleAlertsEnabledChange(checked)}
							className={fr.cx('fr-mb-6v')}
						/>
						<div>
							{(hasAnyService || validatedSearch) && (
								<div className={classes.servicesHeader}>
									<p
										className={cx(
											fr.cx('fr-text--md', 'fr-mb-0'),
											classes.boldTitle
										)}
									>
										Services
									</p>
									<form
										role="search"
										className={cx(fr.cx('fr-search-bar'), classes.searchBar)}
										onSubmit={e => {
											e.preventDefault();
											setValidatedSearch(search.trim());
										}}
									>
										<Input
											label="Rechercher un service"
											hideLabel
											nativeInputProps={{
												placeholder: 'Rechercher un service',
												type: 'search',
												value: search,
												onChange: e => {
													const value = e.target.value;
													setSearch(value);
													if (!value) setValidatedSearch('');
												}
											}}
										/>
										<Button
											priority="primary"
											type="submit"
											iconId="ri-search-2-line"
											title="Rechercher"
										>
											Rechercher
										</Button>
									</form>
								</div>
							)}
							{isInitialLoading ? (
								<Loader />
							) : !hasAnyService && !validatedSearch ? (
								<p className={fr.cx('fr-text--sm', 'fr-mb-0')}>
									Vous n'avez accès à aucun service pour le moment.
								</p>
							) : combinedGroups.length === 0 ? (
								<p className={fr.cx('fr-text--sm', 'fr-mb-0')}>
									Aucun service ne correspond à votre recherche.
								</p>
							) : (
								<>
									<div className={classes.services}>
										{combinedGroups.map(renderServiceGroup)}
									</div>
									{catalogTruncated && (
										<p className={fr.cx('fr-text--sm', 'fr-mt-3v', 'fr-mb-0')}>
											Affinez votre recherche pour voir plus de services.
										</p>
									)}
								</>
							)}
							{!isInitialLoading && (hasAnyService || validatedSearch) && (
								<div className={fr.cx('fr-callout', 'fr-mb-0', 'fr-mt-6v')}>
									<ul>
										<li>
											Un mail d’alerte est envoyé pour{' '}
											<strong>chaque formulaire, séparément</strong>
										</li>
										<li>
											En l'absence de nouvelles alertes, aucun mail ne vous sera
											envoyé
										</li>
									</ul>
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
							)}
						</div>
					</div>
				</div>
			</AccountLayout>
		</>
	);
};

const useStyles = tss.withName({ NotificationsAccount }).create({
	loaderWrapper: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		minHeight: '100vh'
	},
	headerWrapper: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between'
	},
	column: {
		display: 'flex',
		flexDirection: 'column',
		ul: { margin: 0 }
	},
	droppableArea: {
		padding: '8px',
		backgroundColor: '#f4f4f4',
		minHeight: '200px'
	},
	urlsWrapper: {
		display: 'flex',
		flexWrap: 'wrap',
		gap: fr.spacing('4v')
	},
	notificationsWrapper: {
		display: 'flex',
		flexDirection: 'column',
		padding: fr.spacing('8v'),
		marginBottom: fr.spacing('12v'),
		border: `1px solid ${fr.colors.decisions.border.default.grey.default}`
	},
	divider: {
		border: `1px solid ${fr.colors.decisions.border.default.grey.default}`
	},
	notificationToggle: {
		display: 'flex',
		alignItems: 'center',
		gap: fr.spacing('4v')
	},
	form: {
		display: 'flex',
		flexDirection: 'column',
		gap: fr.spacing('6v')
	},
	boldTitle: {
		fontWeight: 'bold',
		color: fr.colors.decisions.text.title.grey.default
	},
	services: {
		display: 'flex',
		flexDirection: 'column'
	},
	servicesHeader: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: fr.spacing('4v'),
		marginBottom: fr.spacing('4v'),
		[fr.breakpoints.down('md')]: {
			flexDirection: 'column',
			alignItems: 'stretch'
		}
	},
	searchBar: {
		'.fr-input-group': { marginBottom: 0 },
		'.fr-input': { width: '100%' },
		[fr.breakpoints.down('md')]: {
			flex: '1 1 auto'
		}
	},
	accordionLabel: {
		display: 'inline-flex',
		alignItems: 'center',
		gap: fr.spacing('4v'),
		width: '100%'
	},
	masterToggleGuard: {
		display: 'inline-flex',
		alignItems: 'center',
		flexShrink: 0
	},
	productTitle: {
		flex: 1
	},
	partialToggle: {
		'& .fr-toggle input[type="checkbox"]:checked ~ .fr-toggle__label::after': {
			transform: 'translateX(0)',
			backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000091' d='M5 11h14v2H5z'/%3E%3C/svg%3E")`
		}
	},
	serviceItem: {
		'.fr-accordion__btn': {
			...fr.spacing('padding', { left: 0, top: '4v' })
		},
		'.fr-collapse': {
			padding: 0,
			...fr.spacing('margin', { rightLeft: 0 }),
			backgroundColor: fr.colors.decisions.background.default.grey.hover
		},
		'.fr-accordion__btn[aria-expanded="true"]': {
			backgroundColor: 'white',
			':hover': {
				backgroundColor: fr.colors.decisions.background.raised.grey.active
			},
			':active': {
				backgroundColor: fr.colors.decisions.background.overlap.grey.hover
			}
		}
	},
	formsList: {
		listStyle: 'none',
		padding: 0,
		margin: 0,
		display: 'flex',
		flexDirection: 'column'
	},
	formItem: {
		...fr.spacing('padding', {
			top: '4v',
			bottom: '3v',
			right: '4v',
			left: '10v'
		}),
		borderBottom: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
		'&:last-child': { borderBottom: 'none' }
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
	}
});

export default NotificationsAccount;

export { getServerSideProps };
