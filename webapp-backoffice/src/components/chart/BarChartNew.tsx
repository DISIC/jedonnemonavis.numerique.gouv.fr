import { getIntentionFromAverage, getStatsColor } from '@/src/utils/stats';
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
import { contextSmileys } from './types';

const CustomYAxisTick = (props: any) => {
	const { x, y, payload } = props;

	if (payload.value === 12) return null;

	return (
		<g transform={`translate(${x},${y})`}>
			<text x={0} y={0} dy={4} textAnchor="end" fill="#666" fontSize="0.75rem">
				{payload.value}
			</text>
		</g>
	);
};

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
					cursor={false}
				/>
				<Bar
					dataKey="value"
					fill="#929292"
					barSize={32}
					shape={<CustomBar />}
				/>
			</BarChart>
		</ResponsiveContainer>
	);
};

export default CustomBarChart;
