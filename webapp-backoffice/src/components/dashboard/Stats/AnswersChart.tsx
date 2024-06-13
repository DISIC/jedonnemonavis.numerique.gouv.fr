import { getStatsColor, getStatsIcon } from '@/src/utils/stats';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import { Skeleton } from '@mui/material';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { tss } from 'tss-react/dsfr';

type Props = {
	productId: number;
	startDate: string;
	endDate: string;
};

const LineChart = dynamic(() => import('@/src/components/chart/LineChart'), {
	ssr: false
});

const AnswersChart = ({ productId, startDate, endDate }: Props) => {
	const [currentChart, setCurrentChart] = useState<'chart' | 'table'>('chart');

	const {
		data: { data },
		isLoading
	} = trpc.answer.countByFieldCodePerMonth.useQuery(
		{
			product_id: productId,
			field_code: 'satisfaction',
			start_date: startDate,
			end_date: endDate
		},
		{ initialData: { data: [] } }
	);

	const { classes, cx } = useStyles({
		currentChart
	});

	const totalAnswers = data.reduce((acc, { value }) => acc + value, 0);

	return (
		<div className={cx(classes.container, fr.cx('fr-mt-10v'))}>
			<div className={classes.header}>
				<div className={classes.container}>
					<h4 className={fr.cx('fr-mb-0')}>Evolution des réponses</h4>
					<span>
						{isLoading ? (
							<Skeleton variant="text" width={22} height="1rem" />
						) : (
							totalAnswers
						)}{' '}
						réponses
					</span>
				</div>
				{/* <div className={classes.flexAlignCenter}>
					<button className={cx(classes.button, 'button-chart')}>
						Graphique
					</button>
					<button className={cx(classes.button, 'button-table')}>
						Tableau
					</button>
				</div> */}
			</div>
			<LineChart data={data} />
		</div>
	);
};

const useStyles = tss
	.withName(AnswersChart.name)
	.withParams<{ currentChart: 'chart' | 'table' }>()
	.create({
		container: {
			display: 'flex',
			flexDirection: 'column',
			gap: '0.25rem'
		},
		header: {
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
			marginBottom: '1rem'
		},
		flexAlignCenter: {
			display: 'flex',
			alignItems: 'center'
		},
		button: {
			backgroundColor: 'transparent',
			border: '1px solid',
			borderRadius: '0.25rem',
			color: fr.colors.decisions.background.flat.blueFrance.default,
			borderColor: fr.colors.decisions.background.flat.blueFrance.default
		}
	});

export default AnswersChart;
