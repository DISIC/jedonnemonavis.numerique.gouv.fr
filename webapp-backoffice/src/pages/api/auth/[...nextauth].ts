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

export const authOptions: NextAuthOptions = {
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
					where: { id: token.uid as number }
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
		jwt: ({ user, token }) => {
			if (user) {
				token.uid = user.id;
				token.role = user.role;
			}
			return token;
		},
		async redirect({ url, baseUrl }) {
		  if (url.startsWith(baseUrl)) {
			return url;
		  }
		  return baseUrl;
		},
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
		})
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
