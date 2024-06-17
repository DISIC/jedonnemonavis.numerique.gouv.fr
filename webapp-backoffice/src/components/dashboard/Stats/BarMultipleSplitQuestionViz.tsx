import QuestionWrapper from './QuestionWrapper';
import { trpc } from '@/src/utils/trpc';
import { tss } from 'tss-react/dsfr';
import { Skeleton } from '@mui/material';
import HeaderChart from './HeaderChart';
import dynamic from 'next/dynamic';
import { useState } from 'react';

const LineChart = dynamic(() => import('@/src/components/chart/LineChart'), {
	ssr: false
});

const StackedVerticalBarChart = dynamic(
	() => import('@/src/components/chart/StackedVerticalBarChart'),
	{
		ssr: false
	}
);

type Props = {
	fieldCode: 'contact_reached' | 'contact_satisfaction';
	productId: number;
	startDate: string;
	endDate: string;
	total: number;
	required?: boolean;
};

const BarMultipleSplitQuestionViz = ({
	fieldCode,
	productId,
	startDate,
	endDate,
	total,
	required = false
}: Props) => {
	const { classes } = useStyles();

	const { data: resultFieldCode, isLoading: isLoadingFieldCode } =
		trpc.answer.getByChildFieldCode.useQuery(
			{
				product_id: productId,
				field_code: fieldCode,
				start_date: startDate,
				end_date: endDate
			},
			{
				initialData: {
					data: {},
					metadata: {
						total: 0,
						average: 0,
						fieldLabel: ''
					}
				}
			}
		);

	const {
		data: resultFieldCodeInterval,
		isLoading: isLoadingFieldCodeInterval
	} = trpc.answer.getByFieldCodeInterval.useQuery(
		{
			product_id: productId,
			field_code: fieldCode,
			start_date: startDate,
			end_date: endDate
		},
		{
			initialData: {
				data: {},
				metadata: {
					total: 0,
					average: 0
				}
			}
		}
	);

	const [allFieldCodeKeys, setAllFieldCodeKeys] = useState<string[]>([]);

	const formatedFieldCodeData = Object.entries(resultFieldCode.data).map(
		([key, value]) => {
			const tmpData = value.map(item => {
				if (!allFieldCodeKeys.includes(item.answer_text)) {
					setAllFieldCodeKeys([...allFieldCodeKeys, item.answer_text]);
				}

				return {
					[item.answer_text]: item.doc_count
				};
			});

			return {
				name: key,
				...Object.assign({}, ...tmpData)
			};
		}
	) as { name: string; [key: string]: number | string }[];

	if (isLoadingFieldCode || isLoadingFieldCodeInterval || !resultFieldCode) {
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
			<HeaderChart title="Répartition des réponses">
				<StackedVerticalBarChart
					data={formatedFieldCodeData}
					dataKeys={allFieldCodeKeys}
					fieldCode={fieldCode}
					total={total}
				/>
			</HeaderChart>
			{/* <HeaderChart
				title="Evolution des réponses"
				total={resultFieldCode.metadata.total}
			>
				<LineChart
					data={formatedFieldCodeDataPerInterval}
					dataKeys={allFieldCodeKeys}
					labelAxisY="Nombre de réponses"
				/>
			</HeaderChart> */}
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

export default BarMultipleSplitQuestionViz;
