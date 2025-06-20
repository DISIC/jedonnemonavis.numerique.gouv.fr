import { getPercentageFromValue, getReadableValue } from '@/src/utils/tools';
import { trpc } from '@/src/utils/trpc';
import { fr, FrIconClassName, RiIconClassName } from '@codegouvfr/react-dsfr';
import { AlertProps } from '@codegouvfr/react-dsfr/Alert';
import Badge from '@codegouvfr/react-dsfr/Badge';
import { Skeleton, Tooltip } from '@mui/material';
import { Fragment } from 'react';
import { tss } from 'tss-react';

type ObservatoireStatsProps = {
	productId: number;
	formId: number;
	buttonId?: number;
	startDate: string;
	endDate: string;
	slugsToDisplay?: StatField['slug'][];
	noTitle?: boolean;
	view?: 'default' | 'form-dashboard';
};

export type StatField = {
	label: string;
	slug:
		| 'satisfaction'
		| 'comprehension'
		| 'contactReachability'
		| 'contactSatisfaction'
		| 'autonomy';
	value: number;
	lastMonthDiffValue?: string;
	tooltip: string;
	icon: RiIconClassName | FrIconClassName;
};

const ObservatoireStats = ({
	productId,
	formId,
	buttonId,
	startDate,
	endDate,
	slugsToDisplay,
	noTitle = false,
	view = 'default'
}: ObservatoireStatsProps) => {
	const { cx, classes } = useStyles();

	const {
		data: resultStatsObservatoire,
		isLoading: isLoadingStatsObservatoire,
		isRefetching: isRefetchingStatsObservatoire
	} = trpc.answer.getObservatoireStats.useQuery(
		{
			product_id: productId,
			form_id: formId,
			...(buttonId && { button_id: buttonId }),
			start_date: startDate,
			end_date: endDate,
			needLogging: true
		},
		{
			initialData: {
				data: {
					satisfaction: 0,
					comprehension: 0,
					contact: 0,
					contact_reachability: 0,
					contact_satisfaction: 0,
					autonomy: 0
				},
				metadata: {
					satisfaction_count: 0,
					comprehension_count: 0,
					contact_count: 0,
					contactReachability_count: 0,
					contactSatisfaction_count: 0,
					autonomy_count: 0
				}
			}
		}
	);

	const { data: lastMonthResultStats } =
		trpc.answer.getObservatoireStats.useQuery(
			{
				product_id: productId,
				form_id: formId,
				...(buttonId && { button_id: buttonId }),
				start_date: startDate,
				end_date: new Date(
					new Date().getFullYear(),
					new Date().getMonth() - 1,
					new Date().getDate() + 2
				)
					.toISOString()
					.split('T')[0],
				needLogging: true
			},
			{
				enabled: view === 'form-dashboard'
			}
		);

	if (isLoadingStatsObservatoire) return;

	const getLabelFromValue = (value: number, slug: StatField['slug']) => {
		if (slug === 'contactReachability') {
			if (value < 7) return 'Faible';
			if (value < 8.5) return 'Moyen';
			return 'Optimal';
		}

		if (value < 5) return 'Pas bien';
		if (value < 8) return 'Moyen';
		return 'Bien';
	};

	const getSeverityFromValue = (value: number, slug: StatField['slug']) => {
		if (slug === 'contactReachability') {
			if (value < 7) return 'error';
			if (value < 8.5) return 'new';
			return 'success';
		}

		if (value < 5) return 'error';
		if (value < 8) return 'new';
		return 'success';
	};

	const statFields: StatField[] = [
		{
			label: 'Satisfaction usager',
			slug: 'satisfaction',
			value: resultStatsObservatoire.data.satisfaction,
			lastMonthDiffValue:
				lastMonthResultStats &&
				(
					resultStatsObservatoire.data.satisfaction -
					lastMonthResultStats.data.satisfaction
				).toFixed(1),
			tooltip:
				'Pour calculer la note de satisfaction, nous réalisons une moyenne des réponses données à la question « De façon générale, comment ça s’est passé ? » en attribuant une note sur 10 à chaque option de réponses proposée dans le questionnaire.',
			icon: 'ri-emoji-sticker-line'
		},
		{
			label: 'Simplicité du langage',
			slug: 'comprehension',
			value: resultStatsObservatoire.data.comprehension,
			lastMonthDiffValue:
				lastMonthResultStats &&
				(
					resultStatsObservatoire.data.comprehension -
					lastMonthResultStats.data.comprehension
				).toFixed(1),
			tooltip:
				"Pour calculer la note de simplicité du langage, nous réalisons une moyenne des réponses données à la question « Qu'avez-vous pensé des informations et des instructions fournies ? » en attribuant une note sur 10 aux cinq réponses proposées dans le questionnaire.",
			icon: 'ri-speak-line'
		},
		{
			label: 'Aide joignable',
			slug: 'contactReachability',
			value: resultStatsObservatoire.data.contact_reachability,
			lastMonthDiffValue:
				lastMonthResultStats &&
				(
					resultStatsObservatoire.data.contact_reachability -
					lastMonthResultStats.data.contact_reachability
				).toFixed(1),
			tooltip:
				'Cette évaluation correspond à la part d’usagers en pourcentage ayant réussi à joindre l’administration pour l’aider dans la réalisation de sa démarche. La part est calculée grâce aux réponses obtenues à la question  « Quand vous avez cherché de l’aide, avez-vous réussi à joindre l’administration ? ».',
			icon: 'ri-customer-service-line'
		},
		{
			label: 'Aide efficace',
			slug: 'contactSatisfaction',
			value: resultStatsObservatoire.data.contact_satisfaction,
			lastMonthDiffValue:
				lastMonthResultStats &&
				(
					resultStatsObservatoire.data.contact_satisfaction -
					lastMonthResultStats.data.contact_satisfaction
				).toFixed(1),
			tooltip:
				'Cette évaluation correspond à la qualité de l’aide obtenue de la part de l’administration. Nous réalisons une moyenne des réponses données à la question « Comment évaluez-vous la qualité de l’aide que vous avez obtenue de la part de l’administration ? » en attribuant une note sur 10 à chaque option de réponses proposée dans le questionnaire.',
			icon: 'ri-customer-service-line'
		},
		{
			label: "Niveau d'autonomie",
			slug: 'autonomy',
			value: resultStatsObservatoire.data.autonomy,
			tooltip:
				'Comme la note de satisfaction usager, cette note est calculée sur la base des retours usagers récoltés via le questionnaire de satisfaction (bouton «je donne mon avis», qui se trouve à la fin de la démarche).',
			icon: 'ri-chat-smile-line'
		}
	];

	const getDiffLabel = (
		value?: string
	): { severity: AlertProps.Severity; label: string } => {
		const numValue = parseFloat(value || '0');
		if (numValue > 0) {
			return { severity: 'success', label: `+ ${numValue}` };
		} else if (numValue < 0) {
			return { severity: 'error', label: `- ${Math.abs(numValue)}` };
		} else {
			return { severity: 'info', label: '+ 0' };
		}
	};

	const getStatsDisplay = (field: StatField) => {
		if (isLoadingStatsObservatoire || isRefetchingStatsObservatoire) {
			return (
				<div className={classes.statsDisplay}>
					<Skeleton
						className={cx(
							classes.skeleton,
							fr.cx(view === 'default' && 'fr-m-auto')
						)}
						height={view === 'default' ? 64 : 40}
						width={'100%'}
					/>
				</div>
			);
		}
		if (!!resultStatsObservatoire.metadata[`${field.slug}_count`]) {
			return (
				<div
					className={cx(
						classes.statsDisplay,
						view === 'form-dashboard' && classes.dashboardStatsDisplay,
						field.slug === 'autonomy' ? fr.cx('fr-pb-12v') : ''
					)}
				>
					<p className={cx(classes.value)}>
						{['autonomy', 'contactReachability'].includes(field.slug)
							? `${getPercentageFromValue(field.value * (field.slug === 'contactReachability' ? 10 : 1))} %`
							: `${getReadableValue(field.value)} / 10`}
					</p>

					{field.slug !== 'autonomy' && view === 'default' && (
						<Badge
							severity={getSeverityFromValue(
								field.value * (field.slug === 'contactReachability' ? 10 : 1),
								field.slug
							)}
							noIcon
							className={classes.intention}
						>
							{getLabelFromValue(
								field.value * (field.slug === 'contactReachability' ? 10 : 1),
								field.slug
							)}
						</Badge>
					)}
					{field.slug === 'autonomy' && view === 'default' && (
						<div className={classes.fakeIntention} />
					)}
				</div>
			);
		} else {
			return (
				<div className={cx(fr.cx('fr-mb-3v', 'fr-mb-md-0'))}>
					<Tooltip
						placement="top"
						title="Aucune donnée pour calculer cette note"
						tabIndex={0}
						enterTouchDelay={0}
					>
						<span
							className={cx(
								fr.cx('ri-question-line', 'fr-icon--lg'),
								classes.noData
							)}
						/>
					</Tooltip>
				</div>
			);
		}
	};

	const GroupTag =
		view === 'form-dashboard'
			? ({ children }: { children: React.ReactNode }) => (
					<div className={classes.dashboardInnerContent}>{children}</div>
				)
			: Fragment;

	return (
		<div className={cx(view === 'default' && classes.card)}>
			{!noTitle && (
				<h3 className={classes.title}>
					Les indicateurs de vos démarches essentielles
				</h3>
			)}

			<div className={classes.contentContainer}>
				{statFields
					.filter(
						field => !slugsToDisplay || slugsToDisplay.includes(field.slug)
					)
					.map((field, index) => (
						<div
							key={index}
							className={cx(
								classes.content,
								view === 'form-dashboard' && classes.dashboardContent,
								fr.cx(view === 'default' ? 'fr-p-3v' : ['fr-py-4v', 'fr-px-6v'])
							)}
						>
							<div
								className={cx(classes.indicatorIcon, cx(fr.cx('fr-mr-md-6v')))}
							>
								<i className={cx(fr.cx(field.icon), classes.icon)} />
							</div>
							<GroupTag>
								<label
									className={cx(
										view === 'default' ? classes.label : classes.dashboardLabel
									)}
								>
									<span
										className={cx(
											classes.indicatorTitle,
											view === 'form-dashboard' &&
												classes.dashboardIndicatorTitle
										)}
									>
										{field.label}
									</span>
									<Tooltip
										placement="top"
										title={field.tooltip}
										tabIndex={0}
										enterTouchDelay={0}
									>
										<span
											className={fr.cx(
												'fr-icon-information-line',
												'fr-icon--md',
												'fr-ml-1v'
											)}
										/>
									</Tooltip>
								</label>
								{getStatsDisplay(field)}
								{view === 'form-dashboard' && (
									<div className={cx(fr.cx('fr-mt-2v', 'fr-grid-row'))}>
										{!!resultStatsObservatoire.metadata[
											`${field.slug}_count`
										] ? (
											<>
												<Badge
													severity={
														getDiffLabel(field.lastMonthDiffValue).severity
													}
													small
													noIcon
													className="fr-mr-2v"
												>
													{getDiffLabel(field.lastMonthDiffValue).label}
												</Badge>
												<p className={classes.lastMonthLabel}>
													depuis le dernier mois
												</p>
											</>
										) : (
											<></>
										)}
									</div>
								)}
							</GroupTag>
						</div>
					))}
			</div>
		</div>
	);
};

