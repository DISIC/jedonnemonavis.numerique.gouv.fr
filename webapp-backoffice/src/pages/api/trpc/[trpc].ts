import * as trpcNext from '@trpc/server/adapters/next';
import { appRouter } from '@/src/server/routers/root';
import { createContext } from '@/src/server/trpc';
// export API handler
// @see https://trpc.io/docs/server/adapters

export default trpcNext.createNextApiHandler({
	router: appRouter,
	createContext
});
