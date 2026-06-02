import type { ExportJobData } from '@/src/lib/queue';
import redis from '@/src/lib/redis';
import { ReviewFiltersType } from '@/src/types/custom';
import prisma from '@/src/utils/db';
import {
	generateCsvStream,
	type ReviewRow,
	type TemplateColumn
} from '@/src/utils/export-worker/generate-csv';
import { generateXlsStream } from '@/src/utils/export-worker/generate-xls';
import {
	generateDownloadLink,
	uploadStreamToS3,
	validateS3EnvVars
} from '@/src/utils/export-worker/upload-s3';
import { PassThrough } from 'stream';
import type { Prisma } from '@prisma/client';
import { $Enums } from '@prisma/client';
import { UnrecoverableError, Worker, type Job } from 'bullmq';
import {
	renderExportFailedEmail,
	renderExportReadyEmail
} from '../utils/emails';
import { sendMail } from '../utils/mailer';
import { formatWhereAndOrder } from '../utils/reviews';

const PAGE_SIZE = parseInt(process.env.WORKER_EXPORT_PAGE_SIZE ?? '500', 10);
const CONCURRENCY_LIMIT = parseInt(
	process.env.WORKER_EXPORT_CONCURRENCY ?? '2',
	10
);

type FilterParams = {
	startDate?: string;
	endDate?: string;
	mustHaveVerbatims?: boolean;
	search?: string;
	button_id?: number;
	filters?: ReviewFiltersType;
};

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

type AnswerRow = {
	review_id: number;
	id: number;
	parent_answer_id: number | null;
	field_code: string;
	field_label: string;
	answer_text: string;
};

function buildReviewRow(
	review: { id: number; created_at: Date },
	answers: AnswerRow[],
	formName: string,
	buttonName: string
): ReviewRow {
	const answerById = new Map<number, AnswerRow>();
	for (const a of answers) answerById.set(a.id, a);

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
	}

	const answersMap: Record<string, string> = {};
	answerAccumulator.forEach((values, code) => {
		answersMap[code] = values.join(' / ');
	});

	return {
		review_id: review.id.toString(16).slice(-7),
		review_created_at: review.created_at,
		form_name: formName,
		button_name: buttonName,
		answers: answersMap
	};
}

async function loadDynamicColumns(
	baseReviewWhere: Prisma.ReviewWhereInput,
	startDate: Date,
	endDate: Date
): Promise<TemplateColumn[]> {
	const distinctAnswers = await prisma.answer.findMany({
		where: {
			review: baseReviewWhere,
			review_created_at: { gte: startDate, lte: endDate }
		},
		distinct: ['field_code'],
		select: { field_code: true, field_label: true },
		orderBy: { id: 'asc' }
	});

	return distinctAnswers
		.filter(a => a.field_code)
		.map(a => ({ code: a.field_code, label: a.field_label || a.field_code }));
}

// Only block types that produce Answer rows; decorative blocks (paragraph, heading, divider) are excluded
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
			if (
				block.field_code &&
				(INPUT_BLOCK_TYPES.has(block.type_bloc) ||
					(form.form_template.slug === 'root' &&
						block.type_bloc === 'heading_3'))
			) {
				columns.push({
					code: block.field_code,
					label: block.label ?? block.field_code
				});
			}
		}
	}

	return columns;
}

