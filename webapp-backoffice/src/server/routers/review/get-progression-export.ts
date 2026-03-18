import type { Context } from '@/src/server/trpc';
import { getMemoryValue } from '@/src/utils/memoryStorage';
import { z } from 'zod';

export const getProgressionExportInputSchema = z.object({
	memoryKey: z.string()
});

export const getProgressionExportOutputSchema = z.object({
	progress: z.number()
});

export const getProgressionExportQuery = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof getProgressionExportInputSchema>;
}) => {
	return { progress: getMemoryValue(input.memoryKey) || 0 };
};
