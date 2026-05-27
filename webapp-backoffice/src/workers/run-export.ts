import { startExportWorker } from './export-worker';
import { registerShutdownHandlers, startHealthServer } from './shared';

startExportWorker();
startHealthServer('export-worker');
registerShutdownHandlers();
