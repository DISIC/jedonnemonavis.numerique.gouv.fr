import { PrismaClient } from '@prisma/client';
import { TRPCError, inferAsyncReturnType, initTRPC } from '@trpc/server';
import { CreateNextContextOptions } from '@trpc/server/adapters/next';
import { getSession } from 'next-auth/react';
import SuperJSON from 'superjson';

// Create context with Prisma and NextAuth session
export const createContext = async (opts: CreateNextContextOptions) => {
	const prisma = new PrismaClient();
	const session = await getSession({ req: opts.req });

	return {
		prisma,
		session
	};
};

export type Context = inferAsyncReturnType<typeof createContext>;

const t = initTRPC.context<Context>().create({
	transformer: SuperJSON
});

// Auth middleware
const isAuthed = t.middleware(({ next, ctx }) => {
	if (!ctx.session?.user?.email) {
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
