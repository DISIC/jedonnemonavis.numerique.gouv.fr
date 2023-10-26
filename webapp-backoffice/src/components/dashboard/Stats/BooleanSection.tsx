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

const BarChart = dynamic(() => import('@/src/components/chart/PieChart'), {
	ssr: false
});

type Props = {
	fieldCode: string;
	productId: number;
};

const BooleanSection = ({ fieldCode, productId }: Props) => {
	const { classes } = useStyles();

	const { data: resultFieldCode } = useQuery({
		queryKey: ['getAnswerByFieldCode', fieldCode, productId],
		queryFn: async () => {
			const res = await fetch(
				`http://localhost:3001/api/open-api/answers/${fieldCode}?product_id=${productId}`
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

	return (
		<div className={classes.mainSection}>
			<div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
				<h4 className={fr.cx('fr-mb-0')}>
					{resultFieldCode?.metadata.fieldLabel}
				</h4>
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
					<BarChart kind="pie" data={barChartData} />
				</div>
			</div>
			<div
				style={{ display: 'flex', flexDirection: 'column', width: '100%' }}
			></div>
		</div>
	);
};

const useStyles = tss.create({
	mainSection: {
		display: 'flex',
		gap: '2rem'
	},
	blueColor: {
		color: fr.colors.decisions.text.actionHigh.blueFrance.default
	}
});

export default BooleanSection;
