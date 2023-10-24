import ProductLayout from '@/src/layouts/Product/ProductLayout';
import { getServerSideProps } from '.';
import { Product } from '@prisma/client';
import SatisfactionStats from '@/src/components/dashboard/Stats/Satisfaction';

interface Props {
	product: Product;
}

const ProductStatPage = (props: Props) => {
	const { product } = props;

	return (
		<ProductLayout product={product}>
			<h1>Statistiques</h1>
			<SatisfactionStats />
		</ProductLayout>
	);
};

export default ProductStatPage;

export { getServerSideProps };
