import prisma from '@/src/utils/db';
import {
	NextApiHandler,
	NextApiRequest,
	NextApiResponse,
	type GetServerSidePropsContext
} from 'next';
import NextAuth, { getServerSession, type NextAuthOptions } from 'next-auth';
import { getToken } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { createRemoteJWKSet, decodeJwt, jwtVerify } from 'jose';
import { getSiretInfo } from '@/src/utils/queries';
import {
	getLegacyLoginUntil,
	isAuthTokenValid,
	isLegacyLoginEnabled,
	isMfaAcr,
	isSessionTokenAllowed,
	proconnectMfaClaims
} from '@/src/utils/proconnect';
import {
	generateUnusablePassword,
	linkLegacyAccountToProConnect,
	makeRelationFromUserInvite
} from '@/src/server/routers/user/utils';

const JWKS = createRemoteJWKSet(
	new URL(`https://${process.env.PROCONNECT_DOMAIN}/api/v2/jwks`)
);

interface ProconnectProfile {
	sub: string;
	email: string;
	given_name: string;
	usual_name: string;
	siret: string;
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

const signInWithProConnect = async (
	proconnectProfile: ProconnectProfile,
	req?: NextApiRequest
) => {
	if (!isMfaAcr(proconnectProfile.acr)) {
		throw new Error('MFA_REQUIRED');
	}

	const email = proconnectProfile.email?.toLowerCase();

	const currentToken = req
		? await getToken({ req, secret: process.env.JWT_SECRET })
		: null;
	const linkedFrom =
		currentToken?.legacy && currentToken.email && isAuthTokenValid(currentToken)
			? await linkLegacyAccountToProConnect(prisma, currentToken.email, email)
			: null;

	let dbUser = await prisma.user.findUnique({
		where: { email }
	});

	if (dbUser) {
		if (!dbUser.proconnect_account || !dbUser.active) {
			dbUser = await prisma.user.update({
				where: { id: dbUser.id },
				data: { proconnect_account: true, active: true }
			});
		}
	} else {
		try {
			const data = await getSiretInfo(proconnectProfile.siret);

			const etablissement = data.etablissement;
			const formeJuridique =
				etablissement.uniteLegale.categorieJuridiqueUniteLegale;

			if (formeJuridique.startsWith('7') || formeJuridique.startsWith('8')) {
				dbUser = await prisma.user.create({
					data: {
						email,
						firstName: proconnectProfile.given_name,
						lastName: proconnectProfile.usual_name,
						role: 'user',
						password: generateUnusablePassword(),
						notifications: true,
						notifications_frequency: 'weekly',
						active: true,
						xwiki_account: false,
						xwiki_username: null,
						proconnect_account: true
					}
				});
			} else {
				throw new Error('INVALID_PROVIDER');
			}
		} catch (err) {
			console.error('❌ Erreur :', err);
			throw new Error('INVALID_PROVIDER');
		}
	}

	await makeRelationFromUserInvite(prisma, email);

	await prisma.userEvent.create({
		data: {
			user_id: dbUser.id,
			action: 'user_signin',
			created_at: new Date(),
			metadata: linkedFrom ? { proconnect_linked_from: linkedFrom } : {}
		}
	});

	return true;
};

const createSignInCallback =
	(req?: NextApiRequest): NonNullable<NextAuthOptions['callbacks']>['signIn'] =>
	async ({ account, profile }) => {
		if (account?.provider === 'credentials') return true;
		if (account?.provider !== 'openid') return false;
		return signInWithProConnect(profile as ProconnectProfile, req);
	};

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
			if (token.email) {
				const user = await prisma.user.findUnique({
					where: { email: token.email }
				});

				if (user) {
					session.user = {
						...session.user,
						id: user.id.toString(),
						role: user.role,
						name: `${user.firstName} ${user.lastName}`,
						email: user.email,
						proconnect: user.proconnect_account === true
					};
				}
			}
			session.legacyLoginUntil = getLegacyLoginUntil();
			return session;
		},
		jwt: ({ token, user, account, profile }) => {
			if (account?.provider === 'openid' && profile) {
				const proconnectProfile = profile as ProconnectProfile;
				token.email = proconnectProfile.email?.toLowerCase();
				token.acr = proconnectProfile.acr;
			} else if (account?.provider === 'credentials' && user) {
				token.email = user.email;
				token.legacy = true;
			}
			if (!isSessionTokenAllowed(token)) {
				throw new Error('SESSION_NOT_ALLOWED');
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
		signIn: createSignInCallback()
	},
	providers: [
		CredentialsProvider({
			credentials: {},
			async authorize(credentials: Record<string, string> | undefined) {
				if (!isLegacyLoginEnabled()) {
					throw new Error('LEGACY_LOGIN_DISABLED');
				}

				if (!credentials) {
					throw new Error('Missing credentials');
				}

				const { email, password } = credentials;
				const user = await prisma.user.findUnique({
					where: { email: email.toLowerCase() }
				});

				if (!user || !user.active) {
					return null;
				}

				if (user.proconnect_account) {
					throw new Error('PROCONNECT_ACCOUNT');
				}

				let isPasswordCorrect = false;

				if (user.password.startsWith('$2b$')) {
					isPasswordCorrect = bcrypt.compareSync(password, user.password);
				} else {
					const hashedPassword = crypto
						.createHash('sha256')
						.update(password)
						.digest('hex');
					isPasswordCorrect = hashedPassword === user.password;
				}

				if (!isPasswordCorrect) {
					return null;
				}

				if (!user.password.startsWith('$2b$')) {
					const salt = bcrypt.genSaltSync(10);
					const newHashedPassword = bcrypt.hashSync(password, salt);
					await prisma.user.update({
						where: {
							id: user.id
						},
						data: {
							password: newHashedPassword
						}
					});
				}

				await prisma.userEvent.create({
					data: {
						user_id: user.id,
						action: 'user_signin',
						created_at: new Date(),
						metadata: {}
					}
				});

				return { ...user, name: user.firstName + ' ' + user.lastName };
			}
		}),

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
					scope: 'openid email given_name usual_name siret',
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
					lastName: profile.family_name,
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
					proconnect_account: false
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
) =>
	NextAuth(req, res, {
		...authOptions,
		callbacks: { ...authOptions.callbacks, signIn: createSignInCallback(req) }
	});

export default authHandler;
