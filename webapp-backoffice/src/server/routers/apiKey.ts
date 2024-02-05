import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '@/src/server/trpc';
import { Prisma } from '@prisma/client';
import {
	ApiKeyUncheckedCreateInputSchema,
	ApiKeyUncheckedUpdateInputSchema
} from '@/prisma/generated/zod';

export const apiKeyRouter = router({
	getList: protectedProcedure
		.input(z.object({}))
		.query(async ({ ctx, input }) => {

			const ctx_user = ctx.session.user

            const keys = await ctx.prisma.apiKey.findMany({
                where: {
                    user_id: parseInt(ctx_user.id)
                }
            })
            
			return { count: 0, data: keys};
		}),

	create: protectedProcedure
		.mutation(async ({ ctx, input }) => {

			const ctx_user = ctx.session.user

			var password = ""
			const chars = "0123456789abcdefghijklmnopqrstuvwxyz!_ABCDEFGHIJKLMNOPQRSTUVWXYZ";
			for (var i = 0; i <= 16; i++) {
				var randomNumber = Math.floor(Math.random() * chars.length);
				password += chars.substring(randomNumber, randomNumber +1);
			}

			const newKey = await ctx.prisma.apiKey.create({
				data: {
					user_id: parseInt(ctx_user.id),
					key: password,
					scope: 'user'
				}
			});

			return { data: newKey };
		}),

	delete: protectedProcedure
		.input(z.object({
			key: z.string()
		}))
		.mutation(async ({ ctx, input }) => {

			const ctx_user = ctx.session.user
			const {key} = input

			const keyFound = await ctx.prisma.apiKey.findFirst({
				where: {
					key: key
				},
				include: {
					user: true
				}
			})

			if(keyFound.user.id === ctx_user.id) {	
				const deleteKey = await ctx.prisma.apiKey.delete({
					where: {
						id: keyFound.id
					}
				})
				return { result: 'key deleted' };
			}

			return {result: 'key not found'}
		})
});
