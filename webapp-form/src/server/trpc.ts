import fs from "fs";
import path from "path";
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
    node: process.env.ES_ADDON_URI as string,
    auth: {
      username: process.env.ES_ADDON_USER as string,
      password: process.env.ES_ADDON_PASSWORD as string,
    },
    tls: {
      ca: fs.readFileSync(path.resolve(process.cwd(), "./certs/ca/ca.crt")),
      rejectUnauthorized: false,
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
