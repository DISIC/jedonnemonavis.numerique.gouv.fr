import { createTRPCStoreLimiter } from "@/src/utils/trpcRateLimiter";
import { Client as ElkClient } from "@elastic/elasticsearch";
import { defaultFingerPrint } from "@trpc-limiter/memory";
import { TRPCError, inferAsyncReturnType, initTRPC } from "@trpc/server";
import { CreateNextContextOptions } from "@trpc/server/adapters/next";
import fs from "fs";
import path from "path";
import SuperJSON from "superjson";
import { ZodError } from "zod";
import prisma from "../utils/db";

// Create context with Prisma and NextAuth session
export const createContext = async (opts: CreateNextContextOptions) => {
  const caCrtPath = path.resolve(process.cwd(), "./certs/ca/ca.crt");
  const tlsOptions = fs.existsSync(caCrtPath)
    ? {
        ca: fs.readFileSync(caCrtPath),
        rejectUnauthorized: false,
      }
    : undefined;

  const elkClient = new ElkClient({
    node: process.env.ES_ADDON_URI as string,
    auth: {
      username: process.env.ES_ADDON_USER as string,
      password: process.env.ES_ADDON_PASSWORD as string,
    },
    tls: tlsOptions,
  });

  return {
    req: opts.req,
    prisma,
    elkClient,
  };
};

export type Context = inferAsyncReturnType<typeof createContext>;

const t = initTRPC.context<Context>().create({
  transformer: SuperJSON,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : error.cause,
        cause: {
          ...error.cause,
        },
      },
    };
  },
});

const limiter = createTRPCStoreLimiter<typeof t>({
  fingerprint: (ctx) => defaultFingerPrint(ctx.req),
  windowMs: 60000,
  max: 5,
  onLimit: (retryAfter) => {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Too many requests, please try again later. ${retryAfter}`,
    });
  },
});

// Base router and middleware helpers
export const router = t.router;
export const middleware = t.middleware;

// Unprotected procedure
export const publicProcedure = t.procedure;

// Limited procedure
export const limitedProcedure = t.procedure.use(limiter);
