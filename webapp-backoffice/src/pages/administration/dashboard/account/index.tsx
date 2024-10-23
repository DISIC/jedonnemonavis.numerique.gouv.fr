import prisma from '@/src/utils/db';
import { GetServerSideProps } from 'next';
import { getToken } from 'next-auth/jwt';

const AccountPage = () => {
	return;
};

export const getServerSideProps: GetServerSideProps = async context => {
	const currentUserToken = await getToken({
		req: context.req,
		secret: process.env.JWT_SECRET
	});

	if (
		!currentUserToken ||
		(currentUserToken.exp as number) > new Date().getTime()
	) {
		prisma.$disconnect();
		return {
			redirect: {
				destination: '/',
				permanent: false
			}
		};
	}

	const currentUser = await prisma.user.findUnique({
		where: {
			email: currentUserToken.email as string
		}
	});

	if (!currentUser) {
		prisma.$disconnect();
		return {
			redirect: {
				destination: '/',
				permanent: false
			}
		};
	}

	prisma.$disconnect();

	return {
		props: {
			user: JSON.parse(JSON.stringify(currentUser))
		}
	};
};

export default AccountPage;
