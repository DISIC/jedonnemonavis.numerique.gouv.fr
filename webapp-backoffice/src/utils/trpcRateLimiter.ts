import { defineTRPCLimiter } from '@trpc-limiter/core';

type HitInfo = {
	totalHits: number;
	resetTime: Date;
};

class MemoryStore {
	private hits: Map<string, HitInfo>;

	constructor(private windowMs: number) {
		this.hits = new Map();
	}

	async increment(fingerPrint: string): Promise<HitInfo> {
		const now = Date.now();
		const existing = this.hits.get(fingerPrint);

		if (!existing || now > existing.resetTime.getTime()) {
			const fresh = {
				totalHits: 1,
				resetTime: new Date(now + this.windowMs * 10)
			};
			this.hits.set(fingerPrint, fresh);
			return fresh;
		}

		existing.totalHits += 1;
		this.hits.set(fingerPrint, existing);
		return existing;
	}
}

export const createTRPCStoreLimiter = defineTRPCLimiter({
	store: opts => new MemoryStore(opts.windowMs),
	isBlocked: async (store, fingerPrint, opts) => {
		const { totalHits, resetTime } = await store.increment(fingerPrint);
		if (totalHits > opts.max) {
			return Math.ceil((resetTime.getTime() - Date.now()) / 1000);
		}
		return null;
	}
});
