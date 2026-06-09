import http from 'http';

export function startHealthServer(label: string): void {
	const PORT = parseInt(process.env.WORKER_PORT ?? '8080', 10);
	http
		.createServer((_, res) => {
			res.writeHead(200);
			res.end('ok');
		})
		.listen(PORT, () => {
			console.log(`[${label}] HTTP server listening on port ${PORT}`);
		});
}

export function registerShutdownHandlers(): void {
	process.on('SIGTERM', () => process.exit(0));
	process.on('SIGINT', () => process.exit(0));
}
