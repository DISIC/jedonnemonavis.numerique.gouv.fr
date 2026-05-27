import { startAlertWorker } from './alert-worker';
import { registerShutdownHandlers, startHealthServer } from './shared';

startAlertWorker();
startHealthServer('alert-worker');
registerShutdownHandlers();
