import { router } from '@/src/server/trpc';
import { reviewRouter } from './review';
import { closedButtonLogRouter } from './closedButtonLog';

export const appRouter = router({
	review: reviewRouter,
	closedButtonLog: closedButtonLogRouter,
});

export type AppRouter = typeof appRouter;
