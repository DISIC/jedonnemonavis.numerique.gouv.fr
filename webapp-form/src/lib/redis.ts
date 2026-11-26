import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Redis is optional: it only backs BullMQ queues/workers (exports, alerts,
// classification). When REDIS_URL is not set — e.g. a dev environment with no
// Redis addon — the main client is null instead of falling back to localhost, which
// would otherwise trigger an endless ECONNREFUSED reconnection loop and buffer jobs
// in memory forever. Consumers (queue.ts, producers) degrade gracefully on null.
const redisClientSingleton = (): IORedis | null => {
	if (!process.env.REDIS_URL) {
		console.warn(
			'[redis] REDIS_URL is not set — Redis-backed features (queues) are disabled.'
		);
		return null;
	}
	return new IORedis(redisUrl, {
		maxRetriesPerRequest: null // required by BullMQ
	});
};

const failFastRedisClientSingleton = () => {
	return new IORedis(redisUrl, {
		maxRetriesPerRequest: 1,
		enableOfflineQueue: false,
		commandTimeout: 2000
	});
};

declare const globalThis: {
	redisGlobal?: ReturnType<typeof redisClientSingleton>;
	failFastRedisGlobal?: ReturnType<typeof failFastRedisClientSingleton>;
} & typeof global;

// Use a presence check rather than ?? so a legitimately-null client is memoized
// (and we don't re-run the singleton — and re-log the warning — on every import).
const redis =
	globalThis.redisGlobal !== undefined
		? globalThis.redisGlobal
		: redisClientSingleton();

export const failFastRedis =
	globalThis.failFastRedisGlobal ?? failFastRedisClientSingleton();

export default redis;

if (process.env.NODE_ENV !== 'production') {
	globalThis.redisGlobal = redis;
	globalThis.failFastRedisGlobal = failFastRedis;
}
