import { translateMonthToFrench } from '@/src/utils/tools';
import { fr } from '@codegouvfr/react-dsfr';
import {
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis
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
	labelAxisY,
	ticks,
	customHeight
}: {
	data:
		| { value: number | number[]; name: string }[]
		| { [key: string]: string | number; name: string }[];
	dataKeys?: string[];
	labelAxisY: string;
	ticks?: number[];
	customHeight?: number;
}) => {
	const isMobile = window.innerWidth <= fr.breakpoints.getPxValues().md;

	return (
		<ResponsiveContainer
			width="100%"
			height={
				customHeight ||
				(dataKeys
					? 300 + Math.floor((dataKeys.length - 1) / 4) * (isMobile ? 75 : 10)
					: 275)
			}
		>
			<LineChart
				title={
					labelAxisY === 'Moyenne satisfaction'
						? 'Graphique : Évolution de la note moyenne'
						: 'Graphique : Évolution des réponses'
				}
				role="img"
				data={data.map(item => ({
					...item,
					name: translateMonthToFrench(item.name)
				}))}
				margin={{ top: dataKeys ? 0 : 20 }}
			>
				<CartesianGrid vertical={false} strokeDasharray="3 3" />
				<XAxis
					axisLine={false}
					dataKey="name"
					fontSize="0.75rem"
					tickLine={false}
					padding={{ left: 25, right: 25 }}
					dy={5}
				/>
				<YAxis
					axisLine={false}
					tickLine={false}
					fontSize="0.75rem"
					tickFormatter={(value: number) => {
						const intValue = Math.round(value);
						const intStr = intValue.toString();
						if (intStr.length > 4) {
							const prefix = intStr.slice(0, -3);
							return `${prefix}k`;
						}
						return value.toString();
					}}
					tickCount={6}
					ticks={ticks ? ticks : undefined}
					label={{
						value: labelAxisY,
						angle: -90,
						position: 'insideLeft',
						fontSize: '0.75rem',
						dx: 2,
						textAnchor: 'middle',
						style: { textAnchor: 'middle' }
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
								fontSize: '0.75rem',
								left: 0
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
