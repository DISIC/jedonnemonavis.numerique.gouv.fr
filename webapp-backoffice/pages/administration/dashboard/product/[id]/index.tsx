import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { PrismaClient, Product } from '@prisma/client';

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
	return {
		props: {
			product: JSON.parse(JSON.stringify(product))
		}
	};
};

export default ProductPage;
