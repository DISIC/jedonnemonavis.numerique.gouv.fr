import { Worker, type Job } from 'bullmq';
import { $Enums, type Prisma } from '@prisma/client';
import redis from '@/src/lib/redis';
import prisma from '@/src/utils/db';
import type { ExportJobData } from '@/src/lib/queue';
import { generateCsvBuffer, type ReviewRow, type TemplateColumn } from '@/src/utils/export-worker/generate-csv';
import { generateXlsBuffer } from '@/src/utils/export-worker/generate-xls';
import { uploadToS3, generateDownloadLink } from '@/src/utils/export-worker/upload-s3';
import { sendExportReadyEmail, sendExportFailedEmail } from '@/src/utils/export-worker/send-email';

const PAGE_SIZE = parseInt(process.env.EXPORT_PAGE_SIZE ?? '500', 10);
const CONCURRENCY_LIMIT = parseInt(process.env.EXPORT_CONCURRENCY_LIMIT ?? '2', 10);

type FilterParams = {
	startDate?: string;
	endDate?: string;
	search?: string;
	filters?: RawFilters;
};

// `fields[]` is the current format; flat keys (satisfaction, comprehension) are the legacy format
type RawFilters = {
	needVerbatim?: boolean;
	needOtherDifficulties?: boolean;
	needOtherHelp?: boolean;
	buttonId?: string[];
	help?: string[];
	fields?: { field_code: string; values: string[] }[];
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

// Maps French UI labels to AnswerIntention enum values
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
				old.satisfaction = field.values.map(v => LABEL_TO_INTENTION[v] ?? v);
			} else {
				(old as Record<string, unknown>)[field.field_code] = field.values;
			}
		}
	}

	return old;
}

// Each condition becomes a separate EXISTS sub-query via Prisma's `some` — stacked with AND
function buildReviewWhere(filters: OldFilters, searchTerm: string): Prisma.ReviewWhereInput {
	const andConditions: Prisma.ReviewWhereInput[] = [];

	if (filters.satisfaction?.length) {
		const intentions = filters.satisfaction.filter(
			(v): v is $Enums.AnswerIntention =>
				Object.values($Enums.AnswerIntention).includes(v as $Enums.AnswerIntention)
		);
		if (intentions.length) {
			andConditions.push({ answers: { some: { field_code: 'satisfaction', intention: { in: intentions } } } });
		}
	}

	if (filters.comprehension?.length) {
		andConditions.push({ answers: { some: { field_code: 'comprehension', answer_text: { in: filters.comprehension } } } });
	}

	if (filters.needVerbatim) {
		andConditions.push({ answers: { some: { field_code: 'verbatim' } } });
	}

	if (searchTerm) {
		andConditions.push({ answers: { some: { field_code: 'verbatim', answer_text: { contains: searchTerm, mode: 'insensitive' } } } });
	}

	// TODO: handle needOtherDifficulties and needOtherHelp once their field_codes are confirmed

	return andConditions.length ? { AND: andConditions } : {};
}

