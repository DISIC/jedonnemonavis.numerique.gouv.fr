import ExcelJS from '@mui/x-internal-exceljs-fork';
import type { ReviewRow, TemplateColumn } from './generate-csv';

function formatReviewContent(content: string): string {
	if (content.includes(' / ')) {
		return '- ' + content.replace(/ ?\/ ?([a-zA-ZÀ-ÿ])/g, '\n- $1');
	}
	return content;
}

function estimateLineCount(cellText: string, wrapLength = 30): number {
	const lines = cellText.split('\n');
	return lines.reduce((sum, line) => sum + Math.floor(line.length / wrapLength) + 1, 0);
}

const COL_REVIEW_DATE = 2;
const FIXED_COLS = 2;

const THIN_BORDER: Partial<ExcelJS.Borders> = {
	top: { style: 'thin' },
	left: { style: 'thin' },
	bottom: { style: 'thin' },
	right: { style: 'thin' }
};
const WRAP_ALIGNMENT: Partial<ExcelJS.Alignment> = { wrapText: true };
const HEADER_FILL: ExcelJS.Fill = {
	type: 'pattern',
	pattern: 'solid',
	fgColor: { argb: 'FFD4D3D3' }
};
const HEADER_FONT: Partial<ExcelJS.Font> = { bold: true, size: 12 };

function longestLineLength(text: string): number {
	let max = 0;
	for (const line of text.split('\n')) {
		if (line.length > max) max = line.length;
	}
	return max;
}

function fillWorksheet(
	worksheet: ExcelJS.Worksheet,
	reviews: ReviewRow[],
	columns: TemplateColumn[]
): void {
	const headers = [
		'Review ID',
		'Review Created At',
		...columns.map(c => c.label)
	];

	const colWidths = headers.map(h => h.length + 2);

	const headerRow = worksheet.addRow(headers);
	headerRow.eachCell(cell => {
		cell.font = HEADER_FONT;
		cell.fill = HEADER_FILL;
		cell.border = THIN_BORDER;
	});

	worksheet.getColumn(COL_REVIEW_DATE).numFmt = 'yyyy-mm-dd hh:mm:ss';

	for (const review of reviews) {
		const rowValues: (string | number | Date | null)[] = [
			review.review_id,
			review.review_created_at,
			...columns.map(col => formatReviewContent(review.answers[col.code] ?? ''))
		];

		const dataRow = worksheet.addRow(rowValues);

		let maxLines = 1;
		dataRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
			cell.border = THIN_BORDER;
			cell.alignment = WRAP_ALIGNMENT;

			if (cell.value == null) return;

			const cellText = String(cell.value);
			const longest = longestLineLength(cellText);
			if (longest + 2 > colWidths[colNumber - 1]) {
				colWidths[colNumber - 1] = longest + 2;
			}

			if (colNumber > FIXED_COLS) {
				const lines = estimateLineCount(cellText, 50);
				if (lines > maxLines) maxLines = lines;
			}
		});

		dataRow.height = Math.max(15, 15 * maxLines);
	}

	worksheet.columns.forEach((col, i) => {
		col.width = Math.min(colWidths[i], 80);
	});
}

/**
 * Generates a single .xlsx workbook with one sheet per year, sorted chronologically.
 * Each sheet is named after its year (e.g. "2024").
 */
export async function generateXlsBuffer(
	reviewsByYear: Map<number, ReviewRow[]>,
	columns: TemplateColumn[],
	_productName: string
): Promise<Buffer> {
	const workbook = new ExcelJS.Workbook();

	const sortedYears = Array.from(reviewsByYear.keys()).sort((a, b) => a - b);
	for (const year of sortedYears) {
		const worksheet = workbook.addWorksheet(String(year));
		fillWorksheet(worksheet, reviewsByYear.get(year)!, columns);
	}

	const arrayBuffer = await workbook.xlsx.writeBuffer();
	return Buffer.from(arrayBuffer);
}
