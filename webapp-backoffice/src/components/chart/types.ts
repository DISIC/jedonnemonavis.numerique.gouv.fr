import { AnswerIntention } from '@prisma/client';

interface ChartBaseProps {
	width?: number;
	height?: number;
}

export interface ChartPieProps extends ChartBaseProps {
	data: ChartPieData[];
	kind: 'pie';
	innerRadius?: number;
	outerRadius?: number;
}

export interface ChartVerticalBarProps extends ChartBaseProps {
	data: ChartBarData[];
	kind: 'bar';
	innerRadius?: number;
	outerRadius?: number;
}

interface ChartPieData {
	name: AnswerIntention;
	value: number;
	answer_text: string;
}

interface ChartBarData {
	name: string;
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
