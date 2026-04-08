import { Worker, type Job } from 'bullmq';
import JSZip from 'jszip';
import { $Enums, type Prisma } from '@prisma/client';
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
const LABEL_TO_INTENTION: Record<string, $Enums.AnswerIntention> = {
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

/**
 * Builds a Prisma ReviewWhereInput from the parsed filter object.
 * Each answer condition is stacked with AND so multiple EXISTS sub-queries
 * are generated — matching the previous raw SQL behaviour exactly.
 */
function buildReviewWhere(
	filters: OldFilters,
	searchTerm: string
): Prisma.ReviewWhereInput {
	const andConditions: Prisma.ReviewWhereInput[] = [];

	if (filters.satisfaction?.length) {
		const intentions = filters.satisfaction.filter(
			(v): v is $Enums.AnswerIntention =>
				Object.values($Enums.AnswerIntention).includes(v as $Enums.AnswerIntention)
		);
		if (intentions.length) {
			andConditions.push({
				answers: {
					some: {
						field_code: 'satisfaction',
						intention: { in: intentions }
					}
				}
			});
		}
	}

	if (filters.comprehension?.length) {
		andConditions.push({
			answers: {
				some: {
					field_code: 'comprehension',
					answer_text: { in: filters.comprehension }
				}
			}
		});
	}

	if (filters.needVerbatim) {
		andConditions.push({
			answers: { some: { field_code: 'verbatim' } }
		});
	}

	if (searchTerm) {
		andConditions.push({
			answers: {
				some: {
					field_code: 'verbatim',
					answer_text: { contains: searchTerm, mode: 'insensitive' }
				}
			}
		});
	}

	// TODO: handle needOtherDifficulties and needOtherHelp
	// once the corresponding field_codes in the Answer table are known.

	return andConditions.length ? { AND: andConditions } : {};
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
		const monthStart = new Date(
			current.getFullYear(),
			current.getMonth(),
			1,
			0, 0, 0, 0
		);

		const lastDay = new Date(
			current.getFullYear(),
			current.getMonth() + 1,
			0
		).getDate();
		let monthEnd = new Date(
			current.getFullYear(),
			current.getMonth(),
			lastDay,
			23, 59, 59, 999
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
const INPUT_BLOCK_TYPES = new Set<$Enums.Typebloc>([
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
	let reviewWhere: Prisma.ReviewWhereInput = {};
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

			reviewWhere = buildReviewWhere(oldFilters, searchTerm);
		} catch {
			console.error(
				`[export-worker] Failed to parse params for export ${exportId}, proceeding without filters`
			);
		}
	}

	// ------------------------------------------------------------------
	// 4. Resolve date range
	// ------------------------------------------------------------------
	const startDate = filterParams.startDate
		? new Date(filterParams.startDate)
		: new Date('2018-01-01T00:00:00.000Z');

	const endDateRaw = filterParams.endDate
		? new Date(filterParams.endDate)
		: new Date();
	const endDate = new Date(
		endDateRaw.getFullYear(),
		endDateRaw.getMonth(),
		endDateRaw.getDate(),
		23, 59, 59, 999
	);

	// ------------------------------------------------------------------
	// 5. Count total reviews
	// ------------------------------------------------------------------
	const totalReviews = await prisma.review.count({
		where: {
			product_id: exportRecord.product_id,
			created_at: { gte: startDate, lte: endDate },
			...reviewWhere
		}
	});
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

	// Fallback accumulator used only when no template is available
	const isDynamic = templateColumns === null;
	const dynamicColumnMap = new Map<string, string>();

	// ------------------------------------------------------------------
	// 7. Paginated fetch by month
	// ------------------------------------------------------------------
	const allReviews: ReviewRow[] = [];
	const allReviewsByYear: Map<number, ReviewRow[]> = new Map();
	const monthRanges = getMonthRanges(startDate, endDate);
	let retrievedReviews = 0;
	let lastProgressPercent = -1;

	for (const [monthStart, monthEnd] of monthRanges) {
		let offset = 0;

		while (true) {
			// 7a. Fetch a page of review IDs + timestamps
			const reviews = await prisma.review.findMany({
				where: {
					product_id: exportRecord.product_id,
					created_at: { gte: monthStart, lte: monthEnd },
					...reviewWhere
				},
				orderBy: { created_at: 'desc' },
				skip: offset,
				take: PAGE_SIZE,
				select: { id: true, created_at: true }
			});

			if (reviews.length === 0) break;

			const reviewIds = reviews.map(r => r.id);

			// 7b. Fetch all answers for this batch in one query.
			// The review_created_at bound keeps the composite index active:
			// @@index([review_id, review_created_at]) on Answer.
			const answerRows = await prisma.answer.findMany({
				where: {
					review_id: { in: reviewIds },
					review_created_at: { gte: monthStart, lte: monthEnd }
				},
				orderBy: { id: 'asc' },
				select: {
					review_id: true,
					id: true,
					parent_answer_id: true,
					field_code: true,
					field_label: true,
					answer_text: true
				}
			});

			// Group answers by review
			const answersByReviewId = new Map<number, typeof answerRows>();
			for (const answer of answerRows) {
				if (!answersByReviewId.has(answer.review_id))
					answersByReviewId.set(answer.review_id, []);
				answersByReviewId.get(answer.review_id)!.push(answer);
			}

			for (const review of reviews) {
				const answers = answersByReviewId.get(review.id) ?? [];

				// O(1) parent lookup
				const answerById = new Map<number, typeof answers[0]>();
				for (const a of answers) answerById.set(a.id, a);

				// Assemble answer map keyed by field_code;
				// parent option text is prepended to child values
				const answerAccumulator = new Map<string, string[]>();
				for (const answer of answers) {
					const code = answer.field_code || answer.field_label;
					let text = answer.answer_text;

					if (answer.parent_answer_id !== null) {
						const parent = answerById.get(answer.parent_answer_id);
						if (parent) {
							text = `${parent.answer_text} : ${text}`;
						}
					}

					if (!answerAccumulator.has(code))
						answerAccumulator.set(code, []);
					answerAccumulator.get(code)!.push(text);

					if (isDynamic && code && !dynamicColumnMap.has(code)) {
						dynamicColumnMap.set(code, answer.field_label);
					}
				}

				const answersMap: Record<string, string> = {};
				answerAccumulator.forEach((values, code) => {
					answersMap[code] = values.join(' / ');
				});

				const reviewRow: ReviewRow = {
					review_id: review.id.toString(16).slice(-7),
					review_created_at: review.created_at,
					answers: answersMap
				};

				allReviews.push(reviewRow);
				const year = review.created_at.getFullYear();
				if (!allReviewsByYear.has(year)) allReviewsByYear.set(year, []);
				allReviewsByYear.get(year)!.push(reviewRow);
			}

			retrievedReviews += reviews.length;
			offset += PAGE_SIZE;

			// Update progress (capped at 95% during fetch phase)
			if (totalReviews > 0) {
				const percent = Math.min(
					95,
					Math.floor((retrievedReviews * 95) / totalReviews)
				);
				if (percent !== lastProgressPercent) {
					lastProgressPercent = percent;
					await Promise.all([
						job.updateProgress(percent),
						prisma.export.update({ where: { id: exportId }, data: { progress: percent } })
					]);
				}
			}
		}
	}

	const columns: TemplateColumn[] = templateColumns ??
		Array.from(dynamicColumnMap, ([code, label]) => ({ code, label }));

	const switchToZip = totalReviews > MAX_LINES_SWITCH;
	const currentDate = formatDateForFilename(new Date());
	const safeName = sanitizeFilename(productName);

	// ------------------------------------------------------------------
	// Mark file generation start (95%)
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
		fileName = `Avis_${safeName}_${currentDate}.${exportFormat === 'csv' ? 'csv' : 'xlsx'}`;
	} else {
		// Multi-year zip
		const zip = new JSZip();
		for (const [year, yearReviews] of Array.from(allReviewsByYear)) {
			let yearBuffer: Buffer;
			if (exportFormat === 'csv') {
				yearBuffer = generateCsvBuffer(yearReviews, columns);
				zip.file(`Avis_${year}.csv`, new Uint8Array(yearBuffer.buffer, yearBuffer.byteOffset, yearBuffer.byteLength));
			} else {
				yearBuffer = await generateXlsBuffer(yearReviews, columns, productName);
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
