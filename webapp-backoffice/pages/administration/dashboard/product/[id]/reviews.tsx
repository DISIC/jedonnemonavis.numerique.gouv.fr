import ProductLayout from '@/layouts/Product/ProductLayout';
import { getServerSideProps } from '.';
import { Product } from '@prisma/client';

interface Props {
	product: Product;
}

const ProductReviewsPage = (props: Props) => {
	const { product } = props;

	return (
		<ProductLayout product={product}>
			<div>Avis</div>
		</ProductLayout>
	);
};

export default ProductReviewsPage;

export { getServerSideProps };
