import ProductLayout from '@/src/layouts/Product/ProductLayout';
import { getServerSideProps } from '.';
import { Product } from '@prisma/client';
import SmileySection from '@/src/components/dashboard/Stats/SmileySection';
import { tss } from 'tss-react/dsfr';
import { fr } from '@codegouvfr/react-dsfr';
import BooleanSection from '@/src/components/dashboard/Stats/BooleanSection';

interface Props {
	product: Product;
}

const SectionWrapper = ({
	title,
	children
}: {
	title: string;
	children: React.ReactNode;
}) => {
	const { classes, cx } = useStyles();

	return (
		<div className={cx(classes.wrapperGlobal, fr.cx('fr-mt-5w'))}>
			<h3 className={fr.cx('fr-mb-0')}>{title}</h3>
			<>{children}</>
		</div>
	);
};

const ProductStatPage = (props: Props) => {
	const { product } = props;

	return (
		<ProductLayout product={product}>
			<h1>Statistiques</h1>
			<SectionWrapper title="Satisfaction usagers">
				<SmileySection fieldCode="satisfaction" productId={product.id} />
			</SectionWrapper>
			<SectionWrapper title="Facilité d'usage">
				<SmileySection fieldCode="easy" productId={product.id} />
			</SectionWrapper>
			<SectionWrapper title="Simplicité du langage">
				<SmileySection fieldCode="comprehension" productId={product.id} />
			</SectionWrapper>
			<SectionWrapper title="Difficultés rencontrées">
				<BooleanSection
					fieldCode="difficulties"
					fieldCodeMultiple="difficulties_details"
					productId={product.id}
				/>
			</SectionWrapper>
			<SectionWrapper title="Aide joignable et efficace">
				<BooleanSection
					fieldCode="contact"
					fieldCodeMultiple="contact_reached"
					productId={product.id}
				/>
				<SmileySection
					fieldCode="contact_satisfaction"
					displayFieldLabel={true}
					productId={product.id}
				/>
				<BooleanSection
					fieldCodeMultiple="contact_channels"
					productId={product.id}
				/>
			</SectionWrapper>
			<SectionWrapper title="Niveau d’autonomie">
				<BooleanSection
					fieldCode="help"
					fieldCodeMultiple="help_details"
					productId={product.id}
				/>
			</SectionWrapper>
		</ProductLayout>
	);
};

const useStyles = tss.create({
	wrapperGlobal: {
		display: 'flex',
		flexDirection: 'column',
		gap: '3rem',
		padding: '2rem',
		border: '1px solid #E5E5E5'
	}
});

export default ProductStatPage;

export { getServerSideProps };
