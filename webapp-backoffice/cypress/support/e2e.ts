// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

Cypress.on('window:before:load', win => {
	cy.stub(win.console, 'log').callsFake(msg => {
		console.log('Console log:', msg);
	});

	cy.stub(win.console, 'error').callsFake(msg => {
		console.error('Console error:', msg);
	});

	cy.stub(win.console, 'warn').callsFake(msg => {
		console.warn('Console warning:', msg);
	});
});

// Alternatively you can use CommonJS syntax:
// require('./commands')
import './commands/review';
