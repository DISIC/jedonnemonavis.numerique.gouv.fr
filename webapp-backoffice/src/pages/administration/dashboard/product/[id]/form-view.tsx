import React from 'react';
import ProductLayout from '@/src/layouts/Product/ProductLayout';
import { getServerSideProps } from '.';
import { Product } from '@prisma/client';
import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react/dsfr';
import Head from 'next/head';
import { trpc } from '@/src/utils/trpc';
import { Loader } from '@/src/components/ui/Loader';

interface Props {
	product: Product;
	ownRight : 'admin' | 'viewer'
}

const ProductFormView = (props: Props) => {
	const { product, ownRight } = props;
	const { classes } = useStyles();

	const { data: buttonResult } = trpc.button.getList.useQuery({
		numberPerPage: 10,
		page: 1,
		product_id: product.id,
		isTest: false
	});
	const buttonId = buttonResult?.data[0]?.id;

	return (
		<ProductLayout product={product} ownRight={ownRight}>
			<Head>
				<title>{product.title} | Aperçu formulaire | Je donne mon avis</title>
				<meta
					name="description"
					content={`${product.title} | Aperçu formulaire | Je donne mon avis`}
				/>
			</Head>
			<div className={classes.column}>
				{buttonId ? (
					<iframe
						src={`${process.env.NEXT_PUBLIC_FORM_APP_URL}/Demarches/${product.id}?button=${buttonId}&iframe=true`}
						className={classes.iframe}
						allowFullScreen
						title="Aperçu du formulaire"
					></iframe>
				) : (
					<Loader size="sm" />
				)}
			</div>
		</ProductLayout>
	);
};

const useStyles = tss.withName(ProductFormView.name).create({
	column: {
		display: 'flex',
		flexDirection: 'column',
		gap: fr.spacing('10v'),
		height: '100%'
	},

	iframe: {
		width: '100%',
		height: '230vh'
	}
});

export default ProductFormView;

export { getServerSideProps };
