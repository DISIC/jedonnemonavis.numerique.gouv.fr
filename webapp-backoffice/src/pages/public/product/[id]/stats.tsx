import PublicStats from '@/src/components/dashboard/Stats/PublicStats';
import { ProductWithForms } from '@/src/types/prismaTypesExtended';
import PublicStatsNotFound from '@/src/components/dashboard/Stats/PublicStatsNotFound';
import { fr } from '@codegouvfr/react-dsfr';
import Head from 'next/head';
import { getServerSideProps } from '.';

interface Props {
	product: ProductWithForms | null;
	defaultStartDate: string;
	defaultEndDate: string;
}

const ProductStatPage = ({
	product,
	defaultStartDate,
	defaultEndDate
}: Props) => {
	if (product === null) {
		return <PublicStatsNotFound />;
	}

	return (
		<div className={fr.cx('fr-container', 'fr-mb-10w')}>
			<Head>
				<title>{product.title} | Statistiques | Je donne mon avis</title>
				<meta
					name="description"
					content={`${product.title} | Statistiques | Je donne mon avis`}
				/>
			</Head>
			<PublicStats
				product={product}
				forms={product.forms}
				showFormSelector
				defaultStartDate={defaultStartDate}
				defaultEndDate={defaultEndDate}
			/>
		</div>
	);
};

export default ProductStatPage;

export { getServerSideProps };
