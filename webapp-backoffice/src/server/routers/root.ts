import { router } from '@/src/server/trpc';
import { productRouter } from './product';
import { entityRouter } from './entity';
import { buttonRouter } from './button';
import { accessRightRouter } from './accessRight';
import { userRouter } from './user';
import { favoriteRouter } from './favorite';
import { domainRouter } from './domain';
import { userRequestRouter } from './userRequest';
import { answerRouter } from "./answer";
import { openAPIRouter } from "./openapi";
import { apiKeyRouter } from "./apiKey";

export const appRouter = router({
	user: userRouter,
	product: productRouter,
	entity: entityRouter,
	accessRight: accessRightRouter,
	button: buttonRouter,
	favorite: favoriteRouter,
	domain: domainRouter,
	userRequest: userRequestRouter,
	answer: answerRouter,
	openAPI: openAPIRouter,
	apiKey: apiKeyRouter
});

export type AppRouter = typeof appRouter;
