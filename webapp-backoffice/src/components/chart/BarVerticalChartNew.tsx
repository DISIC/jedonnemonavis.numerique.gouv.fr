import React from 'react';
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	ResponsiveContainer,
	CartesianGrid,
	Tooltip,
	Legend,
	Label
} from 'recharts';

const CustomBar = (props: any) => {
	const { x, y, width, height, name } = props;

	return (
		<g>
			<text x={x + 5} y={y} fill="#666666" style={{ fontSize: '0.8rem' }}>
				{name}
			</text>
			<rect
				x={x}
				y={y + 5}
				width={width}
				height={height}
				fill="#929292"
				ry={15}
			/>
		</g>
	);
};

const BarVerticalChartNew = ({
	data
}: {
	data: { name: string; value: number }[];
}) => {
	return (
		<ResponsiveContainer width="100%" height={75 * data.length}>
			<BarChart data={data} layout="vertical">
				<CartesianGrid horizontal={false} strokeDasharray="3 3" />
				<XAxis
					axisLine={false}
					tick={{ fontSize: '0.75rem', fill: '#666666' }}
					tickSize={0}
					tickCount={6}
					type="number"
				>
					<Label
						value="Nombre de réponses"
						fontSize="0.75rem"
						dy={5}
						position="insideBottom"
					/>
				</XAxis>
				<YAxis axisLine={false} tick={false} type="category" dataKey="name">
					<Label
						value="Réponses"
						angle={90}
						position="insideLeft"
						fontSize="0.75rem"
						dy={-25}
						dx={35}
					/>
				</YAxis>
				<Tooltip
					formatter={value => [value, 'Nombre de réponses']}
					cursor={false}
				/>
				<Bar
					dataKey="value"
					fill="#929292"
					barSize={24}
					shape={<CustomBar />}
				/>
			</BarChart>
		</ResponsiveContainer>
	);
};

export default BarVerticalChartNew;
