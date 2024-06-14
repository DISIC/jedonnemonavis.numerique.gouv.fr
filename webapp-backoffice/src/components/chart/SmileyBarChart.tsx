import { getHexaColorFromIntentionText } from '@/src/utils/tools';
import {
	Bar,
	BarChart,
	CartesianGrid,
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

const CustomYAxisTick = (props: any) => {
	const { x, y, payload } = props;

	if (payload.value === 12) return null;

	return (
		<g transform={`translate(${x},${y})`}>
			<text x={0} y={0} dy={4} textAnchor="end" fill="#666" fontSize="0.75rem">
				{payload.value}
			</text>
		</g>
	);
};

const CustomBar = (props: any) => {
	const { x, y, width, height, value, fieldName } = props;

	if (value === 0) return null;

	return (
		<g>
			<rect
				x={x}
				y={y}
				width={width}
				height={height}
				fill={getHexaColorFromIntentionText(fieldName)}
				ry={5}
				style={{ stroke: '#fff', strokeWidth: 2 }}
			/>
		</g>
	);
};

const SmileyBarChart = ({
	data
}: {
	data: { name: string; [key: string]: number | string }[];
	total: number;
}) => {
	const fieldNamesSet = new Set<string>();

	data.forEach(item => {
		Object.keys(item).forEach(key => {
			if (key !== 'name') {
				fieldNamesSet.add(key);
			}
		});
	});

	return (
		<ResponsiveContainer width="100%" height={335}>
			<BarChart data={data}>
				<CartesianGrid
					vertical={false}
					strokeDasharray="3 3"
					className="review-average-line"
				/>
				<XAxis
					axisLine={false}
					dataKey="name"
					fontSize="0.75rem"
					tickLine={false}
				/>
				<YAxis
					axisLine={false}
					domain={[0, 1]}
					ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
					tickFormatter={tick => 'test'}
					tick={<CustomYAxisTick />}
					tickLine={false}
					fontSize="0.75rem"
				/>
				<Tooltip cursor={false} />
				<Legend
					verticalAlign="top"
					align="left"
					height={60}
					content={renderLegend}
				/>
				{Array.from(fieldNamesSet).map((fieldName: string) => (
					<Bar
						dataKey={fieldName}
						fill={getHexaColorFromIntentionText(fieldName)}
						radius={5}
						stackId="a"
						barSize={25}
						shape={<CustomBar fieldName={fieldName} />}
						style={{ stroke: '#fff', strokeWidth: 2 }}
					/>
				))}
			</BarChart>
		</ResponsiveContainer>
	);
};

export default SmileyBarChart;
