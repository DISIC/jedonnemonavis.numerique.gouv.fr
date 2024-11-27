import { router } from '@/src/server/trpc';
import { productRouter } from './product';
import { entityRouter } from './entity';
import { buttonRouter } from './button';
import { accessRightRouter } from './accessRight';
import { adminEntityRightRouter } from './adminEntityRight';
import { userRouter } from './user';
import { favoriteRouter } from './favorite';
import { formRouter } from './form';
import { blockRouter } from './block';
import { optionsRouter } from './options';
import { exportRouter } from './export';
import { domainRouter } from './domain';
import { userRequestRouter } from './userRequest';
import { userEventRouter } from './userEvent';
import { answerRouter } from './answer';
import { openAPIRouter } from './openapi';
import { apiKeyRouter } from './apiKey';
import { reviewRouter } from './review';
import { reviewCustomRouter } from './reviewCustom';
import { reviewViewLogRouter } from './reviewViewLog';
export const appRouter = router({
	user: userRouter,
	product: productRouter,
	entity: entityRouter,
	accessRight: accessRightRouter,
	adminEntityRight: adminEntityRightRouter,
	button: buttonRouter,
	favorite: favoriteRouter,
	form: formRouter,
	block: blockRouter,
	options: optionsRouter,
	export: exportRouter,
	domain: domainRouter,
	userRequest: userRequestRouter,
	userEvent: userEventRouter,
	answer: answerRouter,
	openAPI: openAPIRouter,
	apiKey: apiKeyRouter,
	review: reviewRouter,
	reviewCustom: reviewCustomRouter,
	reviewViewLog: reviewViewLogRouter
});

export type AppRouter = typeof appRouter;
