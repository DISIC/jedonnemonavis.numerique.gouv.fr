import {
	S3Client,
	PutObjectCommand,
	GetObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

let _s3Client: S3Client | null = null;

function getS3Client(): S3Client {
	if (!_s3Client) {
		_s3Client = new S3Client({
			endpoint: `https://${process.env.CELLAR_ADDON_HOST}`,
			region: 'us-east-1', // required by the SDK even for non-AWS endpoints
			credentials: {
				accessKeyId: process.env.CELLAR_ADDON_KEY_ID!,
				secretAccessKey: process.env.CELLAR_ADDON_KEY_SECRET!
			},
			forcePathStyle: true
		});
	}
	return _s3Client;
}

export async function uploadToS3(
	buffer: Buffer,
	objectName: string
): Promise<void> {
	const client = getS3Client();
	const bucket = process.env.BUCKET_NAME!;

	await client.send(
		new PutObjectCommand({
			Bucket: bucket,
			Key: objectName,
			Body: buffer
		})
	);
}

/** Generates a pre-signed GET URL valid for 7 days (SigV4 maximum). */
export async function generateDownloadLink(objectName: string): Promise<string> {
	const client = getS3Client();
	const bucket = process.env.BUCKET_NAME!;

	const url = await getSignedUrl(
		client,
		new GetObjectCommand({ Bucket: bucket, Key: objectName }),
		{ expiresIn: 604800 } // 7 days in seconds (SigV4 maximum)
	);

	return url;
}
