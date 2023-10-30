import { getStatsColor, getStatsIcon } from '@/src/utils/stats';
import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react/dsfr';

type Props = {
	average: number;
	answerText: string;
};

const AverageCard = ({ average, answerText }: Props) => {
	const { classes, cx } = useStyles();

	return (
		<div
			className={classes.averageCard}
			style={{
				backgroundColor: getStatsColor({
					average,
					kind: 'background'
				}),
				color: getStatsColor({ average })
			}}
		>
			<span className={classes.textAverageCard}>{answerText}</span>
			<i
				className={cx(
					fr.cx(getStatsIcon({ average })),
					classes.iconAverageCard
				)}
			/>
			<span className={classes.textAverageCard}>{average} / 10</span>
		</div>
	);
};

const useStyles = tss.create({
	averageCard: {
		display: 'flex',
		flexDirection: 'column',
		width: '325px',
		padding: '1.5rem 2rem',
		gap: '0.75rem',
		alignItems: 'center',
		justifyContent: 'center'
	},
	textAverageCard: {
		fontWeight: 'bold',
		fontSize: '1.5rem',
		textAlign: 'center'
	},
	iconAverageCard: {
		'::before': {
			'--icon-size': '6.5rem'
		}
	}
});

export default AverageCard;
