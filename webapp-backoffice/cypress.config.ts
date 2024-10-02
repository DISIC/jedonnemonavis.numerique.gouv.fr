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
		  // Définir la tâche `checkDatabaseConnection`
		  on('task', {
			async checkDatabaseConnection(dbConfig: ClientConfig) {
			  const client = new Client(dbConfig);
			  try {
				await client.connect();
				await client.query('SELECT 1');
				await client.end();
				return true;
			  } catch (error) {
				await client.end();
				throw new Error(`Failed to connect to the database: ${error.message}`);
			  }
			},
		  });
	
		  return config;
		},
		baseUrl: process.env.NEXTAUTH_URL
	}
});
