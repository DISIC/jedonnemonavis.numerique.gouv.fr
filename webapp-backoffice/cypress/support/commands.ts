/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

import { Client, ClientConfig } from 'pg';
import { URL } from 'url'; // Importer le module URL pour analyser l'URL de connexion

// Déclare une extension de Cypress pour ajouter une commande personnalisée
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to check the PostgreSQL database connection.
       * @param dbUrl Database URL to extract configuration.
       * @example cy.checkDatabaseConnection('postgresql://user:password@localhost:5432/database')
       */
      checkDatabaseConnection(dbUrl: string): Chainable<boolean>;
    }
  }
}

// Ajoute la commande personnalisée à Cypress
Cypress.Commands.add('checkDatabaseConnection', (): Cypress.Chainable<boolean> => {

  const config: ClientConfig = {
    host: Cypress.env('DB_HOST') || 'localhost',
    port: Number(Cypress.env('DB_PORT')) || 5432,
    user: Cypress.env('DB_USER') || 'user',
    password: Cypress.env('DB_PASSWORD') || 'password',
    database: Cypress.env('DB_NAME') || 'jdma',
  };

  const client = new Client(config);

  return cy.wrap(
    client.connect()
      .then(() => client.query('SELECT 1'))
      .then(() => {
        client.end();
        return true;
      })
      .catch((error: Error) => {
        client.end();
        throw new Error(`Failed to connect to the database: ${error.message}`);
      })
  );
});

export {};