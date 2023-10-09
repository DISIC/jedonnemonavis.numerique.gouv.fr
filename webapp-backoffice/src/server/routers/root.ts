import { productRouter } from './product';
import { router } from '@/src/server/trpc';

export const appRouter = router({
	product: productRouter
});

export type AppRouter = typeof appRouter;
