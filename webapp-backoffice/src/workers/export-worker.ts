import { Worker, type Job } from 'bullmq';
import JSZip from 'jszip';
import redis from '@/src/lib/redis';
import prisma from '@/src/utils/db';
import type { ExportJobData } from '@/src/lib/queue';
import { generateCsvBuffer, type ReviewRow, type TemplateColumn } from '@/src/utils/export-worker/generate-csv';
import { generateXlsBuffer } from '@/src/utils/export-worker/generate-xls';
import { uploadToS3, generateDownloadLink } from '@/src/utils/export-worker/upload-s3';
import { sendExportReadyEmail, sendExportFailedEmail } from '@/src/utils/export-worker/send-email';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const PAGE_SIZE = parseInt(process.env.EXPORT_PAGE_SIZE ?? '500', 10);
const MAX_LINES_SWITCH = parseInt(process.env.EXPORT_MAX_LINES_SWITCH ?? '10000', 10);
const CONCURRENCY_LIMIT = parseInt(process.env.EXPORT_CONCURRENCY_LIMIT ?? '2', 10);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type FilterParams = {
	startDate?: string;
	endDate?: string;
	search?: string;
	filters?: RawFilters;
};

type RawFilters = {
	needVerbatim?: boolean;
	needOtherDifficulties?: boolean;
	needOtherHelp?: boolean;
	buttonId?: string[];
	help?: string[];
	// new format
	fields?: { field_code: string; values: string[] }[];
	// old format
	satisfaction?: string[];
	comprehension?: string[];
};

type OldFilters = {
	needVerbatim?: boolean;
	needOtherDifficulties?: boolean;
	needOtherHelp?: boolean;
	buttonId?: string[];
	help?: string[];
	satisfaction?: string[];
	comprehension?: string[];
};

// ---------------------------------------------------------------------------
// Filter helpers
// ---------------------------------------------------------------------------
const LABEL_TO_INTENTION: Record<string, string> = {
	'Très bien': 'good',
	Moyen: 'medium',
	Mauvais: 'bad'
};

function translateNewFiltersToOld(raw: RawFilters): OldFilters {
	const old: OldFilters = {
		needVerbatim: raw.needVerbatim ?? false,
		needOtherDifficulties: raw.needOtherDifficulties ?? false,
		needOtherHelp: raw.needOtherHelp ?? false,
		buttonId: raw.buttonId ?? [],
		help: raw.help ?? []
	};

	if (raw.fields) {
		for (const field of raw.fields) {
			if (field.field_code === 'satisfaction') {
				old.satisfaction = field.values.map(
					v => LABEL_TO_INTENTION[v] ?? v
				);
			} else {
				(old as Record<string, unknown>)[field.field_code] = field.values;
			}
		}
	}

	return old;
}

