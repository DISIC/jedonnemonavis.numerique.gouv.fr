import { trpc } from '@/src/utils/trpc';
import { Skeleton } from '@mui/material';
import ChartWrapper from './ChartWrapper';
import dynamic from 'next/dynamic';
import { tss } from 'tss-react/dsfr';
import QuestionWrapper from './QuestionWrapper';

const LineChart = dynamic(() => import('@/src/components/chart/LineChart'), {
	ssr: false
});

const BarChart = dynamic(() => import('@/src/components/chart/BarChart'), {
	ssr: false
});

type Props = {
	fieldCode: string;
	productId: number;
	formId: number;
	buttonId?: number;
	startDate: string;
	endDate: string;
	total: number;
	required?: boolean;
};

const BarQuestionViz = ({
	fieldCode,
	productId,
	formId,
	buttonId,
	startDate,
	endDate,
	total,
	required = false
}: Props) => {
	const { classes } = useStyles();

	const { data: resultFieldCode, isLoading } =
		trpc.answer.getByFieldCode.useQuery(
			{
				product_id: productId,
				form_id: formId,
				...(buttonId && { button_id: buttonId }),
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
				}
			}
		);

	const formatedFieldCodeData = [
		{ name: 'pas clair du tout', value: 0 },
		...resultFieldCode.data
			.map(item => ({
				name: item.answer_text,
				value: item.doc_count
			}))
			.sort((a, b) => a.name.localeCompare(b.name)),
		{ name: 'très clair', value: 0 }
	];

	const {
		data: { data: countByFieldCodePerMonth },
		isLoading: isLoadingCountByFieldCodePerMonth
	} = trpc.answer.countByFieldCodePerMonth.useQuery(
		{
			product_id: productId,
			form_id: formId,
			...(buttonId && { button_id: buttonId }),
			field_code: fieldCode,
			start_date: startDate,
			end_date: endDate
		},
		{ initialData: { data: [] } }
	);

	if (isLoading || isLoadingCountByFieldCodePerMonth || !resultFieldCode) {
		return (
			<div className={classes.mainSection}>
				<Skeleton />
			</div>
		);
	}

	return (
		<QuestionWrapper
			totalField={resultFieldCode.metadata.total}
			fieldLabel={resultFieldCode.metadata.fieldLabel || ''}
			total={total}
			required={required}
		>
			<ChartWrapper
				title="Répartition des réponses"
				total={resultFieldCode.metadata.total}
				data={formatedFieldCodeData}
			>
				<BarChart data={formatedFieldCodeData} />
			</ChartWrapper>
			<ChartWrapper
				title="Évolution des réponses"
				total={resultFieldCode.metadata.total}
				data={countByFieldCodePerMonth}
				singleRowLabel={
					fieldCode === 'comprehension' ? 'Score moyen' : 'Nombre de réponses'
				}
			>
				<LineChart
					data={countByFieldCodePerMonth}
					labelAxisY={
						fieldCode === 'comprehension' ? 'Score moyen' : 'Nombre de réponses'
					}
					ticks={fieldCode === 'comprehension' ? [1, 2, 3, 4, 5] : undefined}
				/>
			</ChartWrapper>
		</QuestionWrapper>
	);
};

const useStyles = tss.create({
	mainSection: {
		display: 'flex',
		flexWrap: 'wrap',
		gap: '3rem'
	}
});

export default BarQuestionViz;
