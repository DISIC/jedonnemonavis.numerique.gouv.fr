import { Client as ElkClient } from '@elastic/elasticsearch';
import { ApiKey } from '@prisma/client';
import { defaultFingerPrint } from '@trpc-limiter/memory';
import { TRPCError, inferAsyncReturnType, initTRPC } from '@trpc/server';
import { CreateNextContextOptions } from '@trpc/server/adapters/next';
import crypto from 'crypto';
import fs from 'fs';
import ipaddr from 'ipaddr.js';
import { Session } from 'next-auth';
import path from 'path';
import SuperJSON from 'superjson';
import { OpenApiMeta } from 'trpc-openapi';
import { ZodError } from 'zod';
import { getServerAuthSession } from '../pages/api/auth/[...nextauth]';
import { UserWithAccessRight } from '../types/prismaTypesExtended';
import prisma from '../utils/db';
import { actionMapping } from '../utils/tools';
import { createTRPCStoreLimiter } from '../utils/trpcRateLimiter';

// Metadata for protected procedures
interface Meta {
	authRequired?: boolean;
	isAdmin?: boolean;
	isAdminOrOwn?: boolean;
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
		: {
				rejectUnauthorized: false
		  };

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

	if (meta?.isAdminOrOwn && !ctx.session?.user?.role.includes('admin')) {
		const currentUserId = ctx.session?.user?.id;

		let rawInput: any = ctx.req.query.input;
		if (typeof rawInput === 'string') {
			try {
				rawInput = JSON.parse(rawInput);
			} catch {
				rawInput = undefined;
			}
		}
		if (!rawInput && ctx.req.body && typeof ctx.req.body === 'object') {
			rawInput = ctx.req.body;
		}

		const extractPayloads = (bag: any): any[] => {
			if (!bag) return [];
			if (Array.isArray(bag)) return bag;
			if (bag.json !== undefined || bag.id !== undefined) return [bag];
			return Object.values(bag);
		};

		const payloads = extractPayloads(rawInput);

		if (payloads.length === 0) {
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'You are not authorized to perform this action'
			});
		}

		const allOwn = payloads.every(payload => {
			const requestId = payload?.json?.id ?? payload?.id;
			return (
				requestId !== undefined &&
				requestId !== null &&
				requestId.toString() === currentUserId?.toString()
			);
		});

		if (!allOwn) {
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
					let form_id: number | null = null;

					if (input?.json?.entity_id) {
						entity_id = input.json.entity_id;
					} else if (input?.json?.entity?.id) {
						entity_id = input.json.entity.id;
					}

					if (input?.json?.product_id) {
						product_id = input.json.product_id;
					} else if (input?.json?.product?.id) {
						product_id = input.json.product.id;
					} else if (input?.json?.form?.product_id) {
						product_id = input.json.form.product_id;
					}

					if (input?.json?.form_id) {
						form_id = input.json.form_id;
					}

					const shouldLogEvent =
						'shouldLogEvent' in input?.json ? input.json.shouldLogEvent : true;

					if (user && action && shouldLogEvent) {
						await ctx.prisma.userEvent.create({
							data: {
								user_id: user.id,
								action,
								entity_id,
								product_id,
								form_id,
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
		const [scheme, apiKey] = ctx.req.headers.authorization.split(' ');

		if (scheme !== 'Bearer' || !apiKey) {
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'Please provide a valid API key'
			});
		}

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

// Rate limiting
const getRequestIp = (req: Context['req']): string => {
	const xClientIp = req.headers['x-client-ip'] as string;
	const xForwardedFor = req.headers['x-forwarded-for'] as string;
	if (xClientIp) return xClientIp.split(',')[0].trim();
	if (xForwardedFor) return xForwardedFor.split(',')[0].trim();
	return defaultFingerPrint(req);
};

const hashIp = (ip: string): string => {
	const now = new Date();
	const dateHour = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
		2,
		'0'
	)}-${String(now.getDate()).padStart(2, '0')}-${String(
		now.getHours()
	).padStart(2, '0')}`;
	return crypto
		.createHash('sha256')
		.update(`${ip}-${dateHour}${process.env.IP_HASH_SALT || ''}`)
		.digest('hex');
};

const transformIp = (ip: string): string => {
	const parts = ip.split('.');
	if (parts.length !== 4) return ip;
	parts[3] = '0';
	return parts.join('.');
};

const allowedIps = (process.env.LIMITER_ALLOWED_IPS || '')
	.split(',')
	.map(s => s.trim())
	.filter(Boolean);

const ipToNumber = (ip: string): number =>
	ipaddr
		.parse(ip)
		.toByteArray()
		.reduce((acc, byte) => (acc << 8) + byte, 0);

const isIpAllowed = (ip: string): boolean =>
	allowedIps.some(allowedIp => {
		if (allowedIp.includes('-')) {
			const [startIp, endIp] = allowedIp.split('-');
			try {
				const ipNum = ipToNumber(ip);
				return ipNum >= ipToNumber(startIp) && ipNum <= ipToNumber(endIp);
			} catch {
				return false;
			}
		}
		return allowedIp === ip;
	});

const limiter = createTRPCStoreLimiter<typeof t>({
	fingerprint: ctx => getRequestIp(ctx.req),
	windowMs: 60000,
	max: 10,
	onLimit: async (retryAfter, ctx) => {
		const ip = getRequestIp(ctx.req);
		const hashedIp = hashIp(ip);
		const referer = (ctx.req.headers['referer'] ||
			ctx.req.headers['referrer']) as string | undefined;
		const now = new Date();

		try {
			const existing = await prisma.limiterReporting.findUnique({
				where: { ip_id: hashedIp }
			});

			if (existing) {
				await prisma.limiterReporting.update({
					where: { id: existing.id },
					data: {
						total_attempts: existing.total_attempts + 1,
						last_attempt: now
					}
				});
			} else {
				await prisma.limiterReporting.create({
					data: {
						ip_id: hashedIp,
						ip_adress: transformIp(ip),
						total_attempts: 10,
						first_attempt: now,
						last_attempt: now,
						url: referer ?? null
					}
				});
			}
		} catch (err) {
			console.error('[rate-limit] Failed to log abuse', err);
		}

		throw new TRPCError({
			code: 'TOO_MANY_REQUESTS',
			message: `Trop de requêtes, réessayez dans ${retryAfter}s.`
		});
	}
});

const bypassLimiterForAllowedIps = t.middleware(async ({ ctx, next }) => {
	const ip = getRequestIp(ctx.req);
	if (isIpAllowed(ip)) return next();
	return limiter({ ctx, next });
});

// Base router and middleware helpers
export const router = t.router;
export const middleware = t.middleware;

// Unprotected procedure
export const publicProcedure = t.procedure;

// Rate-limited public procedure (per IP)
export const limitedProcedure = t.procedure.use(bypassLimiterForAllowedIps);

// Protected procedure
export const protectedProcedure = t.procedure.use(isAuthed);

// Protected open-api procedure
export const protectedApiProcedure = t.procedure.use(isKeyAllowed);