function buildFiltersWhere(filters: OldFilters, searchTerm: string): string {
	const parts: string[] = [];

	if (filters.satisfaction?.length) {
		const placeholders = filters.satisfaction
			.map(v => `'${v}'`)
			.join(', ');
		parts.push(
			`EXISTS (SELECT 1 FROM public."Answer" a WHERE a.review_id = r.id AND a.field_code = 'satisfaction' AND a.intention = ANY(ARRAY[${placeholders}]::"AnswerIntention"[]) AND a.created_at BETWEEN r.created_at - interval '1 day' AND r.created_at + interval '1 day')`
		);
	}

	if (filters.comprehension?.length) {
		const placeholders = filters.comprehension
			.map(v => `'${v.replace(/'/g, "''")}'`)
			.join(', ');
		parts.push(
			`EXISTS (SELECT 1 FROM public."Answer" a WHERE a.review_id = r.id AND a.field_code = 'comprehension' AND a.answer_text = ANY(ARRAY[${placeholders}]::text[]) AND a.created_at BETWEEN r.created_at - interval '1 day' AND r.created_at + interval '1 day')`
		);
	}

	if (filters.needVerbatim) {
		parts.push(
			`EXISTS (SELECT 1 FROM public."Answer" a WHERE a.review_id = r.id AND a.field_code = 'verbatim' AND a.created_at BETWEEN r.created_at - interval '1 day' AND r.created_at + interval '1 day')`
		);
	}

	if (searchTerm) {
		const escaped = searchTerm.replace(/'/g, "''");
		parts.push(
			`EXISTS (SELECT 1 FROM public."Answer" a WHERE a.review_id = r.id AND a.field_code = 'verbatim' AND a.answer_text ILIKE '%${escaped}%' AND a.created_at BETWEEN r.created_at - interval '1 day' AND r.created_at + interval '1 day')`
		);
	}

	return parts.join(' AND ');
}

// ---------------------------------------------------------------------------
// Date utilities
// ---------------------------------------------------------------------------
function getMonthRanges(
	startDate: Date,
	endDate: Date
): Array<[Date, Date]> {
	const ranges: Array<[Date, Date]> = [];
	let current = new Date(startDate);

	while (current <= endDate) {
		const monthStart =
			current === startDate && startDate.getDate() === 1
				? new Date(current.getTime() - 2 * 60 * 60 * 1000) // -2h for timezone fix
				: new Date(current.getFullYear(), current.getMonth(), 1, 0, 0, 0, 0);

		const lastDay = new Date(
			current.getFullYear(),
			current.getMonth() + 1,
			0
		).getDate();
		let monthEnd = new Date(
			current.getFullYear(),
			current.getMonth(),
			lastDay,
			23,
			59,
			59,
			999
		);
		if (monthEnd > endDate) monthEnd = endDate;

		ranges.push([monthStart, monthEnd]);
		current = new Date(monthEnd.getTime() + 24 * 60 * 60 * 1000);
	}

	return ranges;
}

function sanitizeFilename(name: string): string {
	return name.replace(/[^\w-]/g, '_');
}

function formatDateForFilename(date: Date): string {
	return date
		.toISOString()
		.replace('T', '_')
		.replace(/:/g, '-')
		.substring(0, 19);
}

// ---------------------------------------------------------------------------
// Dynamic column loader — derives ordered columns from the form template
// ---------------------------------------------------------------------------

// Input field types that produce Answer rows (excludes decorative blocks)
const INPUT_BLOCK_TYPES = new Set([
	'input_text',
	'input_text_area',
	'input_email',
	'mark_input',
	'smiley_input',
	'select',
	'radio',
	'checkbox'
]);

/**
 * Load ordered columns from a specific form's template.
 * Steps and blocks are ordered by their `position` field so the export
 * columns always match the visual order of the form.
 */
async function loadTemplateColumns(formId: number): Promise<TemplateColumn[]> {
	const form = await prisma.form.findUnique({
		where: { id: formId },
		include: {
			form_template: {
				include: {
					form_template_steps: {
						orderBy: { position: 'asc' },
						include: {
							form_template_blocks: {
								orderBy: { position: 'asc' }
							}
						}
					}
				}
			}
		}
	});

	if (!form) return [];

	const columns: TemplateColumn[] = [];
	for (const step of form.form_template.form_template_steps) {
		for (const block of step.form_template_blocks) {
			if (block.field_code && INPUT_BLOCK_TYPES.has(block.type_bloc)) {
				columns.push({
					code: block.field_code,
					label: block.label ?? block.field_code
				});
			}
		}
	}
	return columns;
}

// ---------------------------------------------------------------------------
// Core processor
// ---------------------------------------------------------------------------
async function processExportJob(
	job: Job<ExportJobData>
): Promise<void> {
	const { exportId } = job.data;

	// ------------------------------------------------------------------
	// 1. Load export record + related user & product
	// ------------------------------------------------------------------
	const exportRecord = await prisma.export.findUniqueOrThrow({
		where: { id: exportId },
		include: {
			user: { select: { email: true } },
			product: { select: { title: true } }
		}
	});

	const userEmail = exportRecord.user?.email ?? '';
	const productName = exportRecord.product.title;
	const exportFormat = exportRecord.type; // 'csv' | 'xls'

	// ------------------------------------------------------------------
	// 2. Mark as processing
	// ------------------------------------------------------------------
	await prisma.export.update({
		where: { id: exportId },
		data: { status: 'processing', startDate: new Date(), progress: 0 }
	});

	// ------------------------------------------------------------------
	// 3. Parse filter params
	// ------------------------------------------------------------------
	let filterParams: FilterParams = {};
	let filtersWhere = '';
	let searchTerm = '';

	if (exportRecord.params) {
		try {
			filterParams = JSON.parse(exportRecord.params) as FilterParams;
			searchTerm = filterParams.search ?? '';

			const rawFilters = filterParams.filters ?? {};
			const oldFilters =
				'fields' in rawFilters
					? translateNewFiltersToOld(rawFilters as RawFilters)
					: (rawFilters as OldFilters);

			filtersWhere = buildFiltersWhere(oldFilters, searchTerm);
		} catch {
			console.error(
				`[export-worker] Failed to parse params for export ${exportId}, proceeding without filters`
			);
		}
	}

	// ------------------------------------------------------------------
	// 4. Resolve date range
	// ------------------------------------------------------------------
	let startDate = filterParams.startDate
		? new Date(filterParams.startDate)
		: new Date('2018-01-01');

	if (startDate.getDate() === 1) {
		startDate = new Date(startDate.getTime() - 2 * 60 * 60 * 1000);
	}

	const endDateRaw = filterParams.endDate
		? new Date(filterParams.endDate)
		: new Date();
	const endDate = new Date(
		endDateRaw.getFullYear(),
		endDateRaw.getMonth(),
		endDateRaw.getDate(),
		23,
		59,
		59,
		999
	);

	// ------------------------------------------------------------------
	// 5. Count total reviews
	// ------------------------------------------------------------------
	const countResult = await prisma.$queryRawUnsafe<[{ count: bigint }]>(
		`SELECT COUNT(*) as count
		 FROM public."Review" r
		 WHERE r.product_id = ${exportRecord.product_id}
		   AND r.created_at BETWEEN '${startDate.toISOString()}' AND '${endDate.toISOString()}'
		   ${filtersWhere ? `AND ${filtersWhere}` : ''}`
	);
	const totalReviews = Number(countResult[0]?.count ?? 0);
	console.log(
		`[export-worker] Export ${exportId}: ${totalReviews} reviews, format=${exportFormat}`
	);

	// ------------------------------------------------------------------
	// 6. Load template columns
	// When the export is tied to a specific form, derive the ordered
	// column list from its template (steps × blocks, ordered by position).
	// Otherwise, accumulate columns dynamically from the answers seen.
	// ------------------------------------------------------------------
	let templateColumns: TemplateColumn[] | null = null;
	if (exportRecord.form_id) {
		templateColumns = await loadTemplateColumns(exportRecord.form_id);
	}

	// Fallback accumulator: field_code → label (first label seen wins)
	const dynamicColumnMap = new Map<string, string>();

	// ------------------------------------------------------------------
	// 7. Paginated fetch by month
	// ------------------------------------------------------------------
	const allReviews: ReviewRow[] = [];
	const allReviewsByYear: Map<number, ReviewRow[]> = new Map();
	const monthRanges = getMonthRanges(startDate, endDate);
	let retrievedReviews = 0;

	for (const [monthStart, monthEnd] of monthRanges) {
		let offset = 0;

		while (true) {
			const reviewRows = await prisma.$queryRawUnsafe<
				Array<{
					review_id: bigint;
					form_id: number | null;
					product_id: number;
					button_id: string | null;
					xwiki_id: string | null;
					review_created_at: Date;
				}>
			>(
				`SELECT
					r.id AS review_id,
					r.form_id,
					r.product_id,
					r.button_id,
					r.xwiki_id,
					r.created_at AS review_created_at
				 FROM public."Review" r
				 WHERE r.product_id = ${exportRecord.product_id}
				   AND r.created_at BETWEEN '${monthStart.toISOString()}' AND '${monthEnd.toISOString()}'
				   ${filtersWhere ? `AND ${filtersWhere}` : ''}
				 ORDER BY r.created_at DESC
				 LIMIT ${PAGE_SIZE} OFFSET ${offset}`
			);

			if (reviewRows.length === 0) break;

			const reviewIds = reviewRows.map(r => Number(r.review_id));

			// Fetch all answers for this batch in one query
			const answerRows = await prisma.$queryRawUnsafe<
				Array<{
					review_id: bigint;
					answer_id: bigint;
					parent_answer_id: bigint | null;
					field_code: string | null;
					field_label: string | null;
					answer_text: string | null;
					review_created_at: Date;
				}>
			>(
				`SELECT
					a.review_id,
					a.id AS answer_id,
					a.parent_answer_id,
					a.field_code,
					a.field_label,
					a.answer_text,
					r.created_at AS review_created_at
				 FROM public."Answer" a
				 JOIN public."Review" r ON r.id = a.review_id
				 WHERE a.review_id = ANY(ARRAY[${reviewIds.join(',')}]::bigint[])
				   AND a.created_at BETWEEN r.created_at - interval '1 day' AND r.created_at + interval '1 day'`
			);

			// Group answers by review
			const answersByReviewId = new Map<
				number,
				typeof answerRows
			>();
			for (const answer of answerRows) {
				const rid = Number(answer.review_id);
				if (!answersByReviewId.has(rid)) answersByReviewId.set(rid, []);
				answersByReviewId.get(rid)!.push(answer);
			}

			for (const row of reviewRows) {
				const rid = Number(row.review_id);
				const answers = answersByReviewId.get(rid) ?? [];

				// Assemble answer map keyed by field_code;
				// parent option text is prepended to child values
				const answerAccumulator = new Map<string, string[]>();
				for (const answer of answers) {
					const code = answer.field_code ?? answer.field_label ?? '';
					let text = answer.answer_text ?? '';

					if (answer.parent_answer_id !== null) {
						const parent = answers.find(
							a => Number(a.answer_id) === Number(answer.parent_answer_id)
						);
						if (parent) {
							text = `${parent.answer_text ?? ''} : ${text}`;
						}
					}

					if (!answerAccumulator.has(code))
						answerAccumulator.set(code, []);
					answerAccumulator.get(code)!.push(text);

					// Track field_code → label for the dynamic fallback
					if (!templateColumns && code && !dynamicColumnMap.has(code)) {
						dynamicColumnMap.set(code, answer.field_label ?? code);
					}
				}

				const answersMap: Record<string, string> = {};
				answerAccumulator.forEach((values, code) => {
					answersMap[code] = values.join(' / ');
				});

				// +2h timezone adjustment (mirrors Python)
				const createdAt = new Date(
					row.review_created_at.getTime() + 2 * 60 * 60 * 1000
				);
				const reviewRow: ReviewRow = {
					review_id: Number(row.review_id).toString(16).slice(-7),
					review_created_at: createdAt
						.toISOString()
						.replace('T', ' ')
						.substring(0, 19),
					answers: answersMap
				};

				allReviews.push(reviewRow);
				const year = row.review_created_at.getFullYear();
				if (!allReviewsByYear.has(year)) allReviewsByYear.set(year, []);
				allReviewsByYear.get(year)!.push(reviewRow);
			}

			retrievedReviews += reviewRows.length;
			offset += PAGE_SIZE;

			// Update progress (capped at 95% during fetch phase)
			if (totalReviews > 0) {
				const percent = Math.min(
					95,
					Math.floor((retrievedReviews * 95) / totalReviews)
				);
				await job.updateProgress(percent);
				await prisma.export.update({
					where: { id: exportId },
					data: { progress: percent }
				});
			}
		}
	}

	// Resolve final column list:
	// - template-driven when form_id was set (ordered by step/block position)
	// - dynamic (insertion order) otherwise
	const columns: TemplateColumn[] =
		templateColumns ??
		Array.from(dynamicColumnMap.entries()).map(([code, label]) => ({ code, label }));

	const switchToZip = totalReviews > MAX_LINES_SWITCH;
	const currentDate = formatDateForFilename(new Date());
	const safeName = sanitizeFilename(productName);
	const ext = exportFormat === 'csv' ? 'csv' : 'xlsx';

	// ------------------------------------------------------------------
	// 7. Mark file generation start (95%)
	// ------------------------------------------------------------------
	await prisma.export.update({
		where: { id: exportId },
		data: { progress: 95 }
	});

	// ------------------------------------------------------------------
	// 8. Generate file buffer
	// ------------------------------------------------------------------
	let fileBuffer: Buffer;
	let fileName: string;

	if (!switchToZip) {
		// Single file
		if (exportFormat === 'csv') {
			fileBuffer = generateCsvBuffer(allReviews, columns);
		} else {
			fileBuffer = await generateXlsBuffer(allReviews, columns, productName);
		}
		fileName = `Avis_${safeName}_${currentDate}.${ext}`;
	} else {
		// Multi-year zip
		const zip = new JSZip();
		for (const [year, yearReviews] of Array.from(allReviewsByYear.entries())) {
			let yearBuffer: Buffer;
			if (exportFormat === 'csv') {
				yearBuffer = generateCsvBuffer(yearReviews, columns);
				zip.file(`Avis_${year}.csv`, new Uint8Array(yearBuffer.buffer, yearBuffer.byteOffset, yearBuffer.byteLength));
			} else {
				yearBuffer = await generateXlsBuffer(
					yearReviews,
					columns,
					productName
				);
				zip.file(`Avis_${year}.xlsx`, new Uint8Array(yearBuffer.buffer, yearBuffer.byteOffset, yearBuffer.byteLength));
			}
		}
		fileBuffer = await zip.generateAsync({
			type: 'nodebuffer',
			compression: 'DEFLATE'
		});
		fileName = `Avis_${safeName}_${currentDate}.zip`;
	}

	// ------------------------------------------------------------------
	// 9. Upload to S3 (98%)
	// ------------------------------------------------------------------
	await prisma.export.update({
		where: { id: exportId },
		data: { progress: 98 }
	});

	await uploadToS3(fileBuffer, fileName);

	// ------------------------------------------------------------------
	// 10. Generate pre-signed URL (99%)
	// ------------------------------------------------------------------
	await prisma.export.update({
		where: { id: exportId },
		data: { progress: 99 }
	});

	const downloadLink = await generateDownloadLink(fileName);

	// ------------------------------------------------------------------
	// 11. Finalize record
	// ------------------------------------------------------------------
	await prisma.export.update({
		where: { id: exportId },
		data: {
			status: 'done',
			endDate: new Date(),
			link: downloadLink,
			progress: 100
		}
	});

	// ------------------------------------------------------------------
	// 12. Send notification email (non-blocking)
	// ------------------------------------------------------------------
	try {
		await sendExportReadyEmail(
			userEmail,
			productName,
			downloadLink,
			switchToZip
		);
	} catch (emailErr) {
		console.error(
			`[export-worker] Failed to send ready email for export ${exportId}:`,
			emailErr
		);
	}

	console.log(`[export-worker] Export ${exportId} completed: ${fileName}`);
}

// ---------------------------------------------------------------------------
// Worker singleton (hot-reload safe)
// ---------------------------------------------------------------------------
declare const globalThis: {
	_exportWorker?: Worker<ExportJobData>;
} & typeof global;

export function startExportWorker(): void {
	if (globalThis._exportWorker) return;

	const worker = new Worker<ExportJobData>(
		'exports',
		processExportJob,
		{
			connection: redis,
			concurrency: CONCURRENCY_LIMIT,
			lockDuration: 3_600_000, // 1 hour — matches Python stale-job threshold
			stalledInterval: 30_000
		}
	);

	worker.on('completed', job => {
		console.log(`[export-worker] Job ${job.id} completed`);
	});

	worker.on('failed', async (job, err) => {
		console.error(`[export-worker] Job ${job?.id} failed:`, err.message);

		// On final failure (no retries left): reset to idle + notify user
		if (job && (job.attemptsMade ?? 0) >= (job.opts.attempts ?? 1)) {
			const { exportId } = job.data;
			try {
				const exportRecord = await prisma.export.findUnique({
					where: { id: exportId },
					include: {
						user: { select: { email: true } },
						product: { select: { title: true } }
					}
				});

				await prisma.export.update({
					where: { id: exportId },
					data: { status: 'idle', startDate: null, progress: 0 }
				});

				if (exportRecord?.user?.email) {
					await sendExportFailedEmail(
						exportRecord.user.email,
						exportRecord.product.title
					).catch(e =>
						console.error(
							`[export-worker] Failed to send failure email:`,
							e
						)
					);
				}
			} catch (resetErr) {
				console.error(
					`[export-worker] Failed to reset export ${exportId}:`,
					resetErr
				);
			}
		}
	});

	worker.on('error', err => {
		console.error('[export-worker] Worker error:', err);
	});

	globalThis._exportWorker = worker;
	console.log(
		`[export-worker] Started (concurrency=${CONCURRENCY_LIMIT}, maxLinesSwitch=${MAX_LINES_SWITCH})`
	);
}
