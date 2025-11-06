export const selectors = {
	header: 'header',
	navbarLogo: '.fr-logo',
	navbarTitle: 'Je donne mon avis',
	navbarSubtitle: 'La voix de vos usagers',
	loginLink: '.fr-header__tools',
	bodyTitle: 'h1',
	subtitle: 'p',
	image: '[class*="HomeHeader-image"] > img',
	stepsContainer: '[class*="HomeStepper-container"]',
	actionButton: '[class*="HomeActionButton-container"]',
	accordionGroup: '.fr-accordions-group .fr-accordion__item',
	footer: 'footer',
	footerLinks: '.fr-footer__bottom-list',
	footerLogo: '.fr-logo',
	loginForm: {
		email: 'input[name="email"]',
		password: 'input[type="password"]',
		continueButton: '[class*="LoginForm-button"]'
	},
	signupForm: {
		firstName: 'input[name="firstName"]',
		lastName: 'input[name="lastName"]',
		email: 'input[name="email"]',
		password: 'input[type="password"]',
		submitButton: 'button[type="submit"]'
	},
	accountForm: {
		firstName: 'input[name="firstName"]',
		lastName: 'input[name="lastName"]',
		email: 'input[name="email"]',
		emailConfirmation: 'input[name="emailConfirmation"]',
		confirm: 'input[name="word"]'
	},
	input: {
		checkbox: 'input[type="checkbox"]'
	},
	url: {
		productTestService: '/administration/dashboard/product/4/forms',
		products: '/administration/dashboard/products',
		entities: '/administration/dashboard/entities',
		users: '/administration/dashboard/users',
		newLink: '/administration/dashboard/product/4/forms/4/new-link'
	},
	dashboard: {
		nameTestOrga: 'e2e-jdma-entity-test',
		nameTestService: 'e2e-jdma-service-test',
		nameTestForm1: 'e2e-jdma-form-test-1',
		nameTestForm2: 'e2e-jdma-form-test-2',
		renamedTestForm: 'e2e-jdma-form-test-renamed'
	},
	formBuilder: {
		modifiedIntroductionText: 'Modification du texte introductif.'
	},
	modal: {
		product: 'dialog#product-modal',
		entity: 'dialog#entity-modal',
		button: 'dialog#button-modal',
		renameForm: 'dialog#rename-form-modal',
		publishForm: 'dialog#form-publish-modal'
	},
	modalFooter: '.fr-modal__footer',
	productLink: '[class*="productLink"]',
	productForm: '#product-form',
	formCreation: '#form-creation-form',
	sideMenu: {
		menu: 'nav.fr-sidemenu',
		menuItem: 'li.fr-sidemenu__item'
	},
	errorMessages: '.fr-messages-group',
	passwordInput: 'input.fr-password__input',
	passwordToggle: 'label[for*="toggle-show"]',
	modalHeader: '.fr-modal__header',
	card: {
		identity: 'Identité',
		credentials: 'Identifiants de connexion'
	},
	menu: {
		account: 'Informations personnelles'
	},
	action: {
		save: 'Sauvegarder',
		modify: 'Modifier',
		delete: 'Supprimer le compte',
		confirmDelete: 'Supprimer',
		confirm: 'Confirmer'
	},
	onboarding: {
		actionsContainer: '#onboarding-actions'
	}
};
