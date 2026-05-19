import { startAlertWorker } from './alert-worker';
import { startExportWorker } from './export-worker';
import { registerShutdownHandlers, startHealthServer } from './shared';

startAlertWorker();
startExportWorker();
startHealthServer('workers');
registerShutdownHandlers();
