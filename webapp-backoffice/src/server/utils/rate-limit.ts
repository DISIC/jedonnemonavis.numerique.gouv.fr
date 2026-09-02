import { TRPCError } from '@trpc/server';

type Bucket = { hits: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Le store est en mémoire, donc par instance : c'est un garde-fou contre
// l'abus automatisé, pas une limite distribuée exacte.
const PRUNE_EVERY = 1000;
let sinceLastPrune = 0;

const prune = (now: number) => {
	for (const [key, bucket] of buckets) {
		if (bucket.resetAt <= now) buckets.delete(key);
	}
};

/**
 * Incrémente le compteur associé à `key` et lève TOO_MANY_REQUESTS au-delà de
 * `max` appels sur la fenêtre glissante.
 */
export const consumeRateLimit = ({
	key,
	max,
	windowMs
}: {
	key: string;
	max: number;
	windowMs: number;
}) => {
	const now = Date.now();

	if (++sinceLastPrune >= PRUNE_EVERY) {
		sinceLastPrune = 0;
		prune(now);
	}

	const bucket = buckets.get(key);

	if (!bucket || bucket.resetAt <= now) {
		buckets.set(key, { hits: 1, resetAt: now + windowMs });
		return;
	}

	bucket.hits += 1;

	if (bucket.hits > max) {
		throw new TRPCError({
			code: 'TOO_MANY_REQUESTS',
			message: `Too many requests, please try again in ${Math.ceil(
				(bucket.resetAt - now) / 1000
			)}s`
		});
	}
};
