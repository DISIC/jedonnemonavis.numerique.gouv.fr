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
