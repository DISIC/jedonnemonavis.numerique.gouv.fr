import ProductLayout from '@/src/layouts/Product/ProductLayout';
import { getServerSideProps } from '.';
import { Product } from '@prisma/client';
import dynamic from 'next/dynamic';
import { fr } from '@codegouvfr/react-dsfr';
import SatisfactionComponent from '@/src/components/dashboard/Stats/Satisfaction';
import SatisfactionStats from '@/src/components/dashboard/Stats/Satisfaction';

const BarChart = dynamic(() => import('@/src/components/chart/BarChart'), {
	ssr: false
});

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
