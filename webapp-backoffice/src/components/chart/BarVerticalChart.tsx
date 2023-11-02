import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { ChartVerticalBarProps } from './types';

const CustomBarCell = (props: any) => {
	const { x, y, width, height, value, name } = props;

	const numberOfDigits = value.toString().split('').length;

	return (
		<g>
			<text x={x} y={y + 10} style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>
				{name}
			</text>
			<rect
				x={x}
				y={y + 20}
				width={width}
				height={height}
				rx={15}
				fill="#000091"
			/>
			<text
				y={y + height * 1.35}
				x={width - numberOfDigits * 8 - 10}
				fill="white"
			>
				{value}
			</text>
		</g>
	);
};

const CustomBarChart = ({ data }: ChartVerticalBarProps) => {
	return (
		<ResponsiveContainer width="100%" height={70 * data.length}>
			<BarChart data={data} layout="vertical">
				<XAxis hide type="number" />
				<YAxis hide type="category" dataKey="name" />
				<Bar dataKey="value" barSize={30} shape={<CustomBarCell />} />
			</BarChart>
		</ResponsiveContainer>
	);
};

export default CustomBarChart;
