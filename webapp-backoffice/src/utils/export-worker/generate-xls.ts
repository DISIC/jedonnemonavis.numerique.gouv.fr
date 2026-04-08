import ExcelJS from '@mui/x-internal-exceljs-fork';
import type { ReviewRow } from './generate-csv';

// Columns that contain " / "-separated answer values need list formatting
function formatReviewContent(content: string): string {
	if (typeof content === 'string' && content.includes(' / ')) {
		return '- ' + content.replace(/ ?\/ ?([a-zA-ZÀ-ÿ])/g, '\n- $1');
	}
	return content;
}

function estimateLineCount(cellText: string, wrapLength = 30): number {
	const lines = cellText.split('\n');
	return lines.reduce((sum, line) => sum + Math.floor(line.length / wrapLength) + 1, 0);
}

export async function generateXlsBuffer(
	reviews: ReviewRow[],
	fieldLabels: string[],
	_productName: string
): Promise<Buffer> {
	const workbook = new ExcelJS.Workbook();
	const worksheet = workbook.addWorksheet('Avis');

	const columns = [
		'Review ID',
		'Review Created At',
		...fieldLabels
	];

	// Header row
	const headerRow = worksheet.addRow(columns);
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
			new Date(review.review_created_at),
			...fieldLabels.map(label => {
				const val = review.answers[label] ?? '';
				return formatReviewContent(val);
			})
		];

		const dataRow = worksheet.addRow(rowValues);

		// Format date cell
		const dateCell = dataRow.getCell(6);
		dateCell.numFmt = 'dd/mm/yyyy hh:mm:ss';

		// Apply border + wrap to all cells
		let maxLines = 1;
		dataRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
			cell.border = {
				top: { style: 'thin' },
				left: { style: 'thin' },
				bottom: { style: 'thin' },
				right: { style: 'thin' }
			};
			cell.alignment = { wrapText: true };

			if (colNumber > 6) {
				const lines = estimateLineCount(String(cell.value ?? ''), 50);
				if (lines > maxLines) maxLines = lines;
			}
		});

		dataRow.height = Math.max(15, 15 * maxLines);
	}

	// Auto column widths
	worksheet.columns.forEach((column, index) => {
		const header = columns[index] ?? '';
		let maxLength = header.length + 2;

		worksheet.eachRow((row, rowNumber) => {
			if (rowNumber === 1) return;
			const cell = row.getCell(index + 1);
			const cellText = String(cell.value ?? '');
			const longestLine = Math.max(...cellText.split('\n').map(l => l.length));
			if (longestLine + 2 > maxLength) maxLength = longestLine + 2;
		});

		column.width = Math.min(maxLength, 80);
	});

	const arrayBuffer = await workbook.xlsx.writeBuffer();
	return Buffer.from(arrayBuffer);
}
