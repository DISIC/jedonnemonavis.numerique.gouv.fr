import { z } from 'zod';
import { router, protectedProcedure } from '@/src/server/trpc';
import { BlockUncheckedCreateInputSchema, FormUncheckedCreateInputSchema, OptionsBlockUncheckedCreateInputSchema, OptionsBlockUncheckedUpdateInputSchema } from '@/prisma/generated/zod';
import { TRPCError } from '@trpc/server';

export const optionsRouter = router({
	getByBlockId: protectedProcedure
		.input(
			z.object({ 
				block_id: z.number()
			})
		)
		.query(async ({ ctx, input }) => {
			const { block_id } = input;

			const options = await ctx.prisma.optionsBlock.findMany({
				where: {
					block_id
				},
				orderBy: {
					created_at: 'asc'
				}
			});

            const optionsCount =  await ctx.prisma.optionsBlock.count({
				where: {
					block_id
				}
			});

			return { data: options, metadata: { optionsCount } };
		}),

	create: protectedProcedure
		.input(OptionsBlockUncheckedCreateInputSchema)
		.mutation(async ({ ctx, input: optionsPayLoad }) => {

			const option = await ctx.prisma.optionsBlock.create({
				data: optionsPayLoad
			});

			return { data: option };
		}),

	update: protectedProcedure
		.input(OptionsBlockUncheckedUpdateInputSchema)
		.mutation(async ({ ctx, input }) => {
			const updatedOption = await ctx.prisma.optionsBlock.update({
				where: {
					id: input.id as number
				},
				data: input
			});

			return { data: updatedOption };
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.number(), position: z.number() }))
		.mutation(async ({ ctx, input }) => {
            const { id, position } = input;
			const deletedBloc = await ctx.prisma.$transaction(async (prisma) => {
				const deletedBloc = await ctx.prisma.block.delete({
					where: {
						id
					}
				});
				await prisma.block.updateMany({
				  where: {
					position: {
					  gte: position
					}
				  },
				  data: {
					position: {
					  decrement: 1
					}
				  }
				});
				return deletedBloc;
			});
			return { data: deletedBloc };
		})

})