import prisma from '@/src/utils/db';
import { GetServerSideProps } from 'next';
import { getToken } from 'next-auth/jwt';

const ProductPage = () => {
	return;
};

export const getServerSideProps: GetServerSideProps = async context => {
	const { id } = context.query;
	const form = await prisma.form.findUnique({
		where: {
			id: parseInt(id as string)
		}
	});

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

	if (form?.user_id !== currentUser.id) {
		return {
			redirect: {
				destination: '/administration/dashboard/forms',
				permanent: false
			}
		};
	}

	return {
		props: {
			product: JSON.parse(JSON.stringify(form))
		}
	};
};

export default ProductPage;
