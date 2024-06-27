import { fr } from '@codegouvfr/react-dsfr';
import {
	Bar,
	BarChart,
	CartesianGrid,
	Label,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis
} from 'recharts';
import { tss } from 'tss-react/dsfr';

const CustomBar = (props: any) => {
	const { x, y, width, height, value } = props;

	return (
		<g>
			<rect x={x} y={y} width={width} height={height} fill="#929292" ry={17} />
		</g>
	);
};

const CustomBarChart = ({
	data
}: {
	data: { name: string; value: number }[];
}) => {
	const { classes } = useStyles();

	const CustomTooltip = ({ active, payload, label }: any) => {
		if (
			active &&
			payload &&
			payload.length &&
			!['pas clair du tout', 'très clair'].includes(label)
		) {
			return (
				<div className={classes.customTooltip}>
					<div>
						<p>{label}</p>
						<p className={classes.customTooltipValue}>
							Nombre de réponses : {payload[0].value}
						</p>
					</div>
				</div>
			);
		}

		return null;
	};

	return (
		<ResponsiveContainer width="100%" height={275}>
			<BarChart data={data}>
				<CartesianGrid vertical={false} strokeDasharray="3 3" />
				<XAxis
					axisLine={false}
					dataKey="name"
					fontSize="0.75rem"
					tickLine={false}
					padding={{ left: 50, right: 50 }}
				/>
				<YAxis
					axisLine={false}
					tickLine={false}
					tickCount={6}
					fontSize="0.75rem"
				>
					<Label
						value="Réponses"
						angle={90}
						position="insideLeft"
						fontSize="0.75rem"
						dy={-25}
						dx={-5}
					/>
				</YAxis>
				<Tooltip
					formatter={value => [value, 'Nombre de réponses']}
					content={<CustomTooltip />}
					cursor={false}
				/>
				<Bar
					dataKey="value"
					fill="#929292"
					barSize={32}
					radius={17}
					shape={<CustomBar />}
				/>
			</BarChart>
		</ResponsiveContainer>
	);
};

const useStyles = tss.create({
	customTooltip: {
		backgroundColor: fr.colors.decisions.background.default.grey.default,
		padding: '10px',
		border: '1px solid rgb(204, 204, 204)',
		p: {
			marginBottom: '5px'
		}
	},
	customTooltipValue: {
		color: fr.colors.decisions.text.mention.grey.default
	}
});

export default CustomBarChart;
