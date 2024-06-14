import { FieldCodeSmiley } from '@/src/types/custom';
import { fr } from '@codegouvfr/react-dsfr';
import QuestionWrapper from './QuestionWrapper';
import { trpc } from '@/src/utils/trpc';
import { tss } from 'tss-react/dsfr';
import { Skeleton } from '@mui/material';
import HeaderChart from './HeaderChart';
import dynamic from 'next/dynamic';

const LineChart = dynamic(() => import('@/src/components/chart/LineChart'), {
	ssr: false
});

type Props = {
	fieldCode: FieldCodeSmiley;
	productId: number;
	startDate: string;
	endDate: string;
	total: number;
	required?: boolean;
};

const BarQuestionViz = ({
	fieldCode,
	productId,
	startDate,
	endDate,
	total,
	required = false
}: Props) => {
	const { classes, cx } = useStyles();

	const { data: resultFieldCode, isLoading } =
		trpc.answer.getByFieldCode.useQuery(
			{
				product_id: productId.toString(),
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

	const {
		data: { data: countByFieldCodePerMonth },
		isLoading: isLoadingCountByFieldCodePerMonth
	} = trpc.answer.countByFieldCodePerMonth.useQuery(
		{
			product_id: productId,
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
			<h4 className={fr.cx('fr-mt-10v')}>Répartition des réponses</h4>
			<HeaderChart title="Répartition des réponses">
				<></>
			</HeaderChart>
			<HeaderChart title="Evolution des réponses" total={total}>
				<LineChart data={countByFieldCodePerMonth} labelAxisY="Score moyen" />
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

export default BarQuestionViz;
