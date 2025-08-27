# Couverture des tests Cypress E2E

Dernière mise à jour : 2025-08-27

Ce document dresse l'inventaire des suites de tests end-to-end Cypress actuelles (`webapp-backoffice/cypress/e2e/jdma/**`).

## Gestion du compte

Fichier: `bo/account.cy.ts`

- change identity parameters
- change email : bad emails patterns should not work
- change email : different emails should not work
- change email : not whitelisted emails should not work
- change email : allready existing emails should not work
- change email : should work if everything OK
- delete account

Couverture fonctionnelle : Mise à jour du profil (nom), validation email (format, non correspondance, liste blanche, doublon, succès), suppression de compte et impossibilité de se connecter après suppression.

## Partie administration avancée (jdma-admin)

Fichier: `bo/admin.cy.ts`

- create and delete users
- create organisation
- invite admin on organisation
- create service
- register guest admin
- login guest admin

Couverture fonctionnelle : CRUD utilisateurs (création/suppression en lot), création d'organisation, flux d'invitation, création de service, inscription admin invité + vérification d'accès.

## Partie gestion des formulaires (jdma-forms)

Fichier: `bo/forms.cy.ts`

- should create multiple forms for a single service
- should create a button from the forms page
- should go to form review url from button copy then create a form review on first version of the first form
- should edit a form in builder (hide step, edit block, publish) and check changes from dashboard and on form review page
- should rename form

Couverture fonctionnelle : Création de formulaires (multiples), création de bouton, dépôt d'un avis utilisateur (toutes les étapes), édition de formulaire (contenu & visibilité d'étape), publication, renommage.

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

## Scénarios d'inscription (jdma-register)

Fichier: `bo/register.cy.ts`

- should display the agent public question first
- should show message for non-agent public users
  Contexte : Inscription agent public
  - should display the signup form for agent public
  - Password validation
    - should not submit the form if the password is too short
    - should not submit the form if the password lacks a special character
    - should not submit the form if the password lacks a digit
  - should submit the form WITH NOT whitelisted email
  - should allow toggling password visibility
  - should submit the form WITH whitelisted email (branching flow: existing vs new)

Couverture fonctionnelle : Filtrage d'inscription (agent vs non-agent), respect de la politique de mot de passe, gestion liste blanche / doublon email, bascule visibilité mot de passe, branchements post-inscription.

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

| Suite             | Fichier              | Tests | Thèmes clés                               |
| ----------------- | -------------------- | ----- | ----------------------------------------- |
| jdma-account      | bo/account.cy.ts     | 7     | Profil, validation email, suppression     |
| jdma-admin        | bo/admin.cy.ts       | 6     | Gestion utilisateurs, org, service, invit |
| jdma-forms        | bo/forms.cy.ts       | 5     | CRUD formulaires, bouton, publication     |
| jdma-home         | bo/home.cy.ts        | 11    | Page publique & navigation                |
| jdma-logs         | bo/logs.cy.ts        | 1     | État vide historique                      |
| jdma-register     | bo/register.cy.ts    | 11    | Inscription, politique mot de passe       |
| jdma-answer-check | bo/reviewCheck.cy.ts | 1     | Présence avis                             |
| jdma-users        | bo/users.cy.ts       | 8     | Cycle gestion des accès                   |
| jdma-form-review  | form/review.cy.ts    | 1     | Soumission complète formulaire            |

Nombre total de tests actifs : 51

---
