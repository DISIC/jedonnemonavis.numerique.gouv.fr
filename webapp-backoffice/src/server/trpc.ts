import { Client as ElkClient } from '@elastic/elasticsearch';
import { ApiKey, TypeAction } from '@prisma/client';
import { TRPCError, inferAsyncReturnType, initTRPC } from '@trpc/server';
import { CreateNextContextOptions } from '@trpc/server/adapters/next';
import fs from 'fs';
import { Session } from 'next-auth';
import path from 'path';
import SuperJSON from 'superjson';
import { OpenApiMeta } from 'trpc-openapi';
import { ZodError } from 'zod';
import { getServerAuthSession } from '../pages/api/auth/[...nextauth]';
import { UserWithAccessRight } from '../types/prismaTypesExtended';
import prisma from '../utils/db';
import { actionMapping } from '../utils/tools';

// Metadata for protected procedures
interface Meta {
	authRequired?: boolean;
	isAdmin?: boolean;
	logEvent?: boolean;
	eventType?: string;
}

// Create context with Prisma and NextAuth session
export const createContext = async (opts: CreateNextContextOptions) => {
	const session = await getServerAuthSession({ req: opts.req, res: opts.res });
	const req = opts.req;
	const user_api = null as UserWithAccessRight | null;
	const api_key = null as ApiKey | null;

	const caCrtPath = path.resolve(process.cwd(), './certs/ca/ca.crt');
	const tlsOptions = fs.existsSync(caCrtPath)
		? {
				ca: fs.readFileSync(caCrtPath),
				rejectUnauthorized: false
			}
		: undefined;

	const elkClient = new ElkClient({
		node: process.env.ES_ADDON_URI as string,
		auth: {
			username: process.env.ES_ADDON_USER as string,
			password: process.env.ES_ADDON_PASSWORD as string
		},
		tls: tlsOptions
	});

	return {
		prisma,
		session,
		elkClient,
		req,
		user_api,
		api_key
	};
};

export type Context = inferAsyncReturnType<typeof createContext>;

const t = initTRPC
	.context<Context>()
	.meta<OpenApiMeta>()
	.create({
		transformer: SuperJSON,
		defaultMeta: {
			authRequired: true,
			isAdmin: false
		},
		errorFormatter({ shape, error }) {
			return {
				...shape,
				data: {
					...shape.data,
					zodError:
						error.cause instanceof ZodError
							? error.cause.flatten()
							: error.cause,
					cause: {
						...error.cause
					}
				}
			};
		}
	});

// Auth middleware
const isAuthed = t.middleware(async ({ next, meta, ctx }) => {
	const user = await ctx.prisma.user.findUnique({
		where: {
			email: ctx.session?.user?.email as string
		}
	});

	if (meta?.authRequired && (!ctx.session?.user || !user)) {
		throw new TRPCError({
			code: 'UNAUTHORIZED',
			message: 'You are not authorized to perform this action'
		});
	}

	if (meta?.isAdmin && !ctx.session?.user?.role.includes('admin')) {
		throw new TRPCError({
			code: 'UNAUTHORIZED',
			message: 'You are not authorized to perform this action'
		});
	}

	if (meta?.idAdminOrOwn) {
		const currentUserId = ctx.session?.user?.id;

		if (
			ctx.req.query.id !== currentUserId &&
			!ctx.session?.user?.role.includes('admin')
		) {
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'You are not authorized to perform this action'
			});
		}
	}

	// Exécute la requête et logue les événements seulement si elle réussit
	try {
		const result = await next({
			ctx: {
				session: ctx.session as Session
			}
		});

		if (meta?.logEvent && result.ok) {
			const trpcQueries = (ctx.req.query.trpc as string)?.split(',');

			await Promise.all(
				trpcQueries.map(async (query, index) => {
					const inputObj = query.includes('get')
						? ctx.req.query.input
							? JSON.parse(ctx.req.query.input as string)
							: { defaultKey: 'defaultValue' }
						: ctx.req.body && typeof ctx.req.body === 'string'
							? JSON.parse(ctx.req.body)
							: ctx.req.body || { defaultKey: 'defaultValue' };

					const action = actionMapping[query];
					const input = inputObj[index] !== undefined ? inputObj[index] : {};

					// Extraire entityId et productId
					let entity_id: number | null = null;
					let product_id: number | null = null;

					if (input?.json?.entity_id) {
						entity_id = input.json.entity_id;
					} else if (input?.json?.entity?.id) {
						entity_id = input.json.entity.id;
					}

					if (input?.json?.product_id) {
						product_id = input.json.product_id;
					} else if (input?.json?.product?.id) {
						product_id = input.json.product.id;
					}

					if (user && action) {
						await ctx.prisma.userEvent.create({
							data: {
								user_id: user.id,
								action,
								entity_id,
								product_id,
								metadata: input
							}
						});
					}
				})
			);
		}

		return result;
	} catch (error) {
		// En cas d'erreur, rien n'est logué.
		throw error;
	}
});

const isKeyAllowed = t.middleware(async ({ next, meta, ctx }) => {
	if (ctx.req.headers.authorization) {
		const apiKey = ctx.req.headers.authorization.split(' ')[1];

		const checkApiKey = await ctx.prisma.apiKey.findFirst({
			where: {
				key: apiKey
			},
			include: {
				user: {
					include: {
						accessRights: true
					}
				}
			}
		});

		if (checkApiKey === null) {
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'Please provide a valid API key'
			});
		} else {
			return next({
				ctx: {
					...ctx,
					user_api: checkApiKey.user,
					api_key: checkApiKey
				}
			});
		}
	} else {
		throw new TRPCError({
			code: 'UNAUTHORIZED',
			message: 'Please provide your API key'
		});
	}
});

// Base router and middleware helpers
export const router = t.router;
export const middleware = t.middleware;

// Unprotected procedure
export const publicProcedure = t.procedure;

// Protected procedure
export const protectedProcedure = t.procedure.use(isAuthed);

// Protected open-api procedure
export const protectedApiProcedure = t.procedure.use(isKeyAllowed);
