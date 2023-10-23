import { NextApiRequest, NextApiResponse } from 'next';
import { createOpenApiNextHandler } from 'trpc-openapi';

import { appRouter } from '@/src/server/routers/root';
import { createContext } from '@/src/server/trpc';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	// Handle incoming OpenAPI requests
	return createOpenApiNextHandler({
		router: appRouter,
		createContext,
		responseMeta: undefined,
		onError: undefined
	})(req, res);
};

export default handler;