const useStyles = tss.create({
	card: {
		marginTop: fr.spacing('16v'),
		paddingBottom: fr.spacing('20v'),
		borderBottom: `1px solid ${fr.colors.decisions.border.default.grey.default}`
	},
	title: {
		marginBottom: fr.spacing('4v')
	},
	contentContainer: {
		display: 'flex',
		flexDirection: 'column',
		gap: fr.spacing('4v')
	},
	content: {
		textAlign: 'center',
		display: 'flex',
		alignItems: 'center',
		height: '100%',
		justifyContent: 'space-between',
		border: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
		[fr.breakpoints.down('md')]: {
			flexDirection: 'column'
		}
	},
	dashboardContent: {
		textAlign: 'left',
		justifyContent: 'initial'
	},
	dashboardInnerContent: {
		display: 'flex',
		flexDirection: 'column'
	},
	lastMonthLabel: {
		margin: 0,
		fontSize: '0.75rem',
		lineHeight: '1.25rem',
		color: fr.colors.decisions.text.mention.grey.default
	},
	label: {
		flex: 3,
		display: 'flex',
		alignItems: 'center',
		fontWeight: 'bold',
		minHeight: '3rem',
		h5: {
			margin: 0
		},
		[fr.breakpoints.down('md')]: {
			...fr.spacing('margin', { bottom: '3v' })
		}
	},
	dashboardLabel: {
		marginBottom: fr.spacing('2v'),
		'.fr-icon-information-line': {
			'&::before': {
				'--icon-size': '1.25rem'
			}
		}
	},
	statsDisplay: {
		flex: 2,
		display: 'flex',
		height: '100%',
		alignItems: 'center',
		justifyContent: 'flex-end',
		gap: fr.spacing('8v'),
		[fr.breakpoints.down('md')]: {
			flexDirection: 'column',
			gap: fr.spacing('6v')
		},
		[fr.breakpoints.up('md')]: {
			paddingBottom: '0!important'
		}
	},
	dashboardStatsDisplay: {
		justifyContent: 'start',
		alignItems: 'baseline',
		gap: fr.spacing('2v')
	},
	intention: {
		minWidth: '7.25rem',
		justifyContent: 'center',
		[fr.breakpoints.down('md')]: {
			minWidth: '10rem'
		}
	},
	fakeIntention: {
		width: '7.25rem'
	},
	value: {
		fontSize: '2rem',
		lineHeight: '2.5rem',
		fontWeight: 'bold',
		margin: 0,
		textWrap: 'nowrap'
	},
	indicatorTitle: {
		fontSize: '1.25rem',
		lineHeight: '1.75rem',
		fontWeight: 'bold',
		margin: 0,
		textWrap: 'nowrap',
		color: fr.colors.decisions.text.title.grey.default,
		[fr.breakpoints.up('md')]: {
			fontSize: '1.375rem'
		}
	},
	dashboardIndicatorTitle: {
		fontSize: '1.125rem',
		lineHeight: '1.5rem'
	},
	indicatorIcon: {
		width: '4rem',
		height: '4rem',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: '50%',
		backgroundColor: fr.colors.decisions.artwork.decorative.blueFrance.default
	},
	icon: {
		color: fr.colors.decisions.background.flat.blueFrance.default,
		'::before': {
			'--icon-size': '2rem'
		}
	},
	skeleton: {
		minWidth: '10rem'
	},
	bien: {
		color: fr.colors.decisions.background.flat.success.default
	},
	moyen: {
		color: fr.colors.decisions.background.flat.yellowTournesol.default
	},
	pasBien: {
		color: fr.colors.decisions.background.flat.error.default
	},
	noData: {
		color: fr.colors.decisions.text.mention.grey.default
	}
});

export default ObservatoireStats;
