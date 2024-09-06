import { defineConfig } from 'cypress';

export default defineConfig({
	e2e: {
		reporter: 'spec',
		reporterOptions: {
		  toConsole: true
		},
		screenshotOnRunFailure: false,
		viewportWidth: 1280,
		viewportHeight: 720,
		setupNodeEvents(on, config) {},
		baseUrl: process.env.NEXTAUTH_URL
	}
});
