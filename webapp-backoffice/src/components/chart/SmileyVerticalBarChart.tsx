import { getHexaColorFromIntentionText } from '@/src/utils/tools';
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

const SmileyVerticalBarChart = ({
	data,
	dataKeys
}: {
	data: { name: string; [key: string]: number | string }[];
	dataKeys: string[];
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
						fill={getHexaColorFromIntentionText(key)}
						shape={<CustomBar currentIndex={index} />}
					/>
				))}
			</BarChart>
		</ResponsiveContainer>
	);
};

export default SmileyVerticalBarChart;
