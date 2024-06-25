import { httpBatchLink, httpLink, splitLink } from '@trpc/client';
import { createTRPCNext } from '@trpc/next';
import type { AppRouter } from '../server/routers/root';
import SuperJSON from 'superjson';

export const trpc = createTRPCNext<AppRouter>({
	config(opts) {
		return {
			transformer: SuperJSON,
			queryClientConfig: {
				defaultOptions: {
					queries: {
						refetchOnWindowFocus: false
					}
				}
			},
			links: [
				splitLink({
					condition(op) {
						return Boolean(op.context.skipBatch);
					},
					true: httpLink({
						url: `/api/trpc`
					}),
					false: httpBatchLink({
						url: `/api/trpc`
					})
				})
			]
		};
	},
	/**
	 * @link https://trpc.io/docs/ssr
	 **/
	ssr: false
});
