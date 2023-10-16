import { router } from '@/src/server/trpc';
import { productRouter } from './product';
import { entityRouter } from './entity';
import { buttonRouter } from './button';
import { accessRightRouter } from './accessRight';
import { userRouter } from './user';
import { favoriteRouter } from './favorite';
import { domainRouter } from './domain';

export const appRouter = router({
	user: userRouter,
	product: productRouter,
	entity: entityRouter,
	accessRight: accessRightRouter,
	button: buttonRouter,
	favorite: favoriteRouter,
	domains: domainRouter
});

export type AppRouter = typeof appRouter;