async function processExportJob(job: Job<ExportJobData>): Promise<void> {
	const { exportId } = job.data;

	const exportRecord = await prisma.export.findUnique({
		where: { id: exportId },
		include: {
			user: { select: { email: true } },
			product: { select: { title: true } },
			form: {
				select: {
					legacy: true,
					title: true,
					form_template: { select: { title: true } }
				}
			}
		}
	});

	if (!exportRecord)
		throw new UnrecoverableError(`No Export found for id ${exportId}`);

	const userEmail = exportRecord.user?.email ?? '';
	const productName = exportRecord.product.title;
	const formName =
		exportRecord.form?.title || exportRecord.form?.form_template.title || '';
	const exportFormat = exportRecord.type;

	await prisma.export.update({
		where: { id: exportId },
		data: { status: 'processing', startDate: new Date(), progress: 0 }
	});

	let filterParams: FilterParams = {};

	if (exportRecord.params) {
		try {
			filterParams = JSON.parse(exportRecord.params) as FilterParams;
		} catch {
			console.error(
				`[export-worker] Failed to parse params for export ${exportId}, proceeding without filters`
			);
		}
	}

	const { where: baseReviewWhere } = formatWhereAndOrder(
		{
			...filterParams,
			product_id: exportRecord.product_id,
			form_id: exportRecord.form_id,
			start_date: filterParams.startDate,
			end_date: filterParams.endDate
		},
		exportRecord.form?.legacy ?? false
	);

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
		23,
		59,
		59,
		999
	);

	// Resolve columns upfront so we can write headers without buffering reviews
	let columns: TemplateColumn[];
	if (exportRecord.form_id) {
		columns = await loadTemplateColumns(exportRecord.form_id);
	} else {
		columns = await loadDynamicColumns(baseReviewWhere, startDate, endDate);
	}

	const totalReviews = await prisma.review.count({ where: baseReviewWhere });

	console.log(
		`[export-worker] Export ${exportId}: ${totalReviews} reviews, format=${exportFormat}`
	);

	const currentDate = formatDateForFilename(new Date());
	const safeName = sanitizeFilename(productName);
	const fileName = `Avis_${safeName}_${currentDate}.${
		exportFormat === 'csv' ? 'csv' : 'xlsx'
	}`;
	const contentType =
		exportFormat === 'csv'
			? 'text/csv; charset=utf-8'
			: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

	// Generator only finishes after all pages have been yielded. The upload phase
	// then takes over progress reporting via httpUploadProgress events.
	let generatorDone = false;
	// Log at most every 5% of total to avoid flooding the terminal on huge exports
	const logEveryPercent = 5;
	let lastLoggedPercent = -1;

	// Streaming pipeline: paginated review fetch → row generator → file writer → S3 multipart upload.
	// Memory stays bounded to ~one page of reviews + small upload buffer, regardless of total size.
	async function* streamReviewRows(): AsyncGenerator<ReviewRow> {
		let offset = 0;
		let retrieved = 0;
		let lastProgressPercent = -1;

		// Date range in the WHERE clause lets PostgreSQL prune the partitioned review/answer tables
		while (true) {
			const reviews = await prisma.review.findMany({
				where: baseReviewWhere,
				orderBy: { created_at: 'asc' },
				skip: offset,
				take: PAGE_SIZE,
				select: {
					id: true,
					created_at: true,
					button: { select: { title: true } }
				}
			});

			if (reviews.length === 0) break;

			const answerRows = await prisma.answer.findMany({
				where: {
					review_id: { in: reviews.map(r => r.id) },
					review_created_at: { gte: startDate, lte: endDate }
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

			const answersByReviewId = new Map<number, typeof answerRows>();
			for (const answer of answerRows) {
				if (!answersByReviewId.has(answer.review_id))
					answersByReviewId.set(answer.review_id, []);
				answersByReviewId.get(answer.review_id)!.push(answer);
			}

			for (const review of reviews) {
				const answers = answersByReviewId.get(review.id) ?? [];
				yield buildReviewRow(
					review,
					answers,
					formName,
					review.button?.title ?? ''
				);
			}

			retrieved += reviews.length;
			offset += PAGE_SIZE;

			if (totalReviews > 0) {
				// Progress 0-95% during streaming. Fetch and S3 upload run in parallel here,
				// so this range covers the bulk of the work. The 95-98% range is reserved
				// for the final S3 multipart commits that happen after the generator finishes.
				const percent = Math.min(
					95,
					Math.floor((retrieved * 95) / totalReviews)
				);
				if (percent !== lastProgressPercent) {
					lastProgressPercent = percent;
					await Promise.all([
						job.updateProgress(percent),
						prisma.export.update({
							where: { id: exportId },
							data: { progress: percent }
						})
					]);
				}

				const overallPercent = Math.floor((retrieved * 100) / totalReviews);
				if (
					overallPercent - lastLoggedPercent >= logEveryPercent ||
					retrieved === totalReviews
				) {
					lastLoggedPercent = overallPercent;
					console.log(
						`[export-worker] Export ${exportId}: ${retrieved}/${totalReviews} (${overallPercent}%)`
					);
				}
			}
		}

		generatorDone = true;
	}

	const passThrough = new PassThrough();

	// After the generator finishes, drive progress 95→98% from upload-finalization events
	// (the trailing multipart commits). Asymptotic: each event nudges closer to 98 but never reaches it.
	let uploadProgressLevel = 95;
	const uploadPromise = uploadStreamToS3(
		passThrough,
		fileName,
		contentType,
		({ loaded }) => {
			// Don't update DB while the generator is still owning the 0-95% range,
			// otherwise its next write would clobber our higher value.
			if (!generatorDone) return;

			// Move ~10% of remaining range each event — never reaches 98
			const ceiling = 98;
			const next = Math.min(
				ceiling - 1,
				uploadProgressLevel +
					Math.max(1, Math.floor((ceiling - uploadProgressLevel) * 0.1))
			);
			if (next > uploadProgressLevel) {
				uploadProgressLevel = next;
				prisma.export
					.update({
						where: { id: exportId },
						data: { progress: uploadProgressLevel }
					})
					.catch(() => {});
			}
			// loaded is referenced so the closure keeps the param shape; useful for future logging
			void loaded;
		}
	);

	try {
		if (exportFormat === 'csv') {
			await generateCsvStream(streamReviewRows(), columns, passThrough);
		} else {
			await generateXlsStream(streamReviewRows(), columns, passThrough);
		}
	} catch (err) {
		passThrough.destroy(err instanceof Error ? err : new Error(String(err)));
		throw err;
	}

	await uploadPromise;

	await prisma.export.update({
		where: { id: exportId },
		data: { progress: 98 }
	});
	const downloadLink = await generateDownloadLink(fileName);

	await prisma.export.update({
		where: { id: exportId },
		data: {
			status: 'done',
			endDate: new Date(),
			link: downloadLink,
			progress: 100
		}
	});

	try {
		const html = await renderExportReadyEmail({ productName, downloadLink });
		const text = `Bonjour,\n\nVotre export pour le service ${productName} est prêt. Vous pouvez le télécharger en utilisant le lien suivant :\n\n${downloadLink}\n\nCe lien expirera dans 7 jours.\n\nCordialement,\nL'équipe JDMA`;

		await sendMail(
			`Votre export est prêt : [${productName}]`,
			userEmail,
			html,
			text
		);
	} catch (emailErr) {
		console.error(
			`[export-worker] Failed to send ready email for export ${exportId}:`,
			emailErr
		);
	}

	console.log(`[export-worker] Export ${exportId} completed: ${fileName}`);
}

declare const globalThis: {
	_exportWorker?: Worker<ExportJobData>;
} & typeof global;

export function startExportWorker(): void {
	if (globalThis._exportWorker) return;

	validateS3EnvVars();

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
					include: {
						user: { select: { email: true } },
						product: { select: { title: true } }
					}
				});

				if (!exportRecord) return;

				await prisma.export.update({
					where: { id: exportId },
					data: { status: 'idle', startDate: null, progress: 0 }
				});

				if (exportRecord.user?.email) {
					const html = await renderExportFailedEmail({
						productName: exportRecord.product.title
					});
					const text = `Bonjour,\n\nNous n'avons pas pu générer votre export pour le service ${exportRecord.product.title}. Veuillez réessayer depuis le backoffice.\n\nCordialement,\nL'équipe JDMA`;

					await sendMail(
						`Votre export a échoué : [${exportRecord.product.title}]`,
						exportRecord.user.email,
						html,
						text
					).catch(e =>
						console.error(`[export-worker] Failed to send failure email:`, e)
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
	console.log(`[export-worker] Started (concurrency=${CONCURRENCY_LIMIT})`);
}
