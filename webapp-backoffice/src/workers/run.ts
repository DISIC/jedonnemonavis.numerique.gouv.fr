import http from 'http';
import { startExportWorker } from './export-worker';

startExportWorker();

const PORT = parseInt(process.env.WORKER_PORT ?? '8080', 10);
http.createServer((_, res) => {
	res.writeHead(200);
	res.end('ok');
}).listen(PORT, () => {
	console.log(`[worker] HTTP server listening on port ${PORT}`);
});

process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));
