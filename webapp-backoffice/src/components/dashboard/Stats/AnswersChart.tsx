import { FieldCodeSmiley } from '@/src/types/custom';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import { Skeleton } from '@mui/material';
import ChartWrapper from './ChartWrapper';
import dynamic from 'next/dynamic';
import { tss } from 'tss-react/dsfr';

const LineChart = dynamic(() => import('@/src/components/chart/LineChart'), {
	ssr: false
});

type Props = {
	fieldCode: FieldCodeSmiley;
	productId: number;
	buttonId: number | null;
	startDate: string;
	endDate: string;
	total: number;
};

const AnswersChart = ({
	fieldCode,
	productId,
	buttonId,
	startDate,
	endDate,
	total
}: Props) => {
	const { classes, cx } = useStyles();

	const {
		data: { data: countByFieldCodePerMonth },
		isLoading: isLoadingCountByFieldCodePerMonth
	} = trpc.answer.countByFieldCodePerMonth.useQuery(
		{
			product_id: productId,
			...(buttonId && {button_id: buttonId}),
			field_code: fieldCode,
			start_date: startDate,
			end_date: endDate
		},
		{ initialData: { data: [] } }
	);

	if (isLoadingCountByFieldCodePerMonth) {
		return (
			<div className={classes.mainSection}>
				<Skeleton />
			</div>
		);
	}

	if (!total) return;

	return (
		<>
			<ChartWrapper
				title="Évolution des réponses"
				total={total}
				data={countByFieldCodePerMonth}
			>
				<LineChart
					data={countByFieldCodePerMonth}
					labelAxisY="Nombre de réponses"
				/>
			</ChartWrapper>

			<hr className={fr.cx('fr-hr', 'fr-mt-16v')} />
		</>
	);
};

const useStyles = tss.create({
	mainSection: {
		display: 'flex',
		flexWrap: 'wrap',
		gap: '3rem'
	}
});

export default AnswersChart;
