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
import jwt from 'jsonwebtoken';
import { getSiretInfo } from '@/src/utils/queries';

interface ProconnectProfile {
	sub: string;
	email: string;
	given_name: string;
	usual_name: string;
	siret: string;
	chorusdt?: string;
	organizational_unit?: string;
	idp_id?: string;
}

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
				  email: user.email
				};
			  } else {
				console.log('❌ Utilisateur non trouvé en base');
			  }
			}
			return session;
		},
		jwt: ({ user, token, account, profile }) => {
			if (account?.provider === 'openid' && profile) {
				const proconnectProfile = profile as {
					email: string;
					given_name: string;
					usual_name: string;
				};
				// Cas ProConnect
				token.email = profile.email;
				token.firstName = proconnectProfile.given_name;
				token.lastName = proconnectProfile.usual_name;
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
			if (account?.provider === 'openid') {
				const proconnectProfile = profile as ProconnectProfile;
				console.log('profile in signin : ', proconnectProfile);
		
				const email = proconnectProfile.email?.toLowerCase();
		
				let user = await prisma.user.findUnique({
					where: { email },
				});
		
				if (!user) {
					console.log('user not found, need creation');
					try {
						const data = await getSiretInfo(proconnectProfile.siret);
						console.log('✔️ Données récupérées :', data);
		
						const etablissement = data.etablissement;
						const formeJuridique = etablissement.uniteLegale.categorieJuridiqueUniteLegale;
						console.log('forme juridique : ', formeJuridique);
		
						if (formeJuridique.startsWith('7') || formeJuridique.startsWith('8')) {
							console.log('🏢 Structure publique, création du compte...');
		
							const salt = bcrypt.genSaltSync(10);
							const newHashedPassword = bcrypt.hashSync('changeme', salt);
		
							user = await prisma.user.create({
								data: {
									email,
									firstName: proconnectProfile.given_name,
									lastName: proconnectProfile.usual_name,
									role: 'user',
									password: newHashedPassword,
									notifications: false,
									notifications_frequency: 'daily',
									active: true,
									xwiki_account: false,
									xwiki_username: null,
								},
							});
							console.log('✅ Utilisateur créé avec succès:', user);
						} else {
							console.log('🏢 Structure privée, redirection erreur...');
							throw new Error('INVALID_PROVIDER');
						}
					} catch (err) {
						console.error('❌ Erreur :', err);
						throw new Error('INVALID_PROVIDER');
					}
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
					scope: 'openid email given_name usual_name phone siret idp_id custom siren belonging_population organizational_unit chorusdt'
				}
			},
			token: `https://${process.env.PROCONNECT_DOMAIN}/api/v2/token`,
			userinfo: {
				url: `https://${process.env.PROCONNECT_DOMAIN}/api/v2/userinfo`,
				async request({ tokens }): Promise<Record<string, any>> {
					
					const res = await fetch(`https://${process.env.PROCONNECT_DOMAIN}/api/v2/userinfo`, {
						headers: {
							Authorization: `Bearer ${tokens.access_token}`
						}
					});
			
					const responseText = await res.text(); // 🔥 On lit le body UNE SEULE FOIS
			
					let data: Record<string, any>;
			
					try {
						data = JSON.parse(responseText); // 🔍 On essaie de parser en JSON
					} catch (error) {
						data = jwt.decode(responseText) as Record<string, any> || {}; // 🔥 Décode JWT
					}
					return data;
				}
			},
			clientId: process.env.PROCONNECT_CLIENT_ID,
			clientSecret: process.env.PROCONNECT_CLIENT_SECRET,
			idToken: true,
			checks: ['nonce', 'state'],
			profile(profile) {
				console.log('profile received : ', profile)
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
