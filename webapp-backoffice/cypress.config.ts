import { defineConfig } from 'cypress';
import { Client, ClientConfig } from 'pg';

export default defineConfig({
	e2e: {
		reporter: 'spec',
		reporterOptions: {
			toConsole: true
		},
		screenshotOnRunFailure: false,
		viewportWidth: 1280,
		viewportHeight: 720,
		// La méthode `setupNodeEvents` est utilisée pour définir des événements Node côté serveur
		setupNodeEvents(on, config) {
			on('task', {
				log(message) {
					console.log(message);
					return null;
				}
			});
		},
		retries: { runMode: 3, openMode: 3 },
		baseUrl: process.env.NEXTAUTH_URL
	}
});
