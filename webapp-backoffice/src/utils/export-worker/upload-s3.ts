import {
	S3Client,
	PutObjectCommand,
	GetObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const REQUIRED_S3_ENV_VARS = [
	'CELLAR_ADDON_HOST',
	'CELLAR_ADDON_KEY_ID',
	'CELLAR_ADDON_KEY_SECRET',
	'BUCKET_NAME'
] as const;

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

export async function uploadToS3(
	buffer: Buffer,
	objectName: string
): Promise<void> {
	const client = getS3Client();

	await client.send(
		new PutObjectCommand({
			Bucket: getBucket(),
			Key: objectName,
			Body: buffer
		})
	);
}

/** Generates a pre-signed GET URL valid for 7 days (SigV4 maximum). */
export async function generateDownloadLink(objectName: string): Promise<string> {
	const client = getS3Client();

	const url = await getSignedUrl(
		client,
		new GetObjectCommand({ Bucket: getBucket(), Key: objectName }),
		{ expiresIn: 604800 } // 7 days in seconds (SigV4 maximum)
	);

	return url;
}
