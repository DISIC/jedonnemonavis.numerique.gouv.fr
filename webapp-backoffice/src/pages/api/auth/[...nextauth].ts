import prisma from '@/src/utils/db';
import crypto from 'crypto';
import {
	NextApiHandler,
	NextApiRequest,
	NextApiResponse,
	type GetServerSidePropsContext
} from 'next';
import NextAuth, { getServerSession, type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';

interface ProconnectProfile {
	sub: string;
	email: string;
	given_name: string;
	family_name: string;
}

console.log('PROCONNECT_CLIENT_ID', process.env.PROCONNECT_CLIENT_ID)
console.log('PROCONNECT_CLIENT_SECRET', process.env.PROCONNECT_CLIENT_SECRET)
console.log('PROCONNECT_DOMAIN', process.env.PROCONNECT_DOMAIN)

export const authOptions: NextAuthOptions = {
	debug: true,
	secret: process.env.NEXTAUTH_SECRET,
	pages: {
		signIn: '/login',
		signOut: '/login',
		error: '/login' // Error code passed in query string as ?error=
	},
	callbacks: {
		async session({ session, token }) {
			// Récupère les informations utilisateur en base de données
			if (token.uid) {
				const user = await prisma.user.findUnique({
					where: { email: token.email as string }
				});
				if (user) {
					session.user = {
						...session.user,
						id: user.id.toString(),
						role: user.role,
						name: `${user.firstName} ${user.lastName}`,
						email: user.email
					};
				}
			}
			return session;
		},
		jwt: ({ user, token, account, profile }) => {
			console.log('🔗 JWT CALLBACK:', { user, token, account, profile });
			if (account?.provider === 'openid' && profile) {
				const proconnectProfile = profile as {
					email: string;
					given_name: string;
					family_name: string;
				};
				// Cas ProConnect
				token.email = profile.email;
				token.firstName = proconnectProfile.given_name;
				token.lastName = proconnectProfile.family_name;
				token.provider = 'proconnect';
			} else if (user) {
				// Cas CredentialsProvider (classique)
				token.uid = user.id;
				token.role = user.role;
				token.email = user.email;
			}
			return token;
		},
		async redirect({ url, baseUrl }) {
		  if (url.startsWith(baseUrl)) {
			return url;
		  }
		  return baseUrl;
		},

		async signIn({ account, profile }) {
			if (account?.provider === 'proconnect') {
				const proconnectProfile = profile as ProconnectProfile;
		
				const email = proconnectProfile.email?.toLowerCase();
		
				let user = await prisma.user.findUnique({
					where: { email }
				});

				const salt = bcrypt.genSaltSync(10);
				const newHashedPassword = bcrypt.hashSync('changeme', salt);
		
				if (!user) {
					user = await prisma.user.create({
						data: {
							email,
							firstName: proconnectProfile.given_name,
							lastName: proconnectProfile.family_name,
							role: 'user',
							password: newHashedPassword,
							notifications: false,
							notifications_frequency: 'daily',
							active: true,
							xwiki_account: false,
							xwiki_username: null
						}
					});
				}
			}
			return true;
		}
	},
	providers: [
		CredentialsProvider({
			credentials: {
				// You can leave this empty if you don't need any additional fields
			},
			async authorize(credentials: Record<string, string> | undefined) {
				if (!credentials) {
					throw new Error('Missing credentials');
				}

				const { email, password } = credentials;
				const user = await prisma.user.findUnique({
					where: { email: email.toLowerCase() }
				});

				if (!user) {
					return null;
				}

				let isPasswordCorrect = false;

				if (user.password.startsWith('$2b$')) {
					// Check password with bcrypt
					isPasswordCorrect = bcrypt.compareSync(password, user.password);
				} else {
					// Check password with crypto
					const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
					isPasswordCorrect = hashedPassword === user.password;
					
					//Swith to bcrypt with salt
					const salt = bcrypt.genSaltSync(10);
					const newHashedPassword = bcrypt.hashSync(password, salt);
					const updatedUser = await prisma.user.update({
						where: {
							id: user.id
						},
						data: {
							password: newHashedPassword
						}
					});
				}

				if (!isPasswordCorrect) {
					return null;
				}

				const logSignIn = await prisma.userEvent.create({
					data: {
						user_id : user.id,
						action: 'user_signin',
						created_at: new Date(),
						metadata: {}
					}
				})

				return { ...user, name: user.firstName + ' ' + user.lastName };
			}
		}),

		// Provider Proconnect (OpenID)
		{
			id: 'openid',
			name: 'ProConnect',
			type: 'oauth',
			issuer: `https://${process.env.PROCONNECT_DOMAIN}`,
			wellKnown: `https://${process.env.PROCONNECT_DOMAIN}/api/v2/.well-known/openid-configuration`,
			authorization: {
				url: `https://${process.env.PROCONNECT_DOMAIN}/api/v2/authorize`,
				params: {
					scope: 'openid organizational_unit chorusdt'
				}
			},
			token: `https://${process.env.PROCONNECT_DOMAIN}/api/v2/token`,
			userinfo: {
				url: `https://${process.env.PROCONNECT_DOMAIN}/api/v2/userinfo`,
				async request(context) {
					console.log('🔗 Je force l’appel à /userinfo !');
					const userinfoUrl =
						typeof context.provider.userinfo === 'string'
							? context.provider.userinfo
							: context.provider.userinfo?.url;

					const res = await fetch(userinfoUrl!, {
						headers: {
							Authorization: `Bearer ${context.tokens.access_token}`
						}
					});

					const data = await res.json();
					console.log('🧵 Réponse de /userinfo :', data);
					return data;
				}
			},
			clientId: process.env.PROCONNECT_CLIENT_ID,
			clientSecret: process.env.PROCONNECT_CLIENT_SECRET,
			idToken: true,
			checks: ['nonce', 'state'],
			profile(profile) {
				console.log('💡 PROFILE FROM PROCONNECT:', profile);
				return {
					id: profile.sub,
					email: profile.email,
					name: `${profile.given_name} ${profile.family_name}`.trim(),
					firstName: profile.given_name,
					lastName: profile.family_name,
					active: true,
					xwiki_account: false,
					xwiki_username: null,            
					password: '',
					role: 'user',    
					notifications: false,
					notifications_frequency: 'daily',
					created_at: new Date(),
					updated_at: new Date()
				}
			}
		}

	],

	session: {
		strategy: 'jwt',
		maxAge: 30 * 24 * 60 * 60, // 30 days
		updateAge: 24 * 60 * 60 // 24 hours
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
