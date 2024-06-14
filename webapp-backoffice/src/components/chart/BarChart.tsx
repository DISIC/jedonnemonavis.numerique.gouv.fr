import { getIntentionFromAverage, getStatsColor } from '@/src/utils/stats';
import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
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

	if (value === 0) return null;

	return (
		<g>
			<rect
				x={x}
				y={y}
				width={width}
				height={height}
				fill={getStatsColor({ average: value })}
				ry={15}
			/>
			<text
				x={x + width / 2}
				y={y + height - 10}
				textAnchor="middle"
				style={{ fontSize: '0.75rem' }}
				fill="white"
			>
				{value}
			</text>
			<g>
				<path
					d={contextSmileys[getIntentionFromAverage(value)].svgPath} // 24 x 24
					transform={`translate(${x + 2.5}, ${y - 20}),scale(0.8)`}
					fill={getStatsColor({ average: value })}
					opacity={0.9}
				/>
			</g>
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
				<CartesianGrid
					vertical={false}
					strokeDasharray="3 3"
					className="review-average-line"
				/>
				<XAxis
					axisLine={false}
					dataKey="name"
					fontSize="0.75rem"
					tickLine={false}
				/>
				<YAxis
					axisLine={false}
					ticks={[0, 2, 4, 6, 8, 10, 12]}
					tick={<CustomYAxisTick />}
					tickLine={false}
					fontSize="0.75rem"
				/>
				<Bar
					dataKey="value"
					fill="#8884d8"
					barSize={25}
					shape={<CustomBar />}
				/>
			</BarChart>
		</ResponsiveContainer>
	);
};

export default CustomBarChart;
