import prisma from '@/src/utils/db';
import { GetServerSideProps } from 'next';
import { getToken } from 'next-auth/jwt';

const ProductPage = () => {
	return;
};

export const getServerSideProps: GetServerSideProps = async context => {
	const { id } = context.query;
	const product = await prisma.product.findUnique({
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

	const hasAccessRightToProduct = await prisma.accessRight.findFirst({
		where: {
			user_email: currentUserToken.email as string,
			product_id: parseInt(id as string),
			status: 'carrier'
		}
	});

	const hasAdminEntityRight = await prisma.adminEntityRight.findFirst({
		where: {
			user_email: currentUserToken.email as string,
			entity_id: product?.entity_id
		}
	});

	prisma.$disconnect();

	if (
		!hasAccessRightToProduct &&
		!hasAdminEntityRight &&
		currentUser.role !== 'admin'
	) {
		return {
			redirect: {
				destination: '/administration/dashboard/products',
				permanent: false
			}
		};
	}

	return {
		props: {
			product: JSON.parse(JSON.stringify(product))
		}
	};
};

export default ProductPage;
