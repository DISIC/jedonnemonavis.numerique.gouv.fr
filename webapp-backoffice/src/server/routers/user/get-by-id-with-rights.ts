import type { Context } from '@/src/server/trpc';
import { z } from 'zod';

export const getUserByIdWithRightsInputSchema = z.object({ id: z.number() });

export const getUserByIdWithRightsQuery = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof getUserByIdWithRightsInputSchema>;
}) => {
	const { id } = input;

	const user = await ctx.prisma.user.findUnique({
		where: { id },
		include: {
			accessRights: {
				include: {
					product: {
						include: {
							entity: true
						}
					}
				}
			},
			adminEntityRights: {
				include: {
					entity: {
						include: {
							products: true
						}
					}
				}
			}
		}
	});

	return { data: user };
};
