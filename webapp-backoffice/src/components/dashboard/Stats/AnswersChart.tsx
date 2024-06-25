import { FieldCodeSmiley } from '@/src/types/custom';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import { Skeleton } from '@mui/material';
import GlobalChart from './GlobalChart';
import dynamic from 'next/dynamic';
import { tss } from 'tss-react/dsfr';

const LineChart = dynamic(() => import('@/src/components/chart/LineChart'), {
	ssr: false
});

type Props = {
	fieldCode: FieldCodeSmiley;
	productId: number;
	startDate: string;
	endDate: string;
	total: number;
};

const AnswersChart = ({
	fieldCode,
	productId,
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
			<GlobalChart
				title="Évolution des réponses"
				total={total}
				data={countByFieldCodePerMonth}
			>
				<LineChart
					data={countByFieldCodePerMonth}
					labelAxisY="Nombre de réponses"
				/>
			</GlobalChart>

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
