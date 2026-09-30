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
import { userEventRouter } from './userEvent';
import { answerRouter } from './answer';
import { apiKeyRouter } from './apiKey';
import { reviewRouter } from './review';
import { archivedReviewRouter } from './archivedReview';
import { reviewCustomRouter } from './reviewCustom';
import { reviewViewLogRouter } from './reviewViewLog';
import { formRouter } from './form';
import { formConfigRouter } from './formConfig';
import { formAlertRouter } from './formAlert';
import { userDetailsRouter } from './userDetails';

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
	userEvent: userEventRouter,
	userDetails: userDetailsRouter,
	answer: answerRouter,
	apiKey: apiKeyRouter,
	review: reviewRouter,
	archivedReview: archivedReviewRouter,
	reviewCustom: reviewCustomRouter,
	reviewViewLog: reviewViewLogRouter,
	form: formRouter,
	formConfig: formConfigRouter,
	formAlert: formAlertRouter
});

export type AppRouter = typeof appRouter;
