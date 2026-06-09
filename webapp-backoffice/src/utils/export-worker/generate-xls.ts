import ExcelJS from '@mui/x-internal-exceljs-fork';
import type { Writable } from 'stream';
import type { ReviewRow, TemplateColumn } from './generate-csv';

function formatReviewContent(content: string): string {
	if (content.includes(' / ')) {
		return '- ' + content.replace(/ ?\/ ?([a-zA-ZÀ-ÿ])/g, '\n- $1');
	}
	return content;
}

function estimateLineCount(cellText: string, wrapLength = 30): number {
	const lines = cellText.split('\n');
	return lines.reduce(
		(sum, line) => sum + Math.floor(line.length / wrapLength) + 1,
		0
	);
}

const COL_REVIEW_DATE = 1;
const FIXED_COLS = 4;
const DEFAULT_COL_WIDTH = 30;
const MAX_COL_WIDTH = 80;

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

function setupSheet(
	worksheet: ExcelJS.Worksheet,
	columns: TemplateColumn[]
): void {
	const headers = [
		"Date de l'avis",
		'Nom du formulaire',
		"Lien d'intégration",
		'Identifiant Avis',
		...columns.map(c => c.label)
	];

	worksheet.columns = headers.map(h => ({
		header: h,
		width: Math.min(MAX_COL_WIDTH, Math.max(DEFAULT_COL_WIDTH, h.length + 2))
	}));

	worksheet.getColumn(COL_REVIEW_DATE).numFmt = 'yyyy-mm-dd hh:mm:ss';

	const headerRow = worksheet.getRow(1);
	headerRow.eachCell(cell => {
		cell.font = HEADER_FONT;
		cell.fill = HEADER_FILL;
		cell.border = THIN_BORDER;
	});
	headerRow.commit();
}

function writeReviewRow(
	worksheet: ExcelJS.Worksheet,
	review: ReviewRow,
	columns: TemplateColumn[]
): void {
	const rowValues: (string | number | Date | null)[] = [
		review.review_created_at,
		review.form_name,
		review.button_name,
		review.review_id,
		...columns.map(col => formatReviewContent(review.answers[col.code] ?? ''))
	];

	const dataRow = worksheet.addRow(rowValues);

	let maxLines = 1;
	for (let colNumber = 1; colNumber <= rowValues.length; colNumber++) {
		const cell = dataRow.getCell(colNumber);
		cell.border = THIN_BORDER;
		cell.alignment = WRAP_ALIGNMENT;

		const value = rowValues[colNumber - 1];
		if (value == null || colNumber <= FIXED_COLS) continue;

		const lines = estimateLineCount(String(value), 50);
		if (lines > maxLines) maxLines = lines;
	}

	dataRow.height = Math.max(15, 15 * maxLines);
	dataRow.commit();
}

// Excel's hard limit is 1,048,576 rows per worksheet. Stay slightly below to be safe
// and reserve room for the header row.
const MAX_ROWS_PER_SHEET = 1_000_000;

/**
 * Streams an .xlsx workbook to the writable stream, with one sheet per year.
 * Reviews must be yielded chronologically (oldest first) — sheets are created
 * lazily as new years are encountered. Memory stays bounded: rows are committed
 * and freed as they're written.
 *
 * If a single year exceeds MAX_ROWS_PER_SHEET, it's split across multiple
 * sheets named `YYYY`, `YYYY-part2`, `YYYY-part3`, …
 */
export async function generateXlsStream(
	reviews: AsyncIterable<ReviewRow>,
	columns: TemplateColumn[],
	out: Writable
): Promise<void> {
	const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
		stream: out,
		useStyles: true,
		useSharedStrings: true
	});

	let currentYear: number | null = null;
	let currentSheet: ExcelJS.Worksheet | null = null;
	let currentSheetRowCount = 0;
	let currentYearPart = 1;

	for await (const review of reviews) {
		const year = review.review_created_at.getFullYear();
		const yearChanged = year !== currentYear;
		const sheetFull = currentSheetRowCount >= MAX_ROWS_PER_SHEET;

		if (yearChanged || sheetFull) {
			if (currentSheet) currentSheet.commit();

			if (yearChanged) {
				currentYear = year;
				currentYearPart = 1;
			} else {
				currentYearPart++;
			}

			const sheetName =
				currentYearPart === 1
					? String(currentYear)
					: `${currentYear}-part${currentYearPart}`;

			currentSheet = workbook.addWorksheet(sheetName);
			setupSheet(currentSheet, columns);
			currentSheetRowCount = 0;
		}

		writeReviewRow(currentSheet!, review, columns);
		currentSheetRowCount++;
	}

	if (currentSheet) currentSheet.commit();
	await workbook.commit();
}
