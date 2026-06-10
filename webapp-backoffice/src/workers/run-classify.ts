// Load .env for local dev (no-op in prod, where env vars are injected directly). Must run
// before importing modules that read process.env at load time (e.g. lib/redis).
import 'dotenv/config';
import { startClassificationWorker } from './classification-worker';
import { registerShutdownHandlers, startHealthServer } from './shared';

startClassificationWorker();
startHealthServer('classification-worker');
registerShutdownHandlers();
