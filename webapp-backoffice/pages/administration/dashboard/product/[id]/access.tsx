import ProductLayout from '@/layouts/Product/ProductLayout';
import { getServerSideProps } from '.';
import { Product } from '@prisma/client';

interface Props {
	product: Product;
}

const AccessManagement = (props: Props) => {
	const { product } = props;
	return (
		<ProductLayout product={product}>
			<h1>Access Management</h1>
		</ProductLayout>
	);
};

export default AccessManagement;

export { getServerSideProps };
