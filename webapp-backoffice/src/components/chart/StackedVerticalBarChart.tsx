import { getHexaColorFromIntentionText } from '@/src/utils/tools';
import { fr } from '@codegouvfr/react-dsfr';
import {
	Bar,
	BarChart,
	CartesianGrid,
	Label,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis
} from 'recharts';

const sortOrder = {
	'Pas bien': 0,
	Moyen: 1,
	'Très bien': 2
};

const colorsContactReached = [
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
		.default
];

const renderLegend = (props: any) => {
	const { payload } = props;

	return (
		<div
			style={{
				display: 'flex',
				gap: '25px'
			}}
		>
			{payload
				.sort(
					(a: any, b: any) =>
						sortOrder[a.value as keyof typeof sortOrder] -
						sortOrder[b.value as keyof typeof sortOrder]
				)
				.map((entry: any, index: number) => (
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: '5px',
							fontSize: '14px'
						}}
					>
						<div
							style={{
								width: '24px',
								height: '24px',
								borderRadius: 8,
								backgroundColor: entry.color
							}}
						/>
						{entry.value}
					</div>
				))}
		</div>
	);
};

const CustomBar = (props: any) => {
	const { x, y, width, height, name, currentIndex, fill } = props;

	return (
		<g>
			{currentIndex === 0 && (
				<text x={x + 5} y={y} fill="#666666" style={{ fontSize: '0.8rem' }}>
					{name}
				</text>
			)}
			<rect x={x} y={y + 5} width={width} height={height} fill={fill} ry={15} />
		</g>
	);
};

const StackedVerticalBarChart = ({
	data,
	dataKeys,
	fieldCode
}: {
	data: { name: string; [key: string]: number | string }[];
	dataKeys: string[];
	fieldCode: 'contact_reached' | 'contact_satisfaction';
	total: number;
}) => {
	return (
		<ResponsiveContainer width="100%" height={300}>
			<BarChart data={data} layout="vertical">
				<CartesianGrid horizontal={false} strokeDasharray="3 3" />
				<XAxis
					axisLine={false}
					type="number"
					fontSize="0.75rem"
					tickLine={false}
				>
					<Label
						value="Nombre de répondants"
						fontSize="0.75rem"
						dy={7.5}
						position="insideBottom"
					/>
				</XAxis>
				<YAxis
					axisLine={false}
					tick={false}
					type="category"
					dataKey="name"
					domain={[0, 1]}
					tickLine={false}
					fontSize="0.75rem"
				>
					<Label
						value="Réponses"
						angle={90}
						position="insideLeft"
						fontSize="0.75rem"
						dy={-25}
						dx={35}
					/>
				</YAxis>
				<Tooltip cursor={false} />
				<Legend
					verticalAlign="top"
					align="left"
					height={60}
					content={renderLegend}
				/>
				{dataKeys.map((key, index) => (
					<Bar
						key={key}
						dataKey={key}
						radius={5}
						barSize={24}
						stackId="a"
						fill={
							fieldCode === 'contact_reached'
								? getHexaColorFromIntentionText(key)
								: colorsContactReached[index]
						}
						shape={<CustomBar currentIndex={index} />}
					/>
				))}
			</BarChart>
		</ResponsiveContainer>
	);
};

export default StackedVerticalBarChart;
