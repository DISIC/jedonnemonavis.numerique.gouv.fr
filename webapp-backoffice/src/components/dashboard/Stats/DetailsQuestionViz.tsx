import { useStats } from '@/src/contexts/StatsContext';
import { ElkSimpleAnswerResponse, FieldCodeDetails } from '@/src/types/custom';
import { fr } from '@codegouvfr/react-dsfr';
import { Skeleton } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { tss } from 'tss-react/dsfr';
import { trpc } from '@/src/utils/trpc';

const BarVerticalChart = dynamic(
	() => import('@/src/components/chart/BarVerticalChart'),
	{
		ssr: false
	}
);

type Props = {
	fieldCodeMultiple: FieldCodeDetails;
	productId: number;
	startDate: string;
	endDate: string;
};

const DetailsQuestionViz = ({
	fieldCodeMultiple,
	productId,
	startDate,
	endDate
}: Props) => {
	const { classes, cx } = useStyles();
	const { statsTotals, updateStatsTotals } = useStats();

	const { data: resultFieldCodeDetails, isLoading: isLoadingFieldCodeDetails } =
		trpc.answer.getByFieldCode.useQuery(
			{
				product_id: productId,
				field_code: fieldCodeMultiple,
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
						[fieldCodeMultiple]: data.metadata.total
					});
				}
			}
		);

	if (isLoadingFieldCodeDetails || !resultFieldCodeDetails) {
		return (
			<div>
				<Skeleton variant="text" width="75%" height={40} />
				<Skeleton variant="text" width="25%" height={25} />
				<div className={classes.skeleton}>
					<Skeleton variant="text" width="80%" height={45} />
					<Skeleton variant="text" width="20%" height={45} />
					<Skeleton variant="text" width="50%" height={45} />
					<Skeleton variant="text" width="35%" height={45} />
				</div>
			</div>
		);
	}

	const barChartDataDetails =
		resultFieldCodeDetails.data.map(({ answer_text, doc_count }) => ({
			name: answer_text,
			value: doc_count
		})) || [];

	if (statsTotals[fieldCodeMultiple] === 0) return;

	return (
		<div className={fr.cx('fr-grid-row')}>
			<div className={cx(classes.dataContainer, fr.cx('fr-col-12'))}>
				<h4 className={fr.cx('fr-mb-0')}>
					{resultFieldCodeDetails.metadata.fieldLabel}
				</h4>
				<p className={fr.cx('fr-mb-0', 'fr-hint-text', 'fr-text--md')}>
					{resultFieldCodeDetails.metadata.total} réponses total
				</p>
				<BarVerticalChart data={barChartDataDetails} kind="bar" />
			</div>
		</div>
	);
};

const useStyles = tss.create({
	skeleton: {
		display: 'flex',
		flexDirection: 'column',
		marginTop: '2rem'
	},
	dataContainer: { display: 'flex', flexDirection: 'column', width: '100%' }
});

export default DetailsQuestionViz;
