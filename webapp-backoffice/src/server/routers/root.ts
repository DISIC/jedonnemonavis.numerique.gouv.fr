import { router } from '@/src/server/trpc';
import { productRouter } from './product';
import { entityRouter } from './entity';
import { buttonRouter } from './button';
import { accessRightRouter } from './accessRight';
import { adminEntityRightRouter } from './adminEntityRight';
import { userRouter } from './user';
import { favoriteRouter } from './favorite';
import { exportRouter } from './export';
import { domainRouter } from './domain';
import { userRequestRouter } from './userRequest';
import { answerRouter } from './answer';
import { openAPIRouter } from './openapi';
import { apiKeyRouter } from './apiKey';
import { reviewRouter } from './review';

export const appRouter = router({
	user: userRouter,
	product: productRouter,
	entity: entityRouter,
	accessRight: accessRightRouter,
	adminEntityRight: adminEntityRightRouter,
	button: buttonRouter,
	favorite: favoriteRouter,
	export: exportRouter,
	domain: domainRouter,
	userRequest: userRequestRouter,
	answer: answerRouter,
	openAPI: openAPIRouter,
	apiKey: apiKeyRouter,
	review: reviewRouter
});

export type AppRouter = typeof appRouter;
