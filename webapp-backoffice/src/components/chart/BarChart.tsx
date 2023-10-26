import React from 'react';
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Cell,
	ResponsiveContainer
} from 'recharts';

const CustomBar = (props: any) => {
	const { fill, x, y, width, height, value } = props;

	return (
		<g>
			<rect x={x} y={y} width={width} height={height} fill={fill} ry={30}>
				<text fill="black">{value}</text>
			</rect>
		</g>
	);
};

const data = [
	{ date: '22/09', min: 2, max: 2.7 },
	{ date: '22/10', min: 4, max: 4.5 },
	{ date: '22/11', min: 3, max: 4 },
	{ date: '22/12', min: 5.5, max: 6 },
	{ date: '23/01', min: 6, max: 7 },
	{ date: '23/02', min: 6, max: 6.5 },
	{ date: '23/03', min: 6.5, max: 7.3 },
	{ date: '23/04', min: 6.5, max: 7.2 },
	{ date: '23/05', min: 8, max: 8.6 },
	{ date: '23/06', min: 8.5, max: 9 },
	{ date: '23/07', min: 8.5, max: 9.6 },
	{ date: '23/08', min: 8, max: 9 }
];

const CustomBarChart = () => {
	return (
		<ResponsiveContainer width="100%" height={400}>
			<BarChart data={data}>
				<CartesianGrid vertical={false} strokeDasharray="3 3" />
				<XAxis axisLine={false} dataKey="date" />
				<YAxis axisLine={false} tickCount={6} />
				<Bar dataKey="max" fill="#8884d8" shape={<CustomBar />} />
			</BarChart>
		</ResponsiveContainer>
	);
};

export default CustomBarChart;
