import { z } from 'zod';
import { router, protectedProcedure } from '@/src/server/trpc';
import { FormUncheckedCreateInputSchema } from '@/prisma/generated/zod';
import { TRPCError } from '@trpc/server';

export const formRouter = router({
	getByUser: protectedProcedure
		.input(
			z.object({ 
				user_id: z.number(),
				numberPerPage: z.number(),
				page: z.number().default(1),
			})
		)
		.query(async ({ ctx, input }) => {
			const { user_id, numberPerPage, page } = input;

			const userForms = await ctx.prisma.form.findMany({
				where: {
					user_id
				},
				take: numberPerPage,
				skip: (page - 1) * numberPerPage,
				orderBy: {
					updated_at: 'desc'
				}
			});

            const formCount =  await ctx.prisma.form.count({
				where: {
					user_id
				}
			});

			return { data: userForms, metadata: { formCount } };
		}),

	create: protectedProcedure
		.input(FormUncheckedCreateInputSchema)
		.mutation(async ({ ctx, input: formPayLoad }) => {

			const existsEntity = await ctx.prisma.form.findFirst({
				where: {
					title: formPayLoad.title,
					user_id: formPayLoad.user_id
				}
			});

			if (existsEntity)
				throw new TRPCError({
					code: 'CONFLICT',
					message: 'Form with this name already exists'
				});


			const form = await ctx.prisma.form.create({
				data: formPayLoad
			});

			return { data: form };
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
            const { id } = input;
			const deletedForm = await ctx.prisma.form.delete({
				where: {
					id
				}
			});

			return { data: deletedForm };
		})

})