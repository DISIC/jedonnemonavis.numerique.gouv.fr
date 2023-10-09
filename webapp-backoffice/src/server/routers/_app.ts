import { router } from '@/src/server/trpc';
import { productRouter } from './product';
import { entityRouter } from './entities';

export const appRouter = router({
	product: productRouter,
	entity: entityRouter
});

export type AppRouter = typeof appRouter;
