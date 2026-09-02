import PublicStats from '@/src/components/dashboard/Stats/PublicStats';
import { ProductWithForms } from '@/src/types/prismaTypesExtended';
import { fr } from '@codegouvfr/react-dsfr';
import Alert from '@codegouvfr/react-dsfr/Alert';
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
		return (
			<div className={fr.cx('fr-container')}>
				<h1 className={fr.cx('fr-mt-20v')}>Statistiques</h1>
				<div role="alert">
					<Alert
						severity="info"
						title="Cette démarche n'existe pas ou n'est pas publique"
						description="Veuillez vérifier l'identifiant de la démarche ou contacter le porteur."
						className={fr.cx('fr-mt-20v', 'fr-mb-20v')}
					/>
				</div>
			</div>
		);
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
