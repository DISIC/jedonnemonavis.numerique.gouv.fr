import { getStatsColor } from '@/src/utils/stats';
import React from 'react';
import {
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	ResponsiveContainer,
	ComposedChart,
	Area
} from 'recharts';
import { AnswerIntention } from '@prisma/client';

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
	const { x, y, width, height, value, dataKey } = props;

	if (value === 0) return null;

	return (
		<g>
			{dataKey === 'good' && value[1] !== 0 && (
				<>
					<rect
						x={x}
						y={y - 30}
						width={25}
						height={20}
						fill="white"
						stroke="#DDDDDD"
						ry={12}
					/>
					<text
						x={x + width / 2}
						y={y - 16}
						textAnchor="middle"
						ry={15}
						style={{ fontSize: '0.75rem' }}
						fill="#666666"
					>
						{value[1]}
					</text>
				</>
			)}
			<rect
				x={x}
				y={y}
				width={width}
				height={height}
				fill={getStatsColor({ intention: dataKey })}
				ry={15}
			/>
		</g>
	);
};

const CustomBarChart = ({
	data
}: {
	data: Array<{ name: string } & { [key in AnswerIntention]: number }>;
}) => {
	return (
		<ResponsiveContainer width="100%" height={275}>
			<ComposedChart data={data}>
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
				<Area
					type="linear"
					dataKey="bad"
					stackId="area_intention"
					fill={getStatsColor({ intention: 'bad', kind: 'background' })}
					stroke={getStatsColor({ intention: 'bad' })}
				/>
				<Area
					type="linear"
					dataKey="medium"
					stackId="area_intention"
					fill={getStatsColor({ intention: 'medium', kind: 'background' })}
					stroke={getStatsColor({ intention: 'medium' })}
				/>
				<Area
					type="linear"
					dataKey="good"
					stackId="area_intention"
					fill={getStatsColor({ intention: 'good', kind: 'background' })}
					stroke={getStatsColor({ intention: 'good' })}
				/>
				<Bar
					dataKey="bad"
					barSize={25}
					stackId="bar_intention"
					shape={<CustomBar />}
				/>
				<Bar
					dataKey="medium"
					barSize={25}
					stackId="bar_intention"
					shape={<CustomBar />}
				/>
				<Bar
					dataKey="good"
					barSize={25}
					stackId="bar_intention"
					shape={<CustomBar />}
				/>
			</ComposedChart>
		</ResponsiveContainer>
	);
};

export default CustomBarChart;
