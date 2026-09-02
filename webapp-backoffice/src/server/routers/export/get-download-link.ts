import type { Context } from '@/src/server/trpc';
import { EXPORT_DOWNLOAD_LINK_TTL_SECONDS } from '@/src/utils/export';
import { generateDownloadLink } from '@/src/utils/export-worker/upload-s3';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { checkRightToProceed } from '../product';

export const getExportDownloadLinkInputSchema = z.object({ id: z.number() });

/**
 * Le lien signé n'est plus stocké côté client : il est régénéré à la demande,
 * avec un TTL court, une fois les droits sur le service vérifiés.
 */
export const getExportDownloadLinkMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof getExportDownloadLinkInputSchema>;
}) => {
	const exportRecord = await ctx.prisma.export.findUnique({
		where: { id: input.id },
		select: { link: true, product_id: true }
	});

	if (!exportRecord?.link) {
		throw new TRPCError({
			code: 'NOT_FOUND',
			message: 'Export not found or not ready'
		});
	}

	await checkRightToProceed({
		prisma: ctx.prisma,
		session: ctx.session!,
		product_id: exportRecord.product_id,
		authorizeCarrierUser: true
	});

	// Le lien historique porte l'objet dans son chemin (client S3 en path-style).
	const objectName = decodeURIComponent(
		new URL(exportRecord.link).pathname.split('/').pop() || ''
	);

	if (!objectName) {
		throw new TRPCError({
			code: 'INTERNAL_SERVER_ERROR',
			message: 'Unable to resolve export object'
		});
	}

	const link = await generateDownloadLink(
		objectName,
		EXPORT_DOWNLOAD_LINK_TTL_SECONDS
	);

	return { data: { link } };
};
