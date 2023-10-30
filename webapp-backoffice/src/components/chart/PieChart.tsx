import React from 'react';
import { PieChart, Pie, Cell } from 'recharts';
import type { ChartPieProps } from './types';

const contextChart = {
	good: {
		svgPath:
			'M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM7 13H9C9 14.6569 10.3431 16 12 16C13.6569 16 15 14.6569 15 13H17C17 15.7614 14.7614 18 12 18C9.23858 18 7 15.7614 7 13ZM8 11C7.17157 11 6.5 10.3284 6.5 9.5C6.5 8.67157 7.17157 8 8 8C8.82843 8 9.5 8.67157 9.5 9.5C9.5 10.3284 8.82843 11 8 11ZM16 11C15.1716 11 14.5 10.3284 14.5 9.5C14.5 8.67157 15.1716 8 16 8C16.8284 8 17.5 8.67157 17.5 9.5C17.5 10.3284 16.8284 11 16 11Z',
		color: '#18753C'
	},
	medium: {
		svgPath:
			'M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM8 14H16V16H8V14ZM8 11C7.17157 11 6.5 10.3284 6.5 9.5C6.5 8.67157 7.17157 8 8 8C8.82843 8 9.5 8.67157 9.5 9.5C9.5 10.3284 8.82843 11 8 11ZM16 11C15.1716 11 14.5 10.3284 14.5 9.5C14.5 8.67157 15.1716 8 16 8C16.8284 8 17.5 8.67157 17.5 9.5C17.5 10.3284 16.8284 11 16 11Z',
		color: '#716043'
	},
	bad: {
		svgPath:
			'M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM7 17C7 14.2386 9.23858 12 12 12C14.7614 12 17 14.2386 17 17H15C15 15.3431 13.6569 14 12 14C10.3431 14 9 15.3431 9 17H7ZM8 11C7.17157 11 6.5 10.3284 6.5 9.5C6.5 8.67157 7.17157 8 8 8C8.82843 8 9.5 8.67157 9.5 9.5C9.5 10.3284 8.82843 11 8 11ZM16 11C15.1716 11 14.5 10.3284 14.5 9.5C14.5 8.67157 15.1716 8 16 8C16.8284 8 17.5 8.67157 17.5 9.5C17.5 10.3284 16.8284 11 16 11Z',
		color: '#CE0500'
	},
	neutral: {
		svgPath: undefined,
		color: '#716043'
	}
};

const PieChartComponent = ({
	data,
	width = 200,
	height = 200,
	innerRadius = 52,
	outerRadius = 85
}: ChartPieProps) => {
	const renderCustomizedLabel = ({
		cx,
		cy,
		midAngle,
		innerRadius,
		outerRadius,
		name,
		answer_text
	}: {
		[key: string]: any;
		name: 'good' | 'medium' | 'bad';
	}) => {
		const sin = Math.sin(-(Math.PI / 180) * midAngle);
		const cos = Math.cos(-(Math.PI / 180) * midAngle);

		const x = cx + (cos * (innerRadius + outerRadius)) / 2;
		const y = cy + (sin * (innerRadius + outerRadius)) / 2;

		if (answer_text === 'Oui' || answer_text === 'Non') {
			return (
				<text
					x={x}
					y={y}
					fill={answer_text === 'Non' ? '#000091' : 'white'}
					textAnchor="middle"
					fontSize={14}
					fontWeight="bold"
					dominantBaseline="central"
				>
					{answer_text}
				</text>
			);
		} else {
			return (
				<g width={30}>
					<path
						d={contextChart[name].svgPath} // 24 x 24
						transform={`translate(${x - (24 * 1.1) / 2}, ${
							y - (24 * 1.1) / 2
						}),scale(1.1)`}
						fill="#ffffff"
						opacity={0.9}
					/>
				</g>
			);
		}
	};

	return (
		<div style={{ position: 'relative', marginTop: 'auto' }}>
			<PieChart width={width} height={height}>
				<Pie
					data={data}
					cx={width / 2}
					cy={height / 2}
					innerRadius={innerRadius}
					outerRadius={outerRadius}
					cornerRadius={10}
					dataKey="value"
					paddingAngle={
						data.map(a => a.answer_text).includes('Oui' || 'Non') ? 3 : 1
					}
					labelLine={false}
					label={renderCustomizedLabel}
				>
					{data.map((answer, index) => {
						if (answer.answer_text === 'Oui' || answer.answer_text === 'Non') {
							return (
								<Cell
									key={`cell-${index}`}
									stroke="#000091"
									strokeWidth={2}
									fill={
										answer.answer_text === 'Oui' ? '#000091' : 'transparent'
									}
								/>
							);
						} else {
							return (
								<Cell
									key={`cell-${index}`}
									fill={contextChart[answer.name].color}
								/>
							);
						}
					})}
				</Pie>
			</PieChart>
		</div>
	);
};

export default PieChartComponent;
