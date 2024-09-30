import { z } from 'zod';
import { router, protectedProcedure } from '@/src/server/trpc';
import { BlockUncheckedCreateInputSchema, BlockUncheckedUpdateInputSchema, BlockUpdateInputSchema, BlockWithRelationsSchema, FormUncheckedCreateInputSchema } from '@/prisma/generated/zod';
import { TRPCError } from '@trpc/server';

export const blockRouter = router({
	getByFormId: protectedProcedure
		.input(
			z.object({ 
				form_id: z.number()
			})
		)
		.query(async ({ ctx, input }) => {
			const { form_id } = input;

			const blocks = await ctx.prisma.block.findMany({
				where: {
					form_id
				},
				orderBy: {
					position: 'asc'
				},
				include: {
					options: {
						orderBy: {
							created_at: 'asc'
						}
					}
				}
			});

            const blockCount =  await ctx.prisma.block.count({
				where: {
					form_id
				}
			});

			return { data: blocks, metadata: { blockCount } };
		}),

	create: protectedProcedure
		.input(BlockUncheckedCreateInputSchema)
		.mutation(async ({ ctx, input: blockPayLoad }) => {

			const block = await ctx.prisma.$transaction(async (prisma) => {
				await prisma.block.updateMany({
				  where: {
					position: {
					  gte: blockPayLoad.position
					}
				  },
				  data: {
					position: {
					  increment: 1
					}
				  }
				});
				const block = await prisma.block.create({
				  data: blockPayLoad
				});

				if(block.type_bloc === 'logic') {
					const type_options_logic = ['when', 'condition', 'value', 'then', 'action']
					await Promise.all(
						type_options_logic.map(async (type_l) => {
							await prisma.optionsBlock.create({
								data: {
									block_id: block.id,
									created_at: new Date(),
									updated_at: new Date(),
									label: type_l
								}
							})
						})
					)
				}

				return block;
			});

			return { data: block };
		}),

	update: protectedProcedure
		.input(BlockUncheckedUpdateInputSchema)
		.mutation(async ({ ctx, input }) => {
			const updatedBlock = await ctx.prisma.block.update({
				where: {
					id: input.id as number
				},
				data: input
			});

			return { data: updatedBlock };
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