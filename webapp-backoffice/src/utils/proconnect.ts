import type { JWT } from 'next-auth/jwt';

export const CONTACT_EMAIL = 'contact.jdma@design.numerique.gouv.fr';

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

const DAY_MS = 24 * 60 * 60 * 1000;

export const getLegacyLoginUntil = (): string | null => {
	const value = process.env.LEGACY_LOGIN_UNTIL;
	if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
	const lastDay = Date.parse(value);
	if (Number.isNaN(lastDay) || Date.now() >= lastDay + DAY_MS) return null;
	return value;
};

export const isLegacyLoginEnabled = (): boolean =>
	getLegacyLoginUntil() !== null;

export const isSessionTokenAllowed = (token: JWT): boolean =>
	isMfaAcr(token.acr) || (token.legacy === true && isLegacyLoginEnabled());

export const isAuthTokenValid = (token: JWT | null): token is JWT =>
	!!token &&
	isSessionTokenAllowed(token) &&
	typeof token.exp === 'number' &&
	token.exp * 1000 > Date.now();