function getMonthRanges(startDate: Date, endDate: Date): Array<[Date, Date]> {
	const ranges: Array<[Date, Date]> = [];
	let current = new Date(startDate);

	while (current <= endDate) {
		const monthStart = new Date(current.getFullYear(), current.getMonth(), 1, 0, 0, 0, 0);
		const lastDay = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate();
		let monthEnd = new Date(current.getFullYear(), current.getMonth(), lastDay, 23, 59, 59, 999);
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
	return date.toISOString().replace('T', '_').replace(/:/g, '-').substring(0, 19);
}

// Only block types that produce Answer rows; decorative blocks (paragraph, heading, divider) are excluded
const INPUT_BLOCK_TYPES = new Set<$Enums.Typebloc>([
	'input_text', 'input_text_area', 'input_email',
	'mark_input', 'smiley_input', 'select', 'radio', 'checkbox'
]);

async function loadTemplateColumns(formId: number): Promise<TemplateColumn[]> {
	const form = await prisma.form.findUnique({
		where: { id: formId },
		include: {
			form_template: {
				include: {
					form_template_steps: {
						orderBy: { position: 'asc' },
						include: { form_template_blocks: { orderBy: { position: 'asc' } } }
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
				columns.push({ code: block.field_code, label: block.label ?? block.field_code });
			}
		}
	}
	return columns;
}

async function processExportJob(job: Job<ExportJobData>): Promise<void> {
	const { exportId } = job.data;

	const exportRecord = await prisma.export.findUniqueOrThrow({
		where: { id: exportId },
		include: {
			user: { select: { email: true } },
			product: { select: { title: true } }
		}
	});

	const userEmail = exportRecord.user?.email ?? '';
	const productName = exportRecord.product.title;
	const exportFormat = exportRecord.type;

	await prisma.export.update({
		where: { id: exportId },
		data: { status: 'processing', startDate: new Date(), progress: 0 }
	});

	let filterParams: FilterParams = {};
	let reviewWhere: Prisma.ReviewWhereInput = {};

	if (exportRecord.params) {
		try {
			filterParams = JSON.parse(exportRecord.params) as FilterParams;
			const rawFilters = filterParams.filters ?? {};
			const oldFilters = 'fields' in rawFilters
				? translateNewFiltersToOld(rawFilters as RawFilters)
				: (rawFilters as OldFilters);
			reviewWhere = buildReviewWhere(oldFilters, filterParams.search ?? '');
		} catch {
			console.error(`[export-worker] Failed to parse params for export ${exportId}, proceeding without filters`);
		}
	}

	const startDate = filterParams.startDate
		? new Date(filterParams.startDate)
		: new Date('2018-01-01T00:00:00.000Z');

	const endDateRaw = filterParams.endDate ? new Date(filterParams.endDate) : new Date();
	const endDate = new Date(endDateRaw.getFullYear(), endDateRaw.getMonth(), endDateRaw.getDate(), 23, 59, 59, 999);

	const totalReviews = await prisma.review.count({
		where: { product_id: exportRecord.product_id, created_at: { gte: startDate, lte: endDate }, ...reviewWhere }
	});
	console.log(`[export-worker] Export ${exportId}: ${totalReviews} reviews, format=${exportFormat}`);

	// Use form template column order when available; fall back to accumulating codes from seen answers
	let templateColumns: TemplateColumn[] | null = null;
	if (exportRecord.form_id) {
		templateColumns = await loadTemplateColumns(exportRecord.form_id);
	}

	const isDynamic = templateColumns === null;
	const dynamicColumnMap = new Map<string, string>();
	const allReviews: ReviewRow[] = [];
	const allReviewsByYear: Map<number, ReviewRow[]> = new Map();
	const monthRanges = getMonthRanges(startDate, endDate);
	let retrievedReviews = 0;
	let lastProgressPercent = -1;

	for (const [monthStart, monthEnd] of monthRanges) {
		let offset = 0;

		while (true) {
			const reviews = await prisma.review.findMany({
				where: { product_id: exportRecord.product_id, created_at: { gte: monthStart, lte: monthEnd }, ...reviewWhere },
				orderBy: { created_at: 'desc' },
				skip: offset,
				take: PAGE_SIZE,
				select: { id: true, created_at: true }
			});

			if (reviews.length === 0) break;

			// review_created_at bound is required to hit the @@index([review_id, review_created_at]) composite index
			const answerRows = await prisma.answer.findMany({
				where: { review_id: { in: reviews.map(r => r.id) }, review_created_at: { gte: monthStart, lte: monthEnd } },
				orderBy: { id: 'asc' },
				select: { review_id: true, id: true, parent_answer_id: true, field_code: true, field_label: true, answer_text: true }
			});

			const answersByReviewId = new Map<number, typeof answerRows>();
			for (const answer of answerRows) {
				if (!answersByReviewId.has(answer.review_id)) answersByReviewId.set(answer.review_id, []);
				answersByReviewId.get(answer.review_id)!.push(answer);
			}

			for (const review of reviews) {
				const answers = answersByReviewId.get(review.id) ?? [];
				const answerById = new Map<number, typeof answers[0]>();
				for (const a of answers) answerById.set(a.id, a);

				// Prepend parent answer text to child values (e.g. "Option : Sub-option")
				const answerAccumulator = new Map<string, string[]>();
				for (const answer of answers) {
					const code = answer.field_code || answer.field_label;
					let text = answer.answer_text;

					if (answer.parent_answer_id !== null) {
						const parent = answerById.get(answer.parent_answer_id);
						if (parent) text = `${parent.answer_text} : ${text}`;
					}

					if (!answerAccumulator.has(code)) answerAccumulator.set(code, []);
					answerAccumulator.get(code)!.push(text);

					if (isDynamic && code && !dynamicColumnMap.has(code)) {
						dynamicColumnMap.set(code, answer.field_label);
					}
				}

				const answersMap: Record<string, string> = {};
				answerAccumulator.forEach((values, code) => { answersMap[code] = values.join(' / '); });

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

			if (totalReviews > 0) {
				const percent = Math.min(95, Math.floor((retrievedReviews * 95) / totalReviews));
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

	const currentDate = formatDateForFilename(new Date());
	const safeName = sanitizeFilename(productName);

	await prisma.export.update({ where: { id: exportId }, data: { progress: 95 } });

	// CSV → single flat file with all rows
	// XLS → single workbook with one sheet per year (sorted chronologically)
	let fileBuffer: Buffer;
	let fileName: string;

	if (exportFormat === 'csv') {
		fileBuffer = generateCsvBuffer(allReviews, columns);
		fileName = `Avis_${safeName}_${currentDate}.csv`;
	} else {
		fileBuffer = await generateXlsBuffer(allReviewsByYear, columns, productName);
		fileName = `Avis_${safeName}_${currentDate}.xlsx`;
	}

	await prisma.export.update({ where: { id: exportId }, data: { progress: 98 } });
	await uploadToS3(fileBuffer, fileName);

	await prisma.export.update({ where: { id: exportId }, data: { progress: 99 } });
	const downloadLink = await generateDownloadLink(fileName);

	await prisma.export.update({
		where: { id: exportId },
		data: { status: 'done', endDate: new Date(), link: downloadLink, progress: 100 }
	});

	try {
		await sendExportReadyEmail(userEmail, productName, downloadLink);
	} catch (emailErr) {
		console.error(`[export-worker] Failed to send ready email for export ${exportId}:`, emailErr);
	}

	console.log(`[export-worker] Export ${exportId} completed: ${fileName}`);
}

declare const globalThis: { _exportWorker?: Worker<ExportJobData> } & typeof global;

export function startExportWorker(): void {
	if (globalThis._exportWorker) return;

	const worker = new Worker<ExportJobData>('exports', processExportJob, {
		connection: redis,
		concurrency: CONCURRENCY_LIMIT,
		lockDuration: 3_600_000, // must exceed the longest possible export to prevent stale-job requeue
		stalledInterval: 30_000
	});

	worker.on('completed', job => {
		console.log(`[export-worker] Job ${job.id} completed`);
	});

	worker.on('failed', async (job, err) => {
		console.error(`[export-worker] Job ${job?.id} failed:`, err.message);

		// Reset to idle and notify user only after all retries are exhausted
		if (job && (job.attemptsMade ?? 0) >= (job.opts.attempts ?? 1)) {
			const { exportId } = job.data;
			try {
				const exportRecord = await prisma.export.findUnique({
					where: { id: exportId },
					include: { user: { select: { email: true } }, product: { select: { title: true } } }
				});

				await prisma.export.update({ where: { id: exportId }, data: { status: 'idle', startDate: null, progress: 0 } });

				if (exportRecord?.user?.email) {
					await sendExportFailedEmail(exportRecord.user.email, exportRecord.product.title)
						.catch(e => console.error(`[export-worker] Failed to send failure email:`, e));
				}
			} catch (resetErr) {
				console.error(`[export-worker] Failed to reset export ${exportId}:`, resetErr);
			}
		}
	});

	worker.on('error', err => {
		console.error('[export-worker] Worker error:', err);
	});

	globalThis._exportWorker = worker;
	console.log(`[export-worker] Started (concurrency=${CONCURRENCY_LIMIT})`);
}
