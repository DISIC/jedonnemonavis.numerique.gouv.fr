import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { Readable } from 'stream';

const REQUIRED_S3_ENV_VARS = [
	'CELLAR_ADDON_HOST',
	'CELLAR_ADDON_KEY_ID',
	'CELLAR_ADDON_KEY_SECRET',
	'BUCKET_NAME'
] as const;

// Defaults are tuned for the smallest (nano, 512MB) tier. Prod scalers (S tier and up)
// should bump these via env vars: 25MB × 8 is a good sweet spot for S (2GB).
const UPLOAD_PART_SIZE_MB = parseInt(
	process.env.WORKER_EXPORT_UPLOAD_PART_SIZE_MB ?? '10',
	10
);
const UPLOAD_QUEUE_SIZE = parseInt(
	process.env.WORKER_EXPORT_UPLOAD_QUEUE_SIZE ?? '4',
	10
);

export function validateS3EnvVars(): void {
	for (const name of REQUIRED_S3_ENV_VARS) {
		if (!process.env[name])
			throw new Error(`[export-worker] Missing required env var: ${name}`);
	}
}

function getRequiredEnv(name: string): string {
	const value = process.env[name];
	if (!value) {
		throw new Error(`[export-worker] Missing required env var: ${name}`);
	}
	return value;
}

let _s3Client: S3Client | null = null;
let _bucket: string | null = null;

function getS3Client(): S3Client {
	if (!_s3Client) {
		const host = getRequiredEnv('CELLAR_ADDON_HOST');
		const accessKeyId = getRequiredEnv('CELLAR_ADDON_KEY_ID');
		const secretAccessKey = getRequiredEnv('CELLAR_ADDON_KEY_SECRET');
		_bucket = getRequiredEnv('BUCKET_NAME');

		_s3Client = new S3Client({
			endpoint: `https://${host}`,
			region: 'us-east-1', // required by the SDK even for non-AWS endpoints
			credentials: { accessKeyId, secretAccessKey },
			forcePathStyle: true
		});
	}
	return _s3Client;
}

function getBucket(): string {
	if (!_bucket) _bucket = getRequiredEnv('BUCKET_NAME');
	return _bucket;
}

export type UploadProgress = {
	loaded: number;
	total?: number;
};

/**
 * Streaming multipart upload — reads from the readable stream as data flows in,
 * never buffering the full file in memory. Reuses the same S3 client.
 *
 * Optional `onProgress` is invoked for each multipart chunk uploaded
 * (~5MB by default), with cumulative bytes uploaded so far.
 */
export async function uploadStreamToS3(
	body: Readable,
	objectName: string,
	contentType: string,
	onProgress?: (progress: UploadProgress) => void
): Promise<void> {
	const client = getS3Client();

	const upload = new Upload({
		client,
		params: {
			Bucket: getBucket(),
			Key: objectName,
			Body: body,
			ContentType: contentType
		},
		partSize: UPLOAD_PART_SIZE_MB * 1024 * 1024,
		queueSize: UPLOAD_QUEUE_SIZE
	});

	if (onProgress) {
		upload.on('httpUploadProgress', progress => {
			if (progress.loaded != null) {
				onProgress({ loaded: progress.loaded, total: progress.total });
			}
		});
	}

	await upload.done();
}

/** Generates a pre-signed GET URL valid for 7 days (SigV4 maximum). */
export async function generateDownloadLink(
	objectName: string
): Promise<string> {
	const client = getS3Client();

	const url = await getSignedUrl(
		client,
		new GetObjectCommand({ Bucket: getBucket(), Key: objectName }),
		{ expiresIn: 604800 } // 7 days in seconds (SigV4 maximum)
	);

	return url;
}
