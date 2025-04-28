import { HideBlockOptionsHelper } from '@/src/pages/administration/dashboard/product/[id]/stats';
import { trpc } from '@/src/utils/trpc';
import { Skeleton } from '@mui/material';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { tss } from 'tss-react/dsfr';
import ChartWrapper from './ChartWrapper';
import QuestionWrapper from './QuestionWrapper';

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
	buttonId?: number;
	startDate: string;
	endDate: string;
	total: number;
	hiddenOptions?: HideBlockOptionsHelper;
	required?: boolean;
};

const BarMultipleSplitQuestionViz = ({
	fieldCode,
	productId,
	buttonId,
	startDate,
	endDate,
	total,
	hiddenOptions,
	required = false
}: Props) => {
	const { classes } = useStyles();

	const sortOrder: { [key: string]: number } =
		fieldCode === 'contact_reached'
			? {
					Non: 0,
					Oui: 1,
					'Pas de réponse': 2
				}
			: {
					'Très mauvaise': 0,
					Mauvaise: 1,
					'Ni bonne, ni mauvaise': 2,
					Bonne: 3,
					Excellente: 4,
					'Ne se prononce pas': 5
				};

	const { data: resultFieldCode, isLoading: isLoadingFieldCode } =
		trpc.answer.getByChildFieldCode.useQuery(
			{
				product_id: productId,
				...(buttonId && { button_id: buttonId }),
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
	} = trpc.answer.getByChildFieldCodeInterval.useQuery(
		{
			product_id: productId,
			...(buttonId && { button_id: buttonId }),
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
	const [allParentFieldCodeKeys, setAllParentFieldCodeKeys] = useState<
		string[]
	>([]);

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

	const formatedFieldCodeDataPerInterval = Object.keys(
		resultFieldCodeInterval.data
	).map((interval: any) => {
		const returnValue = {} as { [key: string]: number | string; name: string };
		returnValue['name'] = interval;
		resultFieldCodeInterval.data[interval].forEach(bucket => {
			if (!allParentFieldCodeKeys.includes(bucket.answer_text)) {
				setAllParentFieldCodeKeys([
					...allParentFieldCodeKeys,
					bucket.answer_text
				]);
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
			hidePercentage={['contact_reached', 'contact_satisfaction'].includes(
				fieldCode
			)}
			hiddenOptions={hiddenOptions}
		>
			<ChartWrapper
				title="Répartition des réponses"
				data={formatedFieldCodeData}
				sortOrder={sortOrder}
				reverseData
				displayTotal="classic"
			>
				<StackedVerticalBarChart
					data={formatedFieldCodeData}
					dataKeys={allFieldCodeKeys}
					fieldCode={fieldCode}
					total={total}
					sortOrder={sortOrder}
				/>
			</ChartWrapper>
			<ChartWrapper
				title="Évolution des réponses"
				total={resultFieldCode.metadata.total}
				data={formatedFieldCodeDataPerInterval}
			>
				<LineChart
					data={formatedFieldCodeDataPerInterval}
					dataKeys={allParentFieldCodeKeys}
					labelAxisY="Nombre de réponses"
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

export default BarMultipleSplitQuestionViz;
