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
import crypto from 'crypto';

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

const hashIp = (ip: string) => {
  // Hash IP with date until hour, and salt
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const dateHour = `${year}-${month}-${day}-${hour}`;
  const ipWithDate = `${ip}-${dateHour}`;
  const hash = crypto.createHash('sha256');
  hash.update(ipWithDate + process.env.IP_HASH_SALT); 
  return hash.digest('hex');
};

const transformIp = (ip: string) => {
  const parts = ip.split('.');
  parts[3] = '0';
  const transformedIp = parts.join('.');
  return transformedIp;
}

const extractIdsFromUrl = (url: string) => {
  const urlObj = new URL(url);
  const pathParts = urlObj.pathname.split('/');
  const product_id = pathParts[2];
  const button_id = urlObj.searchParams.get('button');
  return [product_id, button_id];
}

const allowedIps = (process.env.LIMITER_ALLOWED_IPS || '').split(',');

function isIpAllowed(ip: string): boolean {
  return allowedIps.some((allowedIp) => {
    if (allowedIp.includes('-')) {
      const [startIp, endIp] = allowedIp.split('-');
      return ip >= startIp && ip <= endIp;
    }
    return allowedIp === ip;
  });
}

const limiter = createTRPCStoreLimiter<typeof t>({
  fingerprint: (ctx) => {
    const xForwardedFor = ctx.req.headers['x-forwarded-for'] as string;
    const xClientIp = ctx.req.headers['x-client-ip'] as string;
    const ip = xClientIp ? xClientIp.split(',')[0] : xForwardedFor ? xForwardedFor.split(',')[0] : defaultFingerPrint(ctx.req);
    
    return ip;
  },
  windowMs: 60000,
  max: 5,
  onLimit: async (retryAfter, ctx) => {

    const xForwardedFor = ctx.req.headers['x-forwarded-for'] as string;
    const xClientIp = ctx.req.headers['x-client-ip'] as string;
    const ip = xClientIp ? xClientIp.split(',')[0] : xForwardedFor ? xForwardedFor.split(',')[0] : defaultFingerPrint(ctx.req);
    const referer = ctx.req.headers['referer'] || ctx.req.headers['referrer'];
    const hashedIp = hashIp(ip);
    const currentTime = new Date();
    const [product_id, button_id] = extractIdsFromUrl(referer as string);

    // check if the hashed ip is already in the database
    const ipRecord = await prisma.limiterReporting.findFirst({
      where: {
        ip_id: hashedIp,
      },
    });

    // insert or update database
    if (ipRecord) {
      await prisma.limiterReporting.update({
        where: {
          id: ipRecord.id,
        },
        data: {
          total_attempts: ipRecord.total_attempts + 1,
          last_attempt: currentTime,
        },
      });
    } else {
      await prisma.limiterReporting.create({
        data: {
          ip_id: hashedIp,
          ip_adress: transformIp(ip),
          product_id: parseInt(product_id ?? '0'),
          button_id: parseInt(button_id ?? '0'),
          total_attempts: 5,
          first_attempt: currentTime,
          last_attempt: currentTime,
        },
      });
    }

    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Too many requests, please try again later. ${retryAfter}`,
    });
    
  },
});

const bypassLimiterForAllowedIps = t.middleware(async ({ ctx, next }) => {
  const xForwardedFor = ctx.req.headers['x-forwarded-for'] as string;
  const xClientIp = ctx.req.headers['x-client-ip'] as string;
  const ip = xClientIp ? xClientIp.split(',')[0] : xForwardedFor ? xForwardedFor.split(',')[0] : defaultFingerPrint(ctx.req);

  if (isIpAllowed(ip)) {
    return next();
  }
  return limiter({ ctx, next });
});

// Base router and middleware helpers
export const router = t.router;
export const middleware = t.middleware;

// Unprotected procedure
export const publicProcedure = t.procedure;

export const limitedProcedure = t.procedure.use(bypassLimiterForAllowedIps);
