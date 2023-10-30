import {
	getIntentionFromAverage,
	getStatsAnswerText,
	getStatsColor,
	getStatsIcon
} from '@/src/utils/stats';
import { fr } from '@codegouvfr/react-dsfr';
import { AnswerIntention } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { tss } from 'tss-react/dsfr';
import AverageCard from './AverageCard';

const BarChart = dynamic(() => import('@/src/components/chart/PieChart'), {
	ssr: false
});

type Props = {
	fieldCode: string;
	productId: number;
	startDate: string;
	endDate: string;
};

const SmileySection = ({ fieldCode, productId, startDate, endDate }: Props) => {
	const { classes } = useStyles();

	const { data: resultFieldCode } = useQuery({
		queryKey: [
			'getAnswerByFieldCode',
			fieldCode,
			productId,
			startDate,
			endDate
		],
		queryFn: async () => {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_FORM_APP_URL}/api/open-api/answers/${fieldCode}?product_id=${productId}&start_date=${startDate}&end_date=${endDate}`
			);
			if (res.ok) {
				return (await res.json()) as {
					data: [
						{
							answer_text: string;
							intention: AnswerIntention;
							doc_count: number;
						}
					];
					metadata: { total: number; average: number };
				};
			}
		}
	});

	const currentAnswerTextFromAverage = getStatsAnswerText({
		buckets: resultFieldCode?.data || [],
		intention: getIntentionFromAverage(
			resultFieldCode?.metadata.average as number
		)
	});

	const barChartData =
		resultFieldCode?.data.map(({ answer_text, intention, doc_count }) => ({
			name: intention,
			value: doc_count,
			answer_text
		})) || [];

	return (
		<div className={classes.mainSection}>
			<AverageCard
				average={resultFieldCode?.metadata.average as number}
				answerText={currentAnswerTextFromAverage}
			/>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					flex: 1,
					width: '100%'
				}}
			>
				<h4 className={fr.cx('fr-mb-0')}>Répartition des avis </h4>
				<p>{resultFieldCode?.metadata.total} avis total</p>
				<div style={{ display: 'flex' }}>
					<div
						style={{
							width: '100%',
							display: 'flex',
							flexDirection: 'column',
							gap: '0.75rem'
						}}
					>
						{resultFieldCode?.data.map(
							({ answer_text, intention, doc_count }) => (
								<div
									key={answer_text}
									style={{ display: 'flex', gap: '0.25rem' }}
								>
									<i
										className={fr.cx(getStatsIcon({ intention }))}
										style={{ color: getStatsColor({ intention }) }}
									/>
									<div
										style={{
											display: 'flex',
											flexDirection: 'column'
										}}
									>
										<span style={{ color: getStatsColor({ intention }) }}>
											{answer_text}
										</span>
										<span
											style={{ marginTop: '0.15rem', fontSize: '0.875rem' }}
										>
											{(
												(doc_count / resultFieldCode.metadata.total) *
												100
											).toFixed(0)}
											% / {doc_count} avis
										</span>
									</div>
								</div>
							)
						)}
					</div>
					<BarChart kind="pie" data={barChartData} />
				</div>
			</div>
		</div>
	);
};

const useStyles = tss.create({
	mainSection: {
		display: 'flex',
		flexWrap: 'wrap',
		gap: '3rem'
	}
});

export default SmileySection;
