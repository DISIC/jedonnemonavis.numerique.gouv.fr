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

const PieChart = dynamic(() => import('@/src/components/chart/PieChart'), {
	ssr: false
});

const BarVerticalChart = dynamic(
	() => import('@/src/components/chart/BarVerticalChart'),
	{
		ssr: false
	}
);

type Props = {
	fieldCode: string;
	productId: number;
	startDate: string;
	endDate: string;
};

const BooleanSection = ({
	fieldCode,
	productId,
	startDate,
	endDate
}: Props) => {
	const { classes } = useStyles();

	const { data: resultFieldCode } = useQuery({
		queryKey: ['getAnswerByFieldCode', fieldCode, productId],
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
					metadata: { total: number; average: number; fieldLabel: string };
				};
			}
		}
	});

	const { data: resultFieldCodeDetails } = useQuery({
		queryKey: [
			'getAnswerByFieldCodeDetails',
			fieldCode,
			productId,
			startDate,
			endDate
		],
		queryFn: async () => {
			const res = await fetch(
				`http://localhost:3001/api/open-api/answers/${fieldCode}_details?product_id=${productId}`
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
					metadata: { total: number; average: number; fieldLabel: string };
				};
			}
		}
	});

	const barChartData =
		resultFieldCode?.data.map(({ answer_text, intention, doc_count }) => ({
			name: intention,
			value: doc_count,
			answer_text
		})) || [];

	const barChartDataDetails =
		resultFieldCodeDetails?.data.map(({ answer_text, doc_count }) => ({
			name: answer_text,
			value: doc_count
		})) || [];

	return (
		<div className={fr.cx('fr-grid-row')}>
			<div
				className={fr.cx('fr-col-6', 'fr-pr-6v')}
				style={{ display: 'flex', flexDirection: 'column', width: '100%' }}
			>
				<h4 className={fr.cx('fr-mb-0')}>
					{resultFieldCode?.metadata.fieldLabel}
				</h4>
				<p className={fr.cx('fr-hint-text', 'fr-text--md')}>
					{resultFieldCode?.metadata.total} avis total
				</p>
				<div style={{ display: 'flex' }}>
					<div
						style={{
							width: '100%',
							display: 'flex',
							flexDirection: 'column',
							gap: '0.75rem'
						}}
					>
						{resultFieldCode?.data.map(({ answer_text, doc_count }) => (
							<div
								key={answer_text}
								style={{
									display: 'flex',
									flexDirection: 'column'
								}}
							>
								<span className={classes.blueColor}>{answer_text}</span>
								<span style={{ marginTop: '0.15rem', fontSize: '0.875rem' }}>
									{((doc_count / resultFieldCode.metadata.total) * 100).toFixed(
										0
									)}
									% / {doc_count} avis
								</span>
							</div>
						))}
					</div>
					<PieChart kind="pie" data={barChartData} />
				</div>
			</div>
			<div
				className={fr.cx('fr-col-6', 'fr-pl-6v')}
				style={{ display: 'flex', flexDirection: 'column', width: '100%' }}
			>
				<h4 className={fr.cx('fr-mb-0')}>
					{resultFieldCodeDetails?.metadata.fieldLabel}
				</h4>
				<p className={fr.cx('fr-mb-0', 'fr-hint-text', 'fr-text--md')}>
					{resultFieldCodeDetails?.metadata.total} réponses total
				</p>
				<BarVerticalChart data={barChartDataDetails} kind="bar" />
			</div>
		</div>
	);
};

const useStyles = tss.create({
	blueColor: {
		color: fr.colors.decisions.text.actionHigh.blueFrance.default
	}
});

export default BooleanSection;
