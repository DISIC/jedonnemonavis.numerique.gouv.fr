import { router } from '@/src/server/trpc';
import openAPIRouter from './open-api';
import { getXWikiIdsProcedure } from './product';

export const openApiRouter = router({
	openAPI: openAPIRouter,
	product: router({ getXWikiIds: getXWikiIdsProcedure })
});
