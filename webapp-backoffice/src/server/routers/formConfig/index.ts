import { protectedProcedure, router } from '@/src/server/trpc';
import {
	createFormConfigInputSchema,
	createFormConfigMutation
} from './create';

export const formConfigRouter = router({
	create: protectedProcedure
		.meta({ logEvent: true })
		.input(createFormConfigInputSchema)
		.mutation(createFormConfigMutation)
});
