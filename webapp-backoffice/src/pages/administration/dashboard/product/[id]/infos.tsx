import ProductLayout from '@/src/layouts/Product/ProductLayout';
import { getServerSideProps } from '.';
import { Product } from '@prisma/client';

interface Props {
	product: Product;
}

const ProductInformationPage = (props: Props) => {
	const { product } = props;

	return (
		<ProductLayout product={product}>
			<div>Informations</div>
		</ProductLayout>
	);
};

export default ProductInformationPage;

export { getServerSideProps };
