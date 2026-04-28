import IORedis from 'ioredis';

const redisClientSingleton = () => {
	const url = process.env.REDIS_URL || 'redis://localhost:6379';
	return new IORedis(url, {
		maxRetriesPerRequest: null, // required by BullMQ
	});
};

declare const globalThis: {
	redisGlobal: ReturnType<typeof redisClientSingleton>;
} & typeof global;

const redis = globalThis.redisGlobal ?? redisClientSingleton();

export default redis;

if (process.env.NODE_ENV !== 'production') globalThis.redisGlobal = redis;
