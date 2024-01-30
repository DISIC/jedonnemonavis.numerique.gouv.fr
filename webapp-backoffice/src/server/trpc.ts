import fs from "fs";
import path from "path";
import { PrismaClient } from '@prisma/client';
import { TRPCError, inferAsyncReturnType, initTRPC } from '@trpc/server';
import { CreateNextContextOptions } from '@trpc/server/adapters/next';
import SuperJSON from 'superjson';
import { ZodError } from 'zod';
import { getServerAuthSession } from '../pages/api/auth/[...nextauth]';
import { Session } from 'next-auth';
import { OpenApiMeta } from "trpc-openapi";
import { Client as ElkClient } from "@elastic/elasticsearch";

// Metadata for protected procedures
interface Meta {
	authRequired?: boolean;
	isAdmin?: boolean;
}

// Create context with Prisma and NextAuth session
export const createContext = async (opts: CreateNextContextOptions) => {
	const prisma = new PrismaClient();
	const session = await getServerAuthSession({ req: opts.req, res: opts.res });

	const elkClient = new ElkClient({
	  node: process.env.ELASTIC_HOST as string,
	  auth: {
		username: process.env.ELASTIC_USERNAME as string,
		password: process.env.ELASTIC_PASSWORD as string,
	  },
	  tls: {
		ca: fs.readFileSync(path.resolve(process.cwd(), "./certs/ca/ca.crt")),
		rejectUnauthorized: false,
	  },
	});

	return {
		prisma,
		session,
		elkClient
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

	if (meta?.authRequired && (!ctx.session?.user === undefined || !user)) {
		throw new TRPCError({
			code: 'UNAUTHORIZED',
			message: 'You are not authorized to perform this action'
		});
	}

	if (meta?.isAdmin && ctx.session?.user?.role !== 'admin') {
		throw new TRPCError({
			code: 'UNAUTHORIZED',
			message: 'You are not authorized to perform this action'
		});
	}

	return next({
		ctx: {
			// Infers the `session` as non-nullable
			session: ctx.session as Session
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
