import IORedis from 'ioredis';

// Redis is optional: it only backs BullMQ queues/workers (exports, alerts,
// classification). When REDIS_URL is not set — e.g. on a dev environment with no
// Redis addon — we return null instead of falling back to localhost, which would
// otherwise trigger an endless ECONNREFUSED reconnection loop and buffer jobs in
// memory forever. Consumers (queue.ts, producers) degrade gracefully on null.
const redisClientSingleton = (): IORedis | null => {
	const url = process.env.REDIS_URL;
	if (!url) {
		console.warn(
			'[redis] REDIS_URL is not set — Redis-backed features (queues) are disabled.'
		);
		return null;
	}
	return new IORedis(url, {
		maxRetriesPerRequest: null // required by BullMQ
	});
};

declare const globalThis: {
	redisGlobal?: IORedis | null;
} & typeof global;

// Use a presence check rather than ?? so a legitimately-null client is memoized
// (and we don't re-run the singleton — and re-log the warning — on every import).
const redis =
	globalThis.redisGlobal !== undefined
		? globalThis.redisGlobal
		: redisClientSingleton();

export default redis;

if (process.env.NODE_ENV !== 'production') globalThis.redisGlobal = redis;
