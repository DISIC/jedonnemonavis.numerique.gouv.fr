import { getPercentageFromValue, getReadableValue } from '@/src/utils/tools';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import { Skeleton, Tooltip } from '@mui/material';
import { tss } from 'tss-react';

type ObservatoireStatsProps = {
	productId: number;
	buttonId: number | null;
	startDate: string;
	endDate: string;
};

type StatField = {
	label: string;
	slug: 'satisfaction' | 'comprehension' | 'contact' | 'autonomy';
	value: number;
	tooltip: string;
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
		if (slug === 'contact') {
			if (value < 7) return 'Faible';
			if (value < 8.5) return 'Moyen';
			return 'Optimal';
		}

		if (value < 5) return 'Pas bien';
		if (value < 8) return 'Moyen';
		return 'Bien';
	};

	const getClassFromValue = (value: number, slug: StatField['slug']) => {
		if (slug === 'contact') {
			if (value < 7) return classes.pasBien;
			if (value < 8.5) return classes.moyen;
			return classes.bien;
		}

		if (value < 5) return classes.pasBien;
		if (value < 8) return classes.moyen;
		return classes.bien;
	};

	const statFields: StatField[] = [
		{
			label: 'Satisfaction',
			slug: 'satisfaction',
			value: resultStatsObservatoire.data.satisfaction,
			tooltip:
				'Pour calculer la note de satisfaction, nous réalisons une moyenne des réponses données à la question « De façon générale, comment ça s’est passé ? » en attribuant une note sur 10 à chaque option de réponses proposée dans le questionnaire.'
		},
		{
			label: 'Simplicité du langage',
			slug: 'comprehension',
			value: resultStatsObservatoire.data.comprehension,
			tooltip:
				"Pour calculer la note de simplicité du langage, nous réalisons une moyenne des réponses données à la question « Qu'avez-vous pensé des informations et des instructions fournies ? » en attribuant une note sur 10 aux cinq réponses proposées dans le questionnaire."
		},
		{
			label: 'Aide joignable et efficace',
			slug: 'contact',
			value: resultStatsObservatoire.data.contact,
			tooltip:
				'Cette évaluation correspond à la somme des usagers ayant répondu, avoir eu l’intention de contacter le service mais qui n’aurait , soit pas réussi à trouver le moyen de le joindre ou pas pu faire aboutir cette prise de contact, cela sur le nombre total d’usagers ayant répondu au questionnaire.'
		},
		{
			label: "Niveau d'autonomie",
			slug: 'autonomy',
			value: resultStatsObservatoire.data.autonomy,
			tooltip:
				'Comme la note de satisfaction usager, cette note est calculée sur la base des retours usagers récoltés via le questionnaire de satisfaction (bouton «je donne mon avis», qui se trouve à la fin de la démarche).'
		}
	];

	const getStatsDisplay = (field: StatField) => {
		if (isLoadingStatsObservatoire || isRefetchingStatsObservatoire) {
			return (
				<Skeleton className={classes.skeleton} height={145} width={'80%'} />
			);
		}
		if (!!resultStatsObservatoire.metadata[`${field.slug}_count`]) {
			return (
				<>
					<p
						className={cx(
							classes.value,
							field.slug !== 'autonomy'
								? getClassFromValue(field.value, field.slug)
								: undefined
						)}
					>
						{['autonomy', 'contact'].includes(field.slug)
							? `${getPercentageFromValue(field.value)}%`
							: `${getReadableValue(field.value)} / 10`}
					</p>
					{field.slug !== 'autonomy' && (
						<p
							className={cx(
								classes.intention,
								getClassFromValue(field.value, field.slug)
							)}
						>
							{getLabelFromValue(field.value, field.slug)}
						</p>
					)}
				</>
			);
		} else {
			return (
				<div>
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
			<div
				className={fr.cx(
					'fr-grid-row',
					'fr-grid-row--gutters',
					'fr-grid-row--top'
				)}
			>
				{statFields.map((field, index) => (
					<div
						key={index}
						className={fr.cx(
							'fr-col',
							'fr-col-sm-12',
							'fr-col-md-6',
							'fr-col-lg-3'
						)}
					>
						<div className={cx(classes.content)}>
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
					</div>
				))}
			</div>
		</div>
	);
};

const useStyles = tss.create({
	card: {
		marginTop: fr.spacing('15v'),
		paddingBottom: fr.spacing('20v'),
		borderBottom: `1px solid ${fr.colors.decisions.border.default.grey.default}`
	},
	title: {
		marginBottom: fr.spacing('15v')
	},
	content: {
		textAlign: 'center',
		padding: '0 1.7rem',
		borderRadius: '0.5rem',
		display: 'flex',
		flexDirection: 'column'
	},
	label: {
		display: 'flex',
		alignItems: 'center',
		fontWeight: 'bold',
		marginBottom: '0.5rem',
		height: '3rem',
		h5: {
			margin: 0
		}
	},
	intention: {
		...fr.typography[18].style,
		fontWeight: 'bold',
		marginTop: '1rem',
		textTransform: 'uppercase'
	},
	value: {
		fontSize: '2rem',
		fontWeight: 'bold',
		marginTop: '2rem'
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
