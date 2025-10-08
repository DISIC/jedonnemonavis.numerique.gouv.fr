import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { Context } from '@/src/server/trpc';

export const healthQuery = async ({ ctx }: { ctx: Context; input: {} }) => {
	let dbOk = false;
	let elkOk = false;

	try {
		await ctx.prisma.user.count();
		dbOk = true;
	} catch (e) {
		console.error('DB health failed', e);
	}

	try {
		const health = await ctx.elkClient.cluster.health();
		elkOk = health.status === 'green' || health.status === 'yellow';
	} catch (e) {
		console.error('ELK health failed', e);
	}

	const status = dbOk && elkOk ? 'ok' : 'degraded';
	const response = {
		status,
		database: dbOk ? 'ok' : 'down',
		elk: elkOk ? 'ok' : 'down'
	};

	if (!dbOk || !elkOk) {
		throw new TRPCError({
			code: 'INTERNAL_SERVER_ERROR',
			message: 'Un ou plusieurs services sont indisponibles',
			cause: response
		});
	}

	return response;
};

export const healthInputSchema = z.object({});

export const healthOutputSchema = z.object({
	status: z.string(),
	database: z.string(),
	elk: z.string()
});
