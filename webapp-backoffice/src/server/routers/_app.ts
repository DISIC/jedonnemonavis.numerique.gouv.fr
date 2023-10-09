import { router } from '@/src/server/trpc';
import { productRouter } from './product';
import { entityRouter } from './entity';
import { buttonRouter } from './button';

export const appRouter = router({
	product: productRouter,
	entity: entityRouter,
	button: buttonRouter
});

export type AppRouter = typeof appRouter;
