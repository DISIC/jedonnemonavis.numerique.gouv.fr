import ProductLayout from '@/src/layouts/Product/ProductLayout';
import { getServerSideProps } from '.';
import { Product } from '@prisma/client';
import SmileySection from '@/src/components/dashboard/Stats/SmileySection';
import { tss } from 'tss-react/dsfr';

interface Props {
	product: Product;
}

const ProductStatPage = (props: Props) => {
	const { product } = props;

	const { classes } = useStyles();

	return (
		<ProductLayout product={product}>
			<h1>Statistiques</h1>
			<div className={classes.wrapperGlobal}>
				<h3>Satisfaction usagers ⓘ</h3>
				<SmileySection fieldCode="satisfaction" productId={product.id} />
			</div>
		</ProductLayout>
	);
};

const useStyles = tss.create({
	wrapperGlobal: {
		display: 'flex',
		flexDirection: 'column',
		gap: '1.5rem',
		padding: '2rem',
		border: '1px solid #E5E5E5'
	}
});

export default ProductStatPage;

export { getServerSideProps };
