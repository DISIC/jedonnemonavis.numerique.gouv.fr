import type { JWT } from 'next-auth/jwt';

export const PROCONNECT_MFA_ACR_VALUES = [
	'eidas0-mfa',
	'eidas1-mfa',
	'eidas2',
	'eidas3'
];

export const proconnectMfaClaims = JSON.stringify({
	id_token: {
		acr: { essential: true, values: PROCONNECT_MFA_ACR_VALUES }
	}
});

export const isMfaAcr = (acr: unknown): boolean =>
	typeof acr === 'string' && PROCONNECT_MFA_ACR_VALUES.includes(acr);

export const isAuthTokenValid = (token: JWT | null): token is JWT =>
	!!token &&
	isMfaAcr(token.acr) &&
	typeof token.exp === 'number' &&
	token.exp * 1000 > Date.now();

export const isProConnectNoticeVisible = (): boolean => {
	const lastDay = process.env.PROCONNECT_NOTICE_UNTIL;
	if (!lastDay || !/^\d{4}-\d{2}-\d{2}$/.test(lastDay)) return true;
	return new Date().toISOString().slice(0, 10) <= lastDay;
};

export const getProConnectLoginError = (
	error: unknown
): { title: string; description: string } | null => {
	if (typeof error !== 'string' || !error) return null;
	if (error === 'MFA_REQUIRED')
		return {
			title: 'Double authentification requise',
			description:
				"Vous ne pouvez pas accéder au service sans avoir une double authentification installée. Veuillez installer une application d'authentification et vous connecter à nouveau."
		};
	if (error === 'ACCOUNT_DISABLED')
		return {
			title: 'Compte désactivé',
			description:
				"Votre compte Je donne mon avis a été désactivé. Contactez l'équipe Je donne mon avis si vous pensez qu'il s'agit d'une erreur."
		};
	if (error === 'EMAIL_MISSING')
		return {
			title: 'Adresse e-mail introuvable',
			description:
				"ProConnect n'a pas transmis votre adresse e-mail professionnelle. Veuillez vous reconnecter. Si le problème persiste, contactez l'équipe Je donne mon avis."
		};
	return {
		title: 'Connexion impossible',
		description:
			'La connexion avec ProConnect a échoué. Veuillez réessayer dans quelques instants.'
	};
};
