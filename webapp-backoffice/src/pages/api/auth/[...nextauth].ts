import prisma from '@/src/utils/db';
import {
	NextApiHandler,
	NextApiRequest,
	NextApiResponse,
	type GetServerSidePropsContext
} from 'next';
import NextAuth, { getServerSession, type NextAuthOptions } from 'next-auth';
import { createRemoteJWKSet, decodeJwt, jwtVerify } from 'jose';
import { isMfaAcr, proconnectMfaClaims } from '@/src/utils/proconnect';
import { signInProConnectUser } from '@/src/server/utils/proconnect-account';

const JWKS = createRemoteJWKSet(
	new URL(`https://${process.env.PROCONNECT_DOMAIN}/api/v2/jwks`)
);

interface ProconnectProfile {
	sub: string;
	email: string;
	given_name: string;
	usual_name: string;
	chorusdt?: string;
	organizational_unit?: string;
	idp_id?: string;
	acr?: string;
}

const useSecureCookies = (process.env.NEXTAUTH_URL ?? '').startsWith(
	'https://'
);
const cookiePrefix = useSecureCookies ? '__Secure-' : '';
const hostPrefix = useSecureCookies ? '__Host-' : '';

export const authOptions: NextAuthOptions = {
	debug: process.env.NODE_ENV === 'development',
	secret: process.env.NEXTAUTH_SECRET,
	pages: {
		signIn: '/login',
		signOut: '/login',
		error: '/login'
	},
	useSecureCookies,
	cookies: {
		sessionToken: {
			name: `${cookiePrefix}next-auth.session-token`,
			options: {
				httpOnly: true,
				sameSite: 'lax',
				path: '/',
				secure: useSecureCookies
			}
		},
		callbackUrl: {
			name: `${cookiePrefix}next-auth.callback-url`,
			options: {
				sameSite: 'lax',
				path: '/',
				secure: useSecureCookies
			}
		},
		csrfToken: {
			name: `${hostPrefix}next-auth.csrf-token`,
			options: {
				httpOnly: true,
				sameSite: 'lax',
				path: '/',
				secure: useSecureCookies
			}
		}
	},
	callbacks: {
		async session({ session, token }) {
			const user = token.email
				? await prisma.user.findUnique({ where: { email: token.email } })
				: null;

			if (!user?.active) throw new Error('ACCOUNT_DISABLED');

			session.user = {
				...session.user,
				id: user.id.toString(),
				role: user.role,
				name: `${user.firstName} ${user.lastName}`,
				email: user.email
			};
			return session;
		},
		jwt: ({ token, account, profile }) => {
			if (account?.provider === 'openid' && profile) {
				const proconnectProfile = profile as ProconnectProfile;
				token.email = proconnectProfile.email?.toLowerCase();
				token.acr = proconnectProfile.acr;
			}
			if (!isMfaAcr(token.acr)) {
				throw new Error('MFA_REQUIRED');
			}
			return token;
		},
		async redirect({ url, baseUrl }) {
			if (url.startsWith('/')) {
				return `${baseUrl}${url}`;
			}
			try {
				const target = new URL(url);
				const base = new URL(baseUrl);
				if (target.protocol === base.protocol && target.host === base.host) {
					return target.toString();
				}
			} catch {}
			return baseUrl;
		},

		async signIn({ account, profile }) {
			if (account?.provider !== 'openid') return false;

			const proconnectProfile = profile as ProconnectProfile;

			if (!isMfaAcr(proconnectProfile.acr)) {
				throw new Error('MFA_REQUIRED');
			}

			if (!proconnectProfile.email) throw new Error('EMAIL_MISSING');

			const user = await signInProConnectUser(prisma, {
				email: proconnectProfile.email,
				firstName: proconnectProfile.given_name,
				lastName: proconnectProfile.usual_name
			});

			if (!user) throw new Error('ACCOUNT_DISABLED');

			return true;
		}
	},
	providers: [
		// Provider Proconnect (OpenID)
		{
			id: 'openid',
			name: 'ProConnect',
			type: 'oauth',
			issuer: `https://${process.env.PROCONNECT_DOMAIN}/api/v2`,
			wellKnown: `https://${process.env.PROCONNECT_DOMAIN}/api/v2/.well-known/openid-configuration`,
			authorization: {
				url: `https://${process.env.PROCONNECT_DOMAIN}/api/v2/authorize`,
				params: {
					scope: 'openid email given_name usual_name',
					claims: proconnectMfaClaims
				}
			},
			token: `https://${process.env.PROCONNECT_DOMAIN}/api/v2/token`,
			userinfo: {
				url: `https://${process.env.PROCONNECT_DOMAIN}/api/v2/userinfo`,
				async request({ tokens }): Promise<Record<string, any>> {
					const res = await fetch(
						`https://${process.env.PROCONNECT_DOMAIN}/api/v2/userinfo`,
						{
							headers: {
								Authorization: `Bearer ${tokens.access_token}`
							}
						}
					);

					const responseText = await res.text();

					let data: Record<string, any>;

					try {
						data = JSON.parse(responseText);
					} catch (error) {
						const { payload } = await jwtVerify(responseText, JWKS, {
							issuer: `https://${process.env.PROCONNECT_DOMAIN}/api/v2`,
							audience: process.env.PROCONNECT_CLIENT_ID
						});
						data = payload as Record<string, any>; // 🔥 Décode JWT
					}
					return {
						...data,
						acr: tokens.id_token ? decodeJwt(tokens.id_token).acr : undefined
					};
				}
			},
			clientId: process.env.PROCONNECT_CLIENT_ID,
			clientSecret: process.env.PROCONNECT_CLIENT_SECRET,
			idToken: true,
			checks: ['nonce', 'state'],
			profile(profile) {
				return {
					id: profile.sub,
					email: profile.email,
					name: `${profile.given_name} ${profile.usual_name}`.trim(),
					firstName: profile.given_name,
					lastName: profile.usual_name,
					active: true,
					xwiki_account: false,
					xwiki_username: null,
					password: '',
					role: 'user',
					notifications: false,
					notifications_frequency: 'daily',
					alerts_enabled: true,
					created_at: new Date(),
					updated_at: new Date(),
					proconnect_account: true
				};
			}
		}
	],

	session: {
		strategy: 'jwt',
		maxAge: 24 * 60 * 60
	},

	jwt: {
		secret: process.env.JWT_SECRET
	}
};

export const getServerAuthSession = (ctx: {
	req: GetServerSidePropsContext['req'];
	res: GetServerSidePropsContext['res'];
}) => {
	return getServerSession(ctx.req, ctx.res, authOptions);
};

const authHandler: NextApiHandler = (
	req: NextApiRequest,
	res: NextApiResponse
) => NextAuth(req, res, authOptions);

export default authHandler;
