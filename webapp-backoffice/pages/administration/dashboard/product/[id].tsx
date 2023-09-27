import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { PrismaClient, Product } from '@prisma/client';

interface ProductPageProps {
	product: Product;
}

const ProductPage = (props: ProductPageProps) => {
	const { product } = props;
	return (
		<div>
			<h1>{product.title}</h1>
		</div>
	);
};

export const getServerSideProps: GetServerSideProps = async context => {
	const { id } = context.query;
	const prisma = new PrismaClient();
	const product = await prisma.product.findUnique({
		where: {
			id: id?.toString()
		}
	});
	return {
		props: {
			product: JSON.parse(JSON.stringify(product))
		}
	};
};

export default ProductPage;
