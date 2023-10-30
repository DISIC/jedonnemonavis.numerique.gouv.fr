import { GetServerSideProps } from 'next';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';

const ProductPage = () => {
	return;
};

export const getServerSideProps: GetServerSideProps = async context => {
	const { id } = context.query;
	const prisma = new PrismaClient();
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
	)
		return {
			redirect: {
				destination: '/',
				permanent: false
			}
		};

	const currentUser = await prisma.user.findUnique({
		where: {
			email: currentUserToken.email as string
		},
		include: { entities: true }
	});

	if (!currentUser || !product) {
		return {
			redirect: {
				destination: '/',
				permanent: false
			}
		};
	}

	let hasAccessRightToProduct = false;

	if (currentUser.role === 'user') {
		hasAccessRightToProduct = !!(await prisma.accessRight.findFirst({
			where: {
				user_email: currentUserToken.email as string,
				product_id: parseInt(id as string),
				status: 'carrier'
			}
		}));
	} else if (currentUser.role === 'supervisor') {
		hasAccessRightToProduct = currentUser.entities.some(
			e => e.id === product.entity_id
		);
	}

	if (!hasAccessRightToProduct && currentUser.role !== 'admin') {
		return {
			redirect: {
				destination: '/',
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
