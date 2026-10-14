import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClientSingleton = () => {
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
	redisGlobal: ReturnType<typeof redisClientSingleton>;
	failFastRedisGlobal: ReturnType<typeof failFastRedisClientSingleton>;
} & typeof global;

const redis = globalThis.redisGlobal ?? redisClientSingleton();

export const failFastRedis =
	globalThis.failFastRedisGlobal ?? failFastRedisClientSingleton();

export default redis;

if (process.env.NODE_ENV !== 'production') {
	globalThis.redisGlobal = redis;
	globalThis.failFastRedisGlobal = failFastRedis;
}
