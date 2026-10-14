# Couverture des tests Cypress E2E

Dernière mise à jour : 2026-09-30

Ce document dresse l'inventaire des suites de tests end-to-end Cypress actuelles (`webapp-backoffice/cypress/e2e/jdma/**`).

## Authentification dans les tests

La connexion au backoffice se fait uniquement via ProConnect, qui ne peut pas tourner en CI. Les tests ne passent donc pas par l'écran de login. Le helper `login(email)` (`cypress/utils/helpers/common.ts`) appelle la tâche `auth:signIn` (`cypress/plugins/auth-tasks.ts`), qui :

- reproduit ce que fait une connexion ProConnect : compte marqué `proconnect_account`, invitations rattachées par email, création du compte si `firstName` et `lastName` sont fournis ;
- fabrique un cookie de session NextAuth avec un `acr` de double authentification. Le jeton est chiffré avec `JWT_SECRET`, lu dans le `.env` du backoffice.

La session est mise en cache par utilisateur via `cy.session`. L'écran de login lui-même est couvert par `public/login.cy.ts`.

## Gestion du compte

Fichier: `bo/account.cy.ts`

- change identity parameters
- shows the ProConnect email as read-only credentials
- delete account

Couverture fonctionnelle : Mise à jour du profil (nom), email ProConnect en lecture seule (pas de modification d'email ni de mot de passe), suppression de compte.

## Partie administration avancée (jdma-admin)

Fichier: `bo/admin.cy.ts`

- create and delete users
- create organisation
- invite admin on organisation
- create service
- guest admin first ProConnect login gets the invited rights

Couverture fonctionnelle : CRUD utilisateurs (création/suppression en lot), création d'organisation, flux d'invitation (email avec lien `/login`), création de service, première connexion ProConnect de l'admin invité + vérification d'accès.

## Partie gestion des formulaires (jdma-forms)

Fichier: `bo/forms.cy.ts`

- should create multiple forms for a single service
- should create a button from the forms page
- should go to form review url from button copy then create a form review on first version of the first form
- should edit a form in builder (hide step, edit block, publish) and check changes from dashboard and on form review page
- should rename form

Couverture fonctionnelle : Création de formulaires (multiples), création de lien d'intégration, dépôt d'un avis utilisateur (toutes les étapes), édition de formulaire (contenu & visibilité d'étape), publication, renommage.

## Page d'accueil (jdma-home)

Fichier: `bo/home.cy.ts`

- Navbar
  - should display the correct navbar logo and title
  - should redirect to the home page when the logo is clicked
  - should redirect to the login page
- Body
  - should display the correct title, subtitle and image
  - should have 4 steps and redirect correctly
  - should redirect to user reviews page
  - should toggle accordion content visibility
- Footer
  - should display the correct footer logo
  - should display and verify footer internal links

Couverture fonctionnelle : Éléments d'interface de la page d'accueil publique, liens de navigation, comportement des accordéons, présence des liens de pied de page.

## Page historique d'événements d'un service (jdma-logs)

Fichier: `bo/logs.cy.ts`

- should display the logs page with no events

Couverture fonctionnelle : Accessibilité de la page d'historique et état vide.

## Écran de connexion (jdma-login)

Fichier: `public/login.cy.ts`

- should pass a11y checks
- only offers ProConnect, with the security notice and contact
- starts the ProConnect flow with the requested callback
- explains a ProConnect login without MFA
- redirects the removed sign-up and password pages to the login
- sends anonymous visitors of the back-office to the login
- rejects sessions without ProConnect MFA
- accepts a session with ProConnect MFA

Couverture fonctionnelle : Mire ProConnect seule avec encart sécurité et contact, démarrage du flux OIDC (requête interceptée), message `MFA_REQUIRED`, redirection des anciennes pages d'inscription et de mot de passe, protection du backoffice, rejet des sessions sans `acr` de double authentification.

## Onboarding d'un nouvel agent (jdma-onboarding)

Fichier: `bo/onboarding.cy.ts`

- lets a new agent onboard after a first ProConnect login

Couverture fonctionnelle : Création du compte à la première connexion ProConnect, puis parcours d'onboarding complet (service, accès, formulaire, lien d'intégration).

## Vérification des réponses (jdma-answer-check)

Fichier: `bo/reviewCheck.cy.ts`

- should the test answer exist

Couverture fonctionnelle : Présence d'au moins un indicateur de réponse sur le tableau de bord.

## Gestion des utilisateurs (jdma-users)

Fichier: `bo/users.cy.ts`

- should create a service and attach an organization
- should navigate to created product access page
- should display service administrators
- should display organization administrators
- should invite an administrator
- should display the invited user
- should navigate to the user page, verify if the user is admin and then remove the access
- should have removed the user

Couverture fonctionnelle : Création de service (redondant avec la suite admin partiellement), rattachement d'organisation, visualisation des administrateurs, invitation utilisateur avec rôle, vérification de la présence de l'invitation, navigation vers détail utilisateur, cycle de révocation d'accès.

## Tester l'envoi d'un avis (jdma-form-review)

Fichier: `form/review.cy.ts`

- Remplir le formulaire (couvre les étapes 1–4)

Couverture fonctionnelle : Complétion du formulaire utilisateur final sur toutes les étapes.

---

## Tableau récapitulatif

| Suite             | Fichier              | Tests | Thèmes clés                                       |
| ----------------- | -------------------- | ----- | ------------------------------------------------- |
| jdma-account      | bo/account.cy.ts     | 3     | Profil, email ProConnect, suppression             |
| jdma-admin        | bo/admin.cy.ts       | 5     | Gestion utilisateurs, org, service, invit         |
| jdma-forms        | bo/forms.cy.ts       | 5     | CRUD formulaires, lien d'intégration, publication |
| jdma-home         | bo/home.cy.ts        | 11    | Page publique & navigation                        |
| jdma-logs         | bo/logs.cy.ts        | 1     | État vide historique                              |
| jdma-login        | public/login.cy.ts   | 8     | Mire ProConnect, erreurs, sessions sans 2FA       |
| jdma-onboarding   | bo/onboarding.cy.ts  | 1     | Première connexion ProConnect + onboarding        |
| jdma-answer-check | bo/reviewCheck.cy.ts | 1     | Présence avis                                     |
| jdma-users        | bo/users.cy.ts       | 8     | Cycle gestion des accès                           |
| jdma-form-review  | form/review.cy.ts    | 1     | Soumission complète formulaire                    |

Nombre total de tests actifs : 44

---
