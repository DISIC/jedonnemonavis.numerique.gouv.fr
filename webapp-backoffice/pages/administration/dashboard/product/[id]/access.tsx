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
			<div>Gérer les droits d'accès</div>
		</ProductLayout>
	);
};

export default AccessManagement;

export { getServerSideProps };
