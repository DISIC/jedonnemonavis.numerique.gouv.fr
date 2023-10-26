import { AnswerScore } from '@prisma/client';

interface ChartBaseProps {
	width?: number;
	height?: number;
}

export interface ChartPieProps extends ChartBaseProps {
	data: PieData[];
	kind: 'pie';
	innerRadius?: number;
	outerRadius?: number;
}

interface PieData {
	name: AnswerScore;
	value: number;
}

export interface ChartLineBarProps extends ChartBaseProps {
	data: LineBarData[];
	kind: 'line' | 'bar';
}

interface LineBarData {
	x: string;
	y: number;
}
