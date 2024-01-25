import { fr } from '@codegouvfr/react-dsfr';
import dynamic from 'next/dynamic';
import { tss } from 'tss-react/dsfr';
import { contextSmileys } from '../../chart/types';
import { getStatsColor, getStatsIcon } from '@/src/utils/stats';
import { AnswerIntention } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';

const BarChart = dynamic(() => import('@/src/components/chart/BarChart'), {
	ssr: false
});

type Props = {
	fieldCode: string;
	productId: number;
	startDate: string;
	endDate: string;
};

const ReviewAverageInterval = ({
	fieldCode,
	productId,
	startDate,
	endDate
}: Props) => {
	const { cx } = useStyles();

	const { data: resultFieldCodeIntervalAverage } = useQuery({
		queryKey: [
			'getAnswerByFieldCodeIntervalAverage',
			fieldCode,
			productId,
			startDate,
			endDate
		],
		queryFn: async () => {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_FORM_APP_URL}/api/open-api/answers/interval/average/${fieldCode}?product_id=${productId}&start_date=${startDate}&end_date=${endDate}`
			);
			if (res.ok) {
				return (await res.json()) as {
					data: Record<string, number>;
					metadata: { total: number; average: number };
				};
			}
		}
	});

	const barChartData = Object.entries(
		resultFieldCodeIntervalAverage?.data ?? {}
	).map(([interval, average]) => ({
		name: interval,
		value: average
	}));
	
	if (!Object.keys(resultFieldCodeIntervalAverage?.data || {})) return;

	return (
		<div className={fr.cx('fr-grid-row')}>
			<div className={fr.cx('fr-col-4')}>
				<h4 className={fr.cx('fr-mb-0')}>Historique des avis</h4>
				<p>{resultFieldCodeIntervalAverage?.metadata.average} moyen par mois</p>
				<div style={{ display: 'flex' }}>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							gap: '0.75rem'
						}}
					>
						{Object.entries(contextSmileys).map(([intention, data]) => (
							<div key={data.text} style={{ display: 'flex', gap: '0.25rem' }}>
								<i
									className={fr.cx(
										getStatsIcon({ intention: intention as AnswerIntention })
									)}
									style={{
										color: getStatsColor({
											intention: intention as AnswerIntention
										})
									}}
								/>
								<div
									style={{
										display: 'flex',
										flexDirection: 'column'
									}}
								>
									<span
										style={{
											color: getStatsColor({
												intention: intention as AnswerIntention
											})
										}}
									>
										{data.text}
									</span>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
			<div className={fr.cx('fr-col-8')}>
				<BarChart data={barChartData} />
			</div>
		</div>
	);
};

const useStyles = tss.create({});

export default ReviewAverageInterval;
