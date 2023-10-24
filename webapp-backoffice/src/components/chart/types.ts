export type ChartProps =
	| {
			data: PieData[];
			kind: 'pie';
	  }
	| {
			data: LineBarData[];
			kind: 'line' | 'bar';
	  };

export interface PieData {
	name: string;
	value: number;
	color: string;
}

interface LineBarData {
	x: string;
	y: number;
}
