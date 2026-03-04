import { WhiteListedDomainCreateInputSchema } from '@/prisma/generated/zod';
import type { Context } from '@/src/server/trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const createDomainInputSchema = WhiteListedDomainCreateInputSchema;

export const createDomainMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof createDomainInputSchema>;
}) => {
	const { domain } = input;

	const existsDomain = await ctx.prisma.whiteListedDomain.findUnique({
		where: { domain }
	});

	if (existsDomain)
		throw new TRPCError({ code: 'CONFLICT', message: 'Domain already exists' });

	const createdDomain = await ctx.prisma.whiteListedDomain.create({
		data: { domain }
	});

	return { data: createdDomain };
};
