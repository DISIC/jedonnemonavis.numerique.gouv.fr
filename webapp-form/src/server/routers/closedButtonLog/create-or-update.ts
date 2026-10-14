import { failFastRedis } from '@/src/lib/redis';
import { getClientIp } from '@/src/utils/clientIp';
import { hashIp, type Context } from '@/src/server/trpc';
import { z } from 'zod';

const ATTEMPT_DEDUP_SECONDS = 60 * 60;

export const createOrUpdateClosedButtonLogInputSchema = z.object({
	button_id: z.number()
});

export const createOrUpdateClosedButtonLogMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof createOrUpdateClosedButtonLogInputSchema>;
}) => {
	const { button_id } = input;

	const button = await ctx.prisma.button.findUnique({
		where: { id: button_id },
		select: {
			isDeleted: true,
			form: {
				select: { isDeleted: true, form_template: { select: { slug: true } } }
			}
		}
	});

	if (!button) return;

	const isReviewBlocked =
		!!button.form.isDeleted ||
		(!!button.isDeleted && button.form.form_template.slug === 'root');

	if (!isReviewBlocked) return;

	let isFirstAttemptInWindow = true;
	try {
		isFirstAttemptInWindow = !!(await failFastRedis.set(
			`closed-button-attempt:${button_id}:${hashIp(getClientIp(ctx.req))}`,
			'1',
			'EX',
			ATTEMPT_DEDUP_SECONDS,
			'NX'
		));
	} catch (error) {
		console.error('[closedButtonLog] attempt dedupe unavailable:', error);
	}

	if (!isFirstAttemptInWindow) return;

	await ctx.prisma.closedButtonLog.upsert({
		where: { button_id },
		update: { count: { increment: 1 } },
		create: { button_id }
	});
};
