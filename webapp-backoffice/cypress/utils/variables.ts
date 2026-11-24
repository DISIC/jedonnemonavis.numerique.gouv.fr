const appUrl = Cypress.env('app_base_url');
const appFormUrl = Cypress.env('app_form_base_url');
const adminEmail = Cypress.env('admin_user_mail');
const mailerUrl = Cypress.env('mailer_base_url');
const invitedEmail = Cypress.env('admin_guest_mail');
const invitedEmailBis = Cypress.env('admin_guest_mail_bis');
const firstNameTest = 'Stevie';
const lastNameTest = 'Wonder';
const latestNewsVersion = 4;

const userSettings = {
	newsVersionSeen: latestNewsVersion,
	formHelpModalSeen: true,
	newsModalSeen: true,
	newsPageSeen: true
};

export {
	appUrl,
	appFormUrl,
	adminEmail,
	mailerUrl,
	invitedEmail,
	invitedEmailBis,
	firstNameTest,
	lastNameTest,
	latestNewsVersion,
	userSettings
};
