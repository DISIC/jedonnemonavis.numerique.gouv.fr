import { User } from '@/prisma/generated/zod';
import AccountLayout from '@/src/layouts/Account/AccountLayout';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Accordion from '@codegouvfr/react-dsfr/Accordion';
import Button from '@codegouvfr/react-dsfr/Button';
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

const NotificationsAccount: React.FC<Props> = props => {
	const { userId, isOwn, user } = props;
	const utils = trpc.useUtils();
	const router = useRouter();

	const { mutateAsync: updateUser } = trpc.user.update.useMutation({
		onSuccess: async () => {
			router.replace(router.asPath, undefined, { scroll: false });
		}
	});

	const subscriptionsQuery = trpc.formAlert.getMySubscriptions.useQuery();
	const groups = subscriptionsQuery.data?.data ?? [];

	const invalidateSubs = () => utils.formAlert.getMySubscriptions.invalidate();

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

	return (
		<>
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
								onChange={e => handleNotificationsChange(e, 'daily')}
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
											className={classes.previewButton}
											role="button"
											onClick={() => {}}
										>
											Voir un exemple de mail de synthèse
										</span>
									</div>
								</>
							)}
						</form>
					</div>
					<div className={classes.notificationsWrapper}>
						<div className={classes.notifTitleContainer}>
							<h3 className={fr.cx('fr-mb-0')}>Alertes</h3>
							{!subscriptionsQuery.isLoading && groups.length > 0 && (
								<Button
									priority="secondary"
									size="small"
									onClick={() =>
										handleAlertsEnabledChange(!user.alerts_enabled)
									}
								>
									{user.alerts_enabled
										? 'Mettre en pause les alertes'
										: 'Réactiver les alertes'}
								</Button>
							)}
						</div>
						<p className={fr.cx('fr-text--sm')}>
							Recevez une alerte sur le formulaire de votre choix, dès que vous
							recevez des avis
						</p>
						<hr />

						<p
							className={cx(
								fr.cx('fr-text--md', 'fr-mb-4v'),
								classes.boldTitle
							)}
						>
							Services
						</p>
						{subscriptionsQuery.isLoading ? (
							<p className={fr.cx('fr-text--sm', 'fr-mb-0')}>Chargement…</p>
						) : groups.length === 0 ? (
							<p className={fr.cx('fr-text--sm', 'fr-mb-0')}>
								Vous n'êtes abonné à aucune alerte pour le moment. Activez-les
								depuis l'onglet « Paramètres » d'un formulaire.
							</p>
						) : (
							<>
								<div className={classes.services}>
									{groups.map(group => {
										const allEnabled = group.forms.every(f => f.enabled);
										const anyEnabled = group.forms.some(f => f.enabled);
										const partial = anyEnabled && !allEnabled;

										return (
											<Accordion
												key={group.product.id}
												titleAs="h5"
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
																onChange={() =>
																	handleProductToggle(
																		group.product.id,
																		!allEnabled
																	)
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
																onChange={checked =>
																	handleFormToggle(form.id, checked)
																}
																showCheckedHint={false}
																labelPosition="right"
															/>
														</li>
													))}
												</ul>
											</Accordion>
										);
									})}
								</div>
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
										className={classes.previewButton}
										role="button"
										onClick={() => {}}
									>
										Voir un exemple de mail d’alerte
									</span>
								</div>
							</>
						)}
					</div>
				</div>
			</AccountLayout>
		</>
	);
};

const useStyles = tss.withName(NotificationsAccount.name).create({
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
		ul: { margin: 0, marginBottom: fr.spacing('3v') }
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
	notifTitleContainer: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: fr.spacing('2v')
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
	formsList: {
		listStyle: 'none',
		padding: 0,
		margin: 0,
		display: 'flex',
		flexDirection: 'column'
	},
	formItem: {
		padding: `${fr.spacing('3v')} ${fr.spacing('4v')}`,
		borderBottom: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
		'&:last-child': { borderBottom: 'none' }
	},
	previewButton: {
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
