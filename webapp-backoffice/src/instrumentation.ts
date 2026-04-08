export async function register() {
	// Only run in the Node.js server runtime, not during Edge or build phases
	if (process.env.NEXT_RUNTIME === 'nodejs') {
		const { startExportWorker } = await import('./workers/export-worker');
		startExportWorker();
	}
}
