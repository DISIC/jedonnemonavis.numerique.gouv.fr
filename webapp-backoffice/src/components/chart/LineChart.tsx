import { translateMonthToFrench } from '@/src/utils/tools';
import React from 'react';
import {
	XAxis,
	YAxis,
	CartesianGrid,
	ResponsiveContainer,
	Line,
	LineChart,
	Tooltip
} from 'recharts';

const CustomLineChart = ({
	data,
	labelAxisY
}: {
	data: { value: number; name: string }[];
	labelAxisY: string;
}) => {
	console.log(data);
	return (
		<ResponsiveContainer width="100%" height={275}>
			<LineChart
				data={data.map(item => ({
					...item,
					name: translateMonthToFrench(item.name)
				}))}
			>
				<CartesianGrid vertical={false} strokeDasharray="3 3" />
				<XAxis
					axisLine={false}
					dataKey="name"
					fontSize="0.75rem"
					tickLine={false}
					padding={{ left: 25, right: 25 }}
				/>
				<YAxis
					axisLine={false}
					tickLine={false}
					fontSize="0.75rem"
					tickCount={6}
					label={{
						value: labelAxisY,
						angle: 90,
						position: 'insideLeft',
						fontSize: '0.75rem',
						dy: -60
					}}
				/>
				<Tooltip formatter={value => [value, labelAxisY]} />
				<Line
					type="linear"
					dataKey="value"
					dot={false}
					stroke="black"
					strokeWidth={2}
				/>
			</LineChart>
		</ResponsiveContainer>
	);
};

export default CustomLineChart;