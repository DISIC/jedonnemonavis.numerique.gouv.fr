import { useStats } from '@/src/contexts/StatsContext';
import { ElkSimpleAnswerResponse, FieldCodeBoolean } from '@/src/types/custom';
import { fr } from '@codegouvfr/react-dsfr';
import { Skeleton } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { tss } from 'tss-react/dsfr';
import { trpc } from '@/src/utils/trpc';

const PieChart = dynamic(() => import('@/src/components/chart/PieChart'), {
	ssr: false
});

type Props = {
	fieldCode: FieldCodeBoolean;
	productId: number;
	startDate: string;
	endDate: string;
};

const BooleanQuestionViz = ({
	fieldCode,
	productId,
	startDate,
	endDate
}: Props) => {
	const { classes, cx } = useStyles();
	const { statsTotals, updateStatsTotals } = useStats();

	const { data: resultFieldCode, isLoading: isLoadingFieldCode } =
		trpc.answer.getByFieldCode.useQuery(
			{
				product_id: productId,
				field_code: fieldCode,
				start_date: startDate,
				end_date: endDate
			},
			{
				initialData: {
					data: [],
					metadata: {
						total: 0,
						average: 0,
						fieldLabel: ''
					}
				},
				onSuccess: data => {
					updateStatsTotals({
						[fieldCode]: data.metadata.total
					});
				}
			}
		);

	if (isLoadingFieldCode || !resultFieldCode) {
		return (
			<div>
				<Skeleton variant="text" width="75%" height={40} />
				<Skeleton variant="text" width="25%" height={25} />
				<div className={classes.skeleton}>
					<div>
						<Skeleton variant="text" width="40%" height={45} />
						<Skeleton variant="text" width="45%" height={45} />
						<Skeleton variant="text" width="40%" height={45} />
					</div>
					<Skeleton variant="circular" width={185} height={185} />
				</div>
			</div>
		);
	}

	const barChartData =
		resultFieldCode.data.map(({ answer_text, intention, doc_count }) => ({
			name: intention,
			value: doc_count,
			answer_text
		})) || [];

	if (statsTotals[fieldCode] === 0) return;

	return (
		<div className={classes.container}>
			<h4 className={fr.cx('fr-mb-0')}>
				{resultFieldCode.metadata.fieldLabel}
			</h4>
			<p className={fr.cx('fr-hint-text', 'fr-text--md')}>
				{resultFieldCode.metadata.total} avis total
			</p>
			<div className={classes.dataContainer}>
				<div>
					{resultFieldCode.data.map(({ answer_text, doc_count }) => (
						<div key={answer_text} className={classes.dataAnswers}>
							<span className={classes.blueColor}>{answer_text}</span>
							<span className={classes.dataText}>
								{((doc_count / resultFieldCode.metadata.total) * 100).toFixed(
									0
								)}
								% / {doc_count} avis
							</span>
						</div>
					))}
				</div>
				<PieChart kind="pie" data={barChartData} />
			</div>
		</div>
	);
};

const useStyles = tss.create({
	blueColor: {
		color: fr.colors.decisions.text.actionHigh.blueFrance.default
	},
	skeleton: {
		display: 'flex',
		marginTop: '2rem',
		['& > div']: {
			display: 'flex',
			flexDirection: 'column',
			width: '100%',
			gap: '0.5rem',
			flex: 1
		}
	},
	container: { display: 'flex', flexDirection: 'column', width: '100%' },
	dataContainer: {
		display: 'flex',
		['& > div']: {
			width: '100%',
			display: 'flex',
			flexDirection: 'column',
			gap: '0.75rem'
		}
	},
	dataAnswers: {
		display: 'flex',
		flexDirection: 'column'
	},
	dataText: { marginTop: '0.15rem', fontSize: '0.875rem' }
});

export default BooleanQuestionViz;
