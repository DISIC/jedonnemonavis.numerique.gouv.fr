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

const renderLegend = (props: any, sortOrder: { [key: string]: number }) => {
	const { payload } = props;

	return (
		<div
			style={{
				display: 'flex',
				gap: '25px'
			}}
		>
			{payload
				.sort((a: any, b: any) => sortOrder[a.value] - sortOrder[b.value])
				.map((entry: any, index: number) => (
					<div
						key={index}
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
								borderRadius: 5,
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
			<rect
				x={x}
				y={y + 5}
				width={width}
				height={height}
				fill={fill}
				ry={5}
				style={{ stroke: '#fff', strokeWidth: 2 }}
			/>
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
	const sortOrder: { [key: string]: number } =
		fieldCode === 'contact_reached'
			? {
					Non: 0,
					Oui: 1,
					'Pas de réponse': 2
				}
			: {
					'Très mauvaise': 0,
					Mauvaise: 1,
					'Ni bonne, ni mauvaise': 2,
					Bonne: 3,
					Excellente: 4,
					'Ne se prononce pas': 5
				};

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
					content={payload => renderLegend(payload, sortOrder)}
				/>
				{dataKeys
					.sort((a, b) => sortOrder[a] - sortOrder[b])
					.map((key, index) => (
						<Bar
							key={key}
							dataKey={key}
							radius={5}
							barSize={24}
							stackId="a"
							fill={
								fieldCode === 'contact_reached'
									? getHexaColorFromIntentionText(key)
									: colorsContactReached[sortOrder[key]]
							}
							shape={<CustomBar currentIndex={index} />}
						/>
					))}
			</BarChart>
		</ResponsiveContainer>
	);
};

export default StackedVerticalBarChart;
