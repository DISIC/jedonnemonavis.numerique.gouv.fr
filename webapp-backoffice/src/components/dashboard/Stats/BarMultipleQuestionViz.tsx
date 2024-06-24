import { trpc } from '@/src/utils/trpc';
import { Skeleton } from '@mui/material';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { tss } from 'tss-react/dsfr';
import HeaderChart from './HeaderChart';
import QuestionWrapper from './QuestionWrapper';
import { newFormFieldCodes, oldFormFieldCodes } from '@/src/utils/tools';

const LineChart = dynamic(() => import('@/src/components/chart/LineChart'), {
	ssr: false
});

const BarVerticalChart = dynamic(
	() => import('@/src/components/chart/BarVerticalChartNew'),
	{
		ssr: false
	}
);

type Props = {
	fieldCode: string;
	productId: number;
	startDate: string;
	endDate: string;
	total: number;
	required?: boolean;
};

const BarMultipleQuestionViz = ({
	fieldCode,
	productId,
	startDate,
	endDate,
	total,
	required = false
}: Props) => {
	const { classes } = useStyles();

	const { data: resultFieldCode, isLoading: isLoadingFieldCode } =
		trpc.answer.getByFieldCode.useQuery(
			{
				product_id: productId,
				field_code: fieldCode,
				start_date: startDate,
				end_date: endDate,
				...(oldFormFieldCodes.includes(fieldCode) && {
					form_id: 1
				}),
				...(newFormFieldCodes.includes(fieldCode) && {
					form_id: 2
				})
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

	const formatedFieldCodeData = resultFieldCode.data.map(item => ({
		name: item.answer_text,
		value: item.doc_count
	}));

	const [allFieldCodeKeys, setAllFieldCodeKeys] = useState<string[]>([]);

	const formatedFieldCodeDataPerInterval = Object.keys(
		resultFieldCodeInterval.data
	).map((interval: any) => {
		const returnValue = {} as { [key: string]: number | string; name: string };
		returnValue['name'] = interval;
		resultFieldCodeInterval.data[interval].forEach(bucket => {
			if (!allFieldCodeKeys.includes(bucket.answer_text)) {
				setAllFieldCodeKeys([...allFieldCodeKeys, bucket.answer_text]);
			}
			returnValue[bucket.answer_text] = bucket.doc_count;
		});
		return returnValue;
	});

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
				<BarVerticalChart data={formatedFieldCodeData} />
			</HeaderChart>
			<HeaderChart
				title="Évolution des réponses"
				total={resultFieldCode.metadata.total}
			>
				<LineChart
					data={formatedFieldCodeDataPerInterval}
					dataKeys={allFieldCodeKeys}
					labelAxisY={
						fieldCode === 'comprehension' ? 'Score moyen' : 'Nombre de réponses'
					}
				/>
			</HeaderChart>
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

export default BarMultipleQuestionViz;
