import { getPercentageFromValue, getReadableValue } from '@/src/utils/tools';
import { trpc } from '@/src/utils/trpc';
import { fr, FrIconClassName, RiIconClassName } from '@codegouvfr/react-dsfr';
import Badge from '@codegouvfr/react-dsfr/Badge';
import { Skeleton, Tooltip } from '@mui/material';
import { tss } from 'tss-react';

type ObservatoireStatsProps = {
	productId: number;
	buttonId: number | undefined;
	startDate: string;
	endDate: string;
};

type StatField = {
	label: string;
	slug: 'satisfaction' | 'comprehension' | 'contactReachability' | 'contactSatisfaction' | 'autonomy';
	value: number;
	tooltip: string;
	icon: RiIconClassName | FrIconClassName;
};

const ObservatoireStats = ({
	productId,
	buttonId,
	startDate,
	endDate
}: ObservatoireStatsProps) => {
	const { cx, classes } = useStyles();

	const {
		data: resultStatsObservatoire,
		isLoading: isLoadingStatsObservatoire,
		isRefetching: isRefetchingStatsObservatoire
	} = trpc.answer.getObservatoireStats.useQuery(
		{
			product_id: productId.toString(),
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
			label: 'Satisfaction',
			slug: 'satisfaction',
			value: resultStatsObservatoire.data.satisfaction,
			tooltip:
				'Pour calculer la note de satisfaction, nous réalisons une moyenne des réponses données à la question « De façon générale, comment ça s’est passé ? » en attribuant une note sur 10 à chaque option de réponses proposée dans le questionnaire.',
			icon: 'ri-emoji-sticker-line'
		},
		{
			label: 'Simplicité du langage',
			slug: 'comprehension',
			value: resultStatsObservatoire.data.comprehension,
			tooltip:
				"Pour calculer la note de simplicité du langage, nous réalisons une moyenne des réponses données à la question « Qu'avez-vous pensé des informations et des instructions fournies ? » en attribuant une note sur 10 aux cinq réponses proposées dans le questionnaire.",
			icon: 'ri-speak-line'
		},
		{
			label: 'Aide joignable',
			slug: 'contactReachability',
			value: resultStatsObservatoire.data.contact_reachability,
			tooltip:
				'Cette évaluation correspond à la part d’usagers en pourcentage ayant réussi à joindre l’administration pour l’aider dans la réalisation de sa démarche. La part est calculée grâce aux réponses obtenues à la question  « Quand vous avez cherché de l’aide, avez-vous réussi à joindre l’administration ? ».',
			icon: 'ri-customer-service-line'
		},
		{
			label: 'Aide efficace',
			slug: 'contactSatisfaction',
			value: resultStatsObservatoire.data.contact_satisfaction,
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

	const getStatsDisplay = (field: StatField) => {
		if (isLoadingStatsObservatoire || isRefetchingStatsObservatoire) {
			return (
				<div className={classes.statsDisplay}>
					<Skeleton className={classes.skeleton} height={64} width={'100%'} />
				</div>
			);
		}
		if (!!resultStatsObservatoire.metadata[`${field.slug}_count`]) {
			return (
				<div className={classes.statsDisplay}>
					<p className={cx(classes.value)}>
						{['autonomy', 'contactReachability'].includes(field.slug)
							? `${getPercentageFromValue(field.value * (field.slug === 'contactReachability' ? 10 : 1))} %`
							: `${getReadableValue(field.value)} / 10`}
					</p>
					{field.slug !== 'autonomy' && (
						<Badge 
							severity={getSeverityFromValue(field.value * (field.slug === 'contactReachability' ? 10 : 1), field.slug)} 
							noIcon 
							className={classes.intention}
						>
							{getLabelFromValue(field.value * (field.slug === 'contactReachability' ? 10 : 1), field.slug)}
						</Badge>
					)}
				</div>
			);
		} else {
			return (
				<div className={cx(fr.cx('fr-mb-16v'))}>
					<Tooltip
						placement="top"
						title="Aucune donnée pour calculer cette note"
						tabIndex={0}
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

	return (
		<div className={cx(classes.card)}>
			<h3 className={classes.title}>
				Les indicateurs de vos démarches essentielles
			</h3>
			<div className={classes.contentContainer}>
				{statFields.map((field, index) => (
					<div key={index} className={cx(classes.content)}>
						<div className={cx(classes.indicatorIcon, cx(fr.cx('fr-mr-6v')))}>
							<i className={cx(fr.cx(field.icon), classes.icon)} />
						</div>
						<label className={cx(classes.label)}>
							<h5>{field.label}</h5>
							<Tooltip placement="top" title={field.tooltip} tabIndex={0}>
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
	contentContainer:{
		display: 'flex',
		flexDirection: 'column',
		gap: fr.spacing('4v'),
	},
	content: {
		textAlign: 'center',
		padding: fr.spacing('3v'),
		display: 'flex',
		alignItems: 'center',
		height: '100%',
		justifyContent: 'space-between',
		border: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
	},
	label: {
		flex: 2,
		display: 'flex',
		alignItems: 'center',
		fontWeight: 'bold',
		minHeight: '3rem',
		h5: {
			margin: 0
		}
	},
	statsDisplay: {
		flex: 1,
		display: 'flex',
		height: '100%',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: fr.spacing('8v'),
	},
	intention: {
		minWidth: '7rem',
		justifyContent: 'center',
	},
	value: {
		fontSize: '2rem',
		fontWeight: 'bold',
		margin: 0,
	},
	indicatorIcon: {
		width: '4rem',
		height: '4rem',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: '50%',
		backgroundColor: fr.colors.decisions.artwork.decorative.blueFrance.default,
	},
	icon: {
		color: fr.colors.decisions.background.flat.blueFrance.default,
		'::before': {
			'--icon-size': '2rem',
		}
	},
	skeleton: {
		margin: 'auto'
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
