import { entities } from './../../../prisma/seeds/entities';
import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '@/src/server/trpc';

export const entityRouter = router({
	getList: publicProcedure.query(async ({ ctx }) => {
		const entities = await ctx.prisma.entity.findMany();

		return entities;
	})
});
