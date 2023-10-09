import * as trpcNext from '@trpc/server/adapters/next';
import { appRouter } from '@/src/server/routers/root';
import { PrismaClient } from '@prisma/client';
import { createContext } from '@/src/utils/context';
// export API handler
// @see https://trpc.io/docs/server/adapters

const prisma = new PrismaClient();

export default trpcNext.createNextApiHandler({
	router: appRouter,
	createContext
});
