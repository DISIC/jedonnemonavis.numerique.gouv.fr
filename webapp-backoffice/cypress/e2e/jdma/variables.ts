const appUrl = Cypress.env('app_base_url');
const appFormUrl = Cypress.env('app_form_base_url');
const adminEmail = Cypress.env('admin_user_mail');
const adminPassword = Cypress.env('admin_user_password');
const userPassword = Cypress.env('user_password');
const mailerUrl = Cypress.env('mailer_base_url');
const invitedEmail = Cypress.env('admin_guest_mail');
const invitedEmailBis = Cypress.env('admin_guest_mail_bis');

export {
	appUrl,
	appFormUrl,
	adminEmail,
	adminPassword,
	userPassword,
	mailerUrl,
	invitedEmail,
	invitedEmailBis
};
