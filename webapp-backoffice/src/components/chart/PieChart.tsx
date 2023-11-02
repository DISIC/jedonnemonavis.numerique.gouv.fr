import React from 'react';
import { PieChart, Pie, Cell } from 'recharts';
import { contextSmileys, type ChartPieProps } from './types';
import { AnswerIntention } from '@prisma/client';

const PieChartComponent = ({
	data,
	width = 185,
	height = 185,
	innerRadius = data.map(a => a.answer_text).includes('Oui' || 'Non') ? 54 : 52,
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
		name: AnswerIntention;
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
					fontSize={13}
					fontWeight="bold"
					dominantBaseline="central"
				>
					{answer_text}
				</text>
			);
		} else {
			return (
				<g>
					<path
						d={contextSmileys[name].svgPath} // 24 x 24
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
		<div
			style={{
				position: 'relative',
				marginTop: 'auto'
			}}
		>
			<PieChart width={width} height={height} style={{ marginLeft: 'auto' }}>
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
									fill={contextSmileys[answer.name].color}
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
