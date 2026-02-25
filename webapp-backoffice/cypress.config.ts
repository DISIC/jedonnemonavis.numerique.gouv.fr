import { defineConfig } from 'cypress';

export default defineConfig({
	e2e: {
		reporter: 'spec',
		reporterOptions: {
			toConsole: true
		},
		defaultCommandTimeout: 10000,
		screenshotOnRunFailure: false,
		viewportWidth: 1280,
		viewportHeight: 720,
		projectId: process.env.CYPRESS_PROJECT_ID,
		// La méthode `setupNodeEvents` est utilisée pour définir des événements Node côté serveur
		setupNodeEvents(on, config) {
			on('task', {
				log(message) {
					console.log(message);
					return null;
				},
				table(message) {
					console.table(message);

					return null;
				}
			});
		},

		baseUrl: process.env.NEXTAUTH_URL
	}
});
