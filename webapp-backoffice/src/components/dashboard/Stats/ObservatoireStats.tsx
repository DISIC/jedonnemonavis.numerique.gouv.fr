import { getReadableValue } from '@/src/utils/tools';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { Tooltip } from '@mui/material';
import { tss } from 'tss-react';

type ObservatoireStatsProps = {
	productId: number;
	startDate: string;
	endDate: string;
};

const ObservatoireStats = ({
	productId,
	startDate,
	endDate
}: ObservatoireStatsProps) => {
	const { cx, classes } = useStyles();

	const {
		data: resultStatsObservatoire,
		isLoading: isLoadingStatsObservatoire
	} = trpc.answer.getObservatoireStats.useQuery(
		{
			product_id: productId.toString(),
			start_date: startDate,
			end_date: endDate
		},
		{
			initialData: {
				data: {
					satisfaction: 0,
					comprehension: 0,
					contact: 0,
					autonomy: 0
				},
				metadata: {
					satisfaction_count: 0,
					comprehension_count: 0,
					contact_count: 0,
					autonomy_count: 0
				}
			}
		}
	);

	const getLabelFromValue = (value: number) => {
		if (value < 5) return 'Pas bien';
		if (value < 8) return 'Moyen';
		return 'Bien';
	};

	const getClassFromValue = (value: number) => {
		if (value < 5) return classes.pasBien;
		if (value < 8) return classes.moyen;
		return classes.bien;
	};

	const statFields = [
		{
			label: 'Satisfaction',
			value: resultStatsObservatoire.data.satisfaction,
			tooltip: 'À rédiger'
		},
		{
			label: 'Simplicité du langage',
			value: resultStatsObservatoire.data.comprehension,
			tooltip: 'À rédiger'
		},
		{
			label: 'Joignabilité et efficacité',
			value: resultStatsObservatoire.data.contact,
			tooltip: 'À rédiger'
		},
		{
			label: 'Autonomie',
			value: resultStatsObservatoire.data.autonomy,
			tooltip: 'À rédiger'
		}
	];

	return (
		<div className={cx(classes.card)}>
			<h3 className={classes.title}>
				Les indicateurs de vos démarches essentielles
			</h3>
			<div
				className={fr.cx(
					'fr-grid-row',
					'fr-grid-row--gutters',
					'fr-grid-row--middle'
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
								{field.label}
								<Tooltip placement="top" title={field.tooltip}>
									<span
										className={fr.cx(
											'fr-icon-information-line',
											'fr-icon--sm',
											'fr-ml-1v'
										)}
									/>
								</Tooltip>
							</label>
							<div
								className={cx(classes.value, getClassFromValue(field.value))}
							>
								{getReadableValue(field.value)} / 10
							</div>
							<span
								className={cx(
									classes.intention,
									getClassFromValue(field.value)
								)}
							>
								{getLabelFromValue(field.value)}
							</span>
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
		padding: '0 1.5rem',
		borderRadius: '0.5rem',
		display: 'flex',
		flexDirection: 'column'
	},
	label: {
		display: 'block',
		fontWeight: 'bold',
		marginBottom: '0.5rem',
		height: '4rem'
	},
	intention: {
		...fr.typography[18].style,
		fontWeight: 'bold',
		marginTop: '1rem',
		textTransform: 'uppercase'
	},
	value: {
		fontSize: '2rem',
		fontWeight: 'bold'
	},
	bien: {
		color: fr.colors.decisions.background.flat.success.default
	},
	moyen: {
		color: fr.colors.decisions.background.flat.warning.default
	},
	pasBien: {
		color: fr.colors.decisions.background.flat.error.default
	}
});

export default ObservatoireStats;
