import ProductLayout from '@/src/layouts/Product/ProductLayout';
import { getServerSideProps } from '.';
import { Product } from '@prisma/client';

interface Props {
	product: Product;
}

const ProductStatPage = (props: Props) => {
	const { product } = props;

	return (
		<ProductLayout product={product}>
			<div>Statistiques</div>
		</ProductLayout>
	);
};

export default ProductStatPage;

export { getServerSideProps };
