import { startExportWorker } from './export-worker';

startExportWorker();

// Keep the process alive; BullMQ worker handles its own event loop
process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));
