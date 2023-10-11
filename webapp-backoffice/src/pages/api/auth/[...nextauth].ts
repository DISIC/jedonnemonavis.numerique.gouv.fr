import { type GetServerSidePropsContext } from 'next';
import { PrismaClient } from '@prisma/client';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import NextAuth, { type NextAuthOptions, getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import crypto from 'crypto';

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
	secret: process.env.NEXTAUTH_SECRET,
	pages: {
		signIn: '/login',
		signOut: '/login',
		error: '/login' // Error code passed in query string as ?error=
	},
	callbacks: {
		session: ({ session, token }) => ({
			...session,
			user: {
				...session.user,
				id: token.uid
			}
		}),
		jwt: ({ user, token }) => {
			if (user) {
				token.uid = user.id;
			}
			return token;
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
				const user = await prisma.user.findUnique({ where: { email } });

				if (!user) {
					return null;
				}

				// Hash the password using SHA-256
				const hashedPassword = crypto
					.createHash('sha256')
					.update(password)
					.digest('hex');

				if (hashedPassword !== user.password) {
					return null;
				}

				return { ...user, name: user.firstName + ' ' + user.lastName };
			}
		})
	],

	// Use MongoDB to store sessions
	session: {
		strategy: 'jwt',
		maxAge: 30 * 24 * 60 * 60, // 30 days
		updateAge: 24 * 60 * 60 // 24 hours
	},

	// Use MongoDB to store users
	// database: process.env.MONGODB_URI,

	// Customize the JWT token
	jwt: {
		secret: process.env.JWT_SECRET
		// encryption: true,
		// signingKey: process.env.JWT_SIGNING_PRIVATE_KEY,
		// verificationKey: process.env.JWT_VERIFICATION_PUBLIC_KEY,
		// encryptionKey: process.env.JWT_ENCRYPTION_PRIVATE_KEY,
		// decryptionKey: process.env.JWT_DECRYPTION_PUBLIC_KEY
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
