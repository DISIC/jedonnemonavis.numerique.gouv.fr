import { router } from '@/src/server/trpc';
import { productRouter } from './product';
import { entityRouter } from './entity';
import { buttonRouter } from './button';
import { accessRightRouter } from './accessRight';

export const appRouter = router({
	product: productRouter,
	entity: entityRouter,
	button: buttonRouter,
	accessRight: accessRightRouter
});

export type AppRouter = typeof appRouter;
