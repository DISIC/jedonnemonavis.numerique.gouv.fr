import { defineTRPCLimiter } from "@trpc-limiter/core";

type HitInfo = {
  totalHits: number;
  resetTime: Date;
};

class MemoryStore {
  private hits: Map<string, HitInfo>;

  constructor() {
    this.hits = new Map();
  }

  async increment(fingerPrint: string): Promise<HitInfo> {
    const now = Date.now();
    const resetTime = new Date(now + 60 * 60 * 1000); // now + 1 hour in milliseconds

    const hitInfo = this.hits.get(fingerPrint) || { totalHits: 0, resetTime };

    if (now > hitInfo.resetTime.getTime()) {
      // Reset the hit count if the window has passed
      hitInfo.totalHits = 1;
      hitInfo.resetTime = resetTime;
    } else {
      // Increment the hit count if within the window
      hitInfo.totalHits += 1;
    }

    this.hits.set(fingerPrint, hitInfo);
    return hitInfo;
  }
}

export const createTRPCStoreLimiter = defineTRPCLimiter({
  store: () => new MemoryStore(),
  isBlocked: async (store, fingerPrint, opts) => {
    const { totalHits, resetTime } = await store.increment(fingerPrint);
    if (totalHits > opts.max) {
      return Math.ceil((resetTime.getTime() - Date.now()) / 1000);
    }
    return null; // if request should not be blocked, return null
  },
});
