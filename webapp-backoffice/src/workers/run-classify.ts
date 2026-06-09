import { startClassificationWorker } from './classification-worker';
import { registerShutdownHandlers, startHealthServer } from './shared';

startClassificationWorker();
startHealthServer('classification-worker');
registerShutdownHandlers();
