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

export async function generateXlsBuffer(
	reviews: ReviewRow[],
	columns: TemplateColumn[],
	_productName: string
): Promise<Buffer> {
	const workbook = new ExcelJS.Workbook();
	const worksheet = workbook.addWorksheet('Avis');

	const headers = [
		'Review ID',
		'Review Created At',
		...columns.map(c => c.label)
	];

	// Track max content width per column in a single pass (avoids O(cols×rows) re-scan)
	const colWidths = headers.map(h => h.length + 2);

	// Header row
	const headerRow = worksheet.addRow(headers);
	headerRow.eachCell(cell => {
		cell.font = { bold: true, size: 12 };
		cell.fill = {
			type: 'pattern',
			pattern: 'solid',
			fgColor: { argb: 'FFD4D3D3' }
		};
		cell.border = {
			top: { style: 'thin' },
			left: { style: 'thin' },
			bottom: { style: 'thin' },
			right: { style: 'thin' }
		};
	});

	// Data rows
	for (const review of reviews) {
		const rowValues: (string | number | Date | null)[] = [
			review.review_id,
			review.review_created_at,
			...columns.map(col => formatReviewContent(review.answers[col.code] ?? ''))
		];

		const dataRow = worksheet.addRow(rowValues);
		dataRow.getCell(COL_REVIEW_DATE).numFmt = 'dd/mm/yyyy hh:mm:ss';

		let maxLines = 1;
		dataRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
			cell.border = {
				top: { style: 'thin' },
				left: { style: 'thin' },
				bottom: { style: 'thin' },
				right: { style: 'thin' }
			};
			cell.alignment = { wrapText: true };

			const cellText = String(cell.value ?? '');
			const longestLine = Math.max(...cellText.split('\n').map(l => l.length));
			if (longestLine + 2 > colWidths[colNumber - 1]) {
				colWidths[colNumber - 1] = longestLine + 2;
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

	const arrayBuffer = await workbook.xlsx.writeBuffer();
	return Buffer.from(arrayBuffer);
}
