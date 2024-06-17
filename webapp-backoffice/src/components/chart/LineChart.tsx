import { translateMonthToFrench } from '@/src/utils/tools';
import { fr } from '@codegouvfr/react-dsfr';
import React from 'react';
import {
	XAxis,
	YAxis,
	CartesianGrid,
	ResponsiveContainer,
	Line,
	LineChart,
	Tooltip,
	Legend
} from 'recharts';

const lineColors = [
	fr.colors.getHex({ isDark: false }).decisions.text.title.grey.default,
	fr.colors.getHex({ isDark: false }).decisions.background.flat.blueFrance
		.default,
	fr.colors.getHex({ isDark: false }).decisions.border.default.redMarianne
		.default,
	fr.colors.getHex({ isDark: false }).decisions.border.default.greenEmeraude
		.default,
	fr.colors.getHex({ isDark: false }).decisions.border.default.purpleGlycine
		.default,
	fr.colors.getHex({ isDark: false }).decisions.border.default.blueCumulus
		.default,
	fr.colors.getHex({ isDark: false }).decisions.border.default.pinkTuile
		.default,
	fr.colors.getHex({ isDark: false }).decisions.background.flat
		.greenTilleulVerveine.default,
	fr.colors.getHex({ isDark: false }).decisions.background.flat.greenArchipel
		.default
];

const CustomLineChart = ({
	data,
	dataKeys,
	labelAxisY
}: {
	data:
		| { value: number | number[]; name: string }[]
		| { [key: string]: string | number; name: string }[];
	dataKeys?: string[];
	labelAxisY: string;
}) => {
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
				{!dataKeys ? (
					<>
						<Tooltip formatter={value => [value, labelAxisY]} cursor={false} />
						<Line
							type="linear"
							dataKey="value"
							stroke="black"
							strokeWidth={2}
						/>
					</>
				) : (
					<>
						<Tooltip cursor={false} />
						<Legend
							verticalAlign="top"
							align="left"
							iconType="plainline"
							iconSize={16}
							wrapperStyle={{
								paddingBottom: '20px',
								fontSize: '0.75rem'
							}}
						/>
						{dataKeys.map((key, index) => (
							<Line
								key={key}
								type="linear"
								dataKey={key}
								stroke={lineColors[index % lineColors.length]}
								strokeWidth={2}
							/>
						))}
					</>
				)}
			</LineChart>
		</ResponsiveContainer>
	);
};

export default CustomLineChart;
