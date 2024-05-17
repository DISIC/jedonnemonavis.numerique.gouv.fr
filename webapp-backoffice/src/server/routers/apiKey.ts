import { protectedProcedure, router } from '@/src/server/trpc';
import { z } from 'zod';

export const apiKeyRouter = router({
	getList: protectedProcedure
		.input(z.object({
			product_id: z.number().optional(),
			organization_id: z.number().optional()
		}))
		.query(async ({ ctx, input }) => {
			const ctx_user = ctx.session.user;

			const keys = await ctx.prisma.apiKey.findMany({
				where: {
					user_id: parseInt(ctx_user.id),
					...(input.product_id && {
						product_id: input.product_id
					}),
					...(input.organization_id && {
						organization_id: input.organization_id
					})
				}
			});

			return { count: 0, data: keys };
		}),

	create: protectedProcedure
		.input(z.object({
			product_id: z.number().optional(),
			organization_id: z.number().optional()
		}))
		.mutation(async ({ ctx, input }) => {
			const ctx_user = ctx.session.user;

			var password = '';
			const chars =
				'0123456789abcdefghijklmnopqrstuvwxyz!_ABCDEFGHIJKLMNOPQRSTUVWXYZ';
			for (var i = 0; i <= 32; i++) {
				var randomNumber = Math.floor(Math.random() * chars.length);
				password += chars.substring(randomNumber, randomNumber + 1);
			}

			const newKey = await ctx.prisma.apiKey.create({
				data: {
					user_id: parseInt(ctx_user.id),
					key: password,
					scope: 'user',
					...(input.product_id && {
						product_id: input.product_id
					})
				}
			});

			return { data: newKey };
		}),

	delete: protectedProcedure
		.input(
			z.object({
				key: z.string()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const ctx_user = ctx.session.user;
			const { key } = input;

			const keyFound = await ctx.prisma.apiKey.findFirst({
				where: {
					key: key
				},
				include: {
					user: true
				}
			});
			if (keyFound && keyFound.user.id === parseInt(ctx_user.id)) {
				await ctx.prisma.apiKey.delete({
					where: {
						id: keyFound.id
					}
				});
				return { result: 'key deleted' };
			}

			return { result: 'key not found' };
		})
});
