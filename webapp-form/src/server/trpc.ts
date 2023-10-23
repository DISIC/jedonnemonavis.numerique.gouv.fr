import { PrismaClient } from "@prisma/client";
import { inferAsyncReturnType, initTRPC } from "@trpc/server";
import SuperJSON from "superjson";
import { ZodError } from "zod";
import { OpenApiMeta } from "trpc-openapi";
import { Client as ElkClient } from "@elastic/elasticsearch";

// Create context with Prisma and NextAuth session
export const createContext = async () => {
  const prisma = new PrismaClient();

  const elkClient = new ElkClient({
    cloud: {
      id: process.env.ELASTIC_CLOUD_ID as string,
    },
    auth: {
      username: process.env.ELASTIC_CLOUD_USERNAME as string,
      password: process.env.ELASTIC_CLOUD_PASSWORD as string,
    },
  });

  return {
    prisma,
    elkClient,
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
      isAdmin: false,
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
            ...error.cause,
          },
        },
      };
    },
  });

// Base router and middleware helpers
export const router = t.router;
export const middleware = t.middleware;

// Unprotected procedure
export const publicProcedure = t.procedure;
