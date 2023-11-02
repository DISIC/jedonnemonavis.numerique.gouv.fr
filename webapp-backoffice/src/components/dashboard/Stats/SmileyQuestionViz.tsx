import { useStats } from '@/src/contexts/StatsContext';
import { ElkSimpleAnswerResponse, FieldCodeSmiley } from '@/src/types/custom';
import {
	getIntentionFromAverage,
	getStatsAnswerText,
	getStatsColor,
	getStatsIcon
} from '@/src/utils/stats';
import { fr } from '@codegouvfr/react-dsfr';
import { Skeleton } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { tss } from 'tss-react/dsfr';
import AverageCard from './AverageCard';

const PieChart = dynamic(() => import('@/src/components/chart/PieChart'), {
	ssr: false
});

type Props = {
	fieldCode: FieldCodeSmiley;
	productId: number;
	startDate: string;
	endDate: string;
	displayFieldLabel?: boolean;
};

const SmileyQuestionViz = ({
	fieldCode,
	productId,
	startDate,
	endDate,
	displayFieldLabel = false
}: Props) => {
	const { classes } = useStyles();
	const { updateStatsTotals } = useStats();

	const { data: resultFieldCode, isLoading } = useQuery({
		queryKey: [
			'getAnswerByFieldCode',
			fieldCode,
			productId,
			startDate,
			endDate
		],
		queryFn: async () => {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_FORM_APP_URL}/api/open-api/answers/${fieldCode}?product_id=${productId}&start_date=${startDate}&end_date=${endDate}`
			);
			if (res.ok) {
				const jsonResponse = (await res.json()) as ElkSimpleAnswerResponse;

				updateStatsTotals({
					[fieldCode]: jsonResponse.metadata.total
				});

				return jsonResponse;
			}
		}
	});

	if (isLoading || !resultFieldCode) {
		return (
			<div className={classes.mainSection}>
				<Skeleton variant="rectangular" width={232} height="inherit" />
				<div className={classes.skeleton}>
					<Skeleton variant="text" width="75%" height={40} />
					<Skeleton variant="text" width="25%" height={25} />
					<div className={classes.subSkeleton}>
						<div>
							<Skeleton variant="text" width="40%" height={45} />
							<Skeleton variant="text" width="45%" height={45} />
							<Skeleton variant="text" width="40%" height={45} />
						</div>
						<Skeleton variant="circular" width={185} height={185} />
					</div>
				</div>
			</div>
		);
	}

	const currentAnswerTextFromAverage = getStatsAnswerText({
		buckets: resultFieldCode.data || [],
		intention: getIntentionFromAverage(
			resultFieldCode.metadata.average as number
		)
	});

	const barChartData =
		resultFieldCode.data.map(({ answer_text, intention, doc_count }) => ({
			name: intention,
			value: doc_count,
			answer_text
		})) || [];

	return (
		<div className={classes.wrapperSection}>
			{displayFieldLabel && (
				<h4 className={fr.cx('fr-mb-0')}>
					{resultFieldCode.metadata.fieldLabel}
				</h4>
			)}
			<div className={classes.mainSection}>
				<AverageCard
					average={resultFieldCode.metadata.average as number}
					answerText={currentAnswerTextFromAverage}
				/>
				<div className={classes.container}>
					<h4 className={fr.cx('fr-mb-0')}>Répartition des avis</h4>
					<p>{resultFieldCode.metadata.total} avis total</p>
					<div className={classes.dataContainer}>
						<div>
							{resultFieldCode.data.map(
								({ answer_text, intention, doc_count }) => (
									<div key={answer_text} className={classes.itemData}>
										<i
											className={fr.cx(getStatsIcon({ intention }))}
											style={{ color: getStatsColor({ intention }) }}
										/>
										<div className={classes.itemDataText}>
											<span style={{ color: getStatsColor({ intention }) }}>
												{answer_text}
											</span>
											<span className={classes.total}>
												{(
													(doc_count / resultFieldCode.metadata.total) *
													100
												).toFixed(0)}
												% / {doc_count} avis
											</span>
										</div>
									</div>
								)
							)}
						</div>
						<PieChart kind="pie" data={barChartData} />
					</div>
				</div>
			</div>
		</div>
	);
};

const useStyles = tss.create({
	wrapperSection: {
		display: 'flex',
		flexDirection: 'column',
		gap: fr.spacing('3v')
	},
	mainSection: {
		display: 'flex',
		flexWrap: 'wrap',
		gap: '3rem'
	},
	container: {
		display: 'flex',
		flexDirection: 'column',
		flex: 1,
		width: '100%'
	},
	dataContainer: {
		display: 'flex',
		['& > div']: {
			width: '100%',
			display: 'flex',
			flexDirection: 'column',
			gap: '0.75rem'
		}
	},
	itemData: { display: 'flex', gap: '0.25rem' },
	itemDataText: {
		display: 'flex',
		flexDirection: 'column'
	},
	total: { marginTop: '0.15rem', fontSize: '0.875rem' },
	skeleton: { flex: 1 },
	subSkeleton: {
		display: 'flex',
		marginTop: '2rem',
		['& > div']: {
			display: 'flex',
			flexDirection: 'column',
			width: '100%',
			gap: '0.5rem',
			flex: 1
		}
	}
});

export default SmileyQuestionViz;
