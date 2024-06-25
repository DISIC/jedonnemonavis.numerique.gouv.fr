import { trpc } from '@/src/utils/trpc';
import { Skeleton } from '@mui/material';
import GlobalChart from './GlobalChart';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { tss } from 'tss-react/dsfr';
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
	} = trpc.answer.getByChildFieldCodeInterval.useQuery(
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

	const dataTable = formatedFieldCodeData.flatMap(item => {
		let total = Object.values(item)
			.filter(val => typeof val === 'number')
			.reduce((acc, val) => (acc as number) + (val as number), 0);

		return Object.entries(item)
			.filter(([key, value]) => key !== 'name')
			.map(([key, value]) => ({
				name: item.name,
				value: value as number,
				'Pourcentage de réponses':
					typeof total === 'number' && total !== 0
						? Math.round(((value as number) / total) * 100)
						: 0,
				'Total des réponses': total as number,
				type: key
			}));
	});

	const labelsSet = new Set<string>(
		formatedFieldCodeData.flatMap(Object.keys).filter(key => key !== 'name')
	);
	const labels: string[] = Array.from(labelsSet);
	labels.push('Total des réponses');

	// DATA FOR TABLE INTERVAL
	interface FormattedData {
		name: string;
		data: { name: string; value: number }[];
	}

	const transformData = (data: any): FormattedData[] => {
		const formattedData: FormattedData[] = [];

		Object.keys(data).forEach(interval => {
			const returnValue = {
				name: interval,
				data: [] as { name: string; value: number }[]
			};

			data[interval].forEach((bucket: any) => {
				const newData = {
					name: bucket.answer_text,
					value: bucket.doc_count
				};

				returnValue.data.push(newData);
			});

			formattedData.push(returnValue);
		});

		return formattedData;
	};

	const tableDataInterval: FormattedData[] = transformData(
		resultFieldCodeInterval.data
	);

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
			<GlobalChart
				title="Répartition des réponses"
				total={resultFieldCode.metadata.total}
				data={dataTable}
				tableHeaders={labels}
			>
				<StackedVerticalBarChart
					data={formatedFieldCodeData}
					dataKeys={allFieldCodeKeys}
					fieldCode={fieldCode}
					total={total}
				/>
			</GlobalChart>
			<GlobalChart
				title="Evolution des réponses"
				total={resultFieldCode.metadata.total}
				tableHeaders={tableDataInterval.map(data => data.name)}
				intervalData={tableDataInterval}
			>
				<LineChart
					data={formatedFieldCodeDataPerInterval}
					dataKeys={allParentFieldCodeKeys}
					labelAxisY="Nombre de réponses"
				/>
			</GlobalChart>
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
