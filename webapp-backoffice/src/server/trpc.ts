import { PrismaClient } from '@prisma/client';
import { TRPCError, inferAsyncReturnType, initTRPC } from '@trpc/server';
import { CreateNextContextOptions } from '@trpc/server/adapters/next';
import SuperJSON from 'superjson';
import { ZodError } from 'zod';
import { getServerAuthSession } from '../pages/api/auth/[...nextauth]';

// Metadata for protected procedures
interface Meta {
	authRequired: boolean;
}

// Create context with Prisma and NextAuth session
export const createContext = async (opts: CreateNextContextOptions) => {
	const prisma = new PrismaClient();
	const session = await getServerAuthSession({ req: opts.req, res: opts.res });

	return {
		prisma,
		session
	};
};

export type Context = inferAsyncReturnType<typeof createContext>;

const t = initTRPC
	.context<Context>()
	.meta<Meta>()
	.create({
		transformer: SuperJSON,
		defaultMeta: {
			authRequired: true
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
const isAuthed = t.middleware(({ next, meta, ctx }) => {
	if (!ctx.session?.user?.email && (meta?.authRequired || true)) {
		throw new TRPCError({
			code: 'UNAUTHORIZED'
		});
	}

	return next({
		ctx: {
			// Infers the `session` as non-nullable
			session: ctx.session
		}
	});
});

// Base router and middleware helpers
export const router = t.router;
export const middleware = t.middleware;

// Unprotected procedure
export const publicProcedure = t.procedure;

// Protected procedure
export const protectedProcedure = t.procedure.use(isAuthed);
