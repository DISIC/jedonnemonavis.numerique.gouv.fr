import { startAlertWorker } from './alert-worker';

startAlertWorker();

// Keep the process alive; BullMQ workers handle their own event loop
process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));
