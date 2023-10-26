import { fr } from '@codegouvfr/react-dsfr';
import { AnswerIntention } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { tss } from 'tss-react/dsfr';

const BarChart = dynamic(() => import('@/src/components/chart/BarChart'), {
	ssr: false
});

type Props = {
	fieldCode: string;
	productId: number;
};

const SmileySection = ({ fieldCode, productId }: Props) => {
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
					metadata: { total: number };
				};
			}
		}
	});

	const barChartData =
		resultFieldCode?.data.map(({ intention, doc_count }) => ({
			name: intention,
			value: doc_count
		})) || [];

	return (
		<div className={classes.mainSection}>
			<div
				style={{
					width: '200px',
					height: '250px',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					backgroundColor: 'red'
				}}
			></div>
			<div>
				<h4 className={fr.cx('fr-mb-0')}>Répartition des avis </h4>
				<p>{resultFieldCode?.metadata.total} avis total</p>
				{resultFieldCode?.data.map(({ answer_text, intention, doc_count }) => {
					const color =
						intention == 'good'
							? '#18753C'
							: intention === 'medium'
							? '#716043'
							: '#CE0500';

					const icon = (
						<i
							className={fr.cx(
								intention === 'good'
									? 'ri-emotion-happy-line'
									: intention === 'medium'
									? 'ri-emotion-normal-line'
									: 'ri-emotion-unhappy-line'
							)}
							style={{ color }}
						/>
					);
					return (
						<div key={answer_text} style={{ display: 'flex', gap: '0.5rem' }}>
							{icon}
							<div
								style={{
									display: 'flex',
									flexDirection: 'column'
								}}
							>
								<span color={color}>{answer_text}</span>
								<span>
									{((doc_count / resultFieldCode.metadata.total) * 100).toFixed(
										0
									)}
									% / {doc_count} avis
								</span>
							</div>
						</div>
					);
				})}
			</div>
			<BarChart kind="pie" data={barChartData} />
		</div>
	);
};

const useStyles = tss.create({
	mainSection: {
		display: 'flex',
		justifyContent: 'space-between',
		gap: '2rem'
	}
});

export default SmileySection;
