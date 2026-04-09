export async function register() {
	// In dev the worker runs as a separate process (yarn dev:worker) for hot-reload support
	if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.NODE_ENV !== 'development') {
		const { startExportWorker } = await import('./workers/export-worker');
		startExportWorker();
	}
}
