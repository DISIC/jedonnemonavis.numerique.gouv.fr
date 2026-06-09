module.exports = {
	ci: {
		collect: {
			startServerCommand: 'npm run start',
			startServerReadyPattern: 'ready on',
			url: ['http://localhost:3000'],
			numberOfRuns: 1,
			settings: {
				preset: 'desktop'
			}
		},
		assert: {
			preset: 'lighthouse:no-pwa',
			assertions: {
				'csp-xss': 'off',
				'unused-css-rules': 'off',
				'unused-javascript': 'off',
				'errors-in-console': 'off'
			}
		},
		upload: {
			target: 'temporary-public-storage'
		},
		server: {}
	}
};
