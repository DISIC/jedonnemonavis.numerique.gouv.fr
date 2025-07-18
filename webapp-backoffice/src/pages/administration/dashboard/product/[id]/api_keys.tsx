import React from 'react';
import ProductLayout from '@/src/layouts/Product/ProductLayout';
import { getServerSideProps } from '.';
import { Product, RightAccessStatus } from '@prisma/client';
import Head from 'next/head';
import ApiKeyHandler from '@/src/components/dashboard/ApiKey/ApiKeyHandler';
import Link from 'next/link';
import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react/dsfr';

interface Props {
	product: Product;
	ownRight: Exclude<RightAccessStatus, 'removed'>;
}

const ProductApiKeysPage = (props: Props) => {
	const { product, ownRight } = props;
	const { cx, classes } = useStyles();

	return (
		<ProductLayout product={product} ownRight={ownRight}>
			<Head>
				<title>Gérer les clés API | Je donne mon avis</title>
				<meta
					name="description"
					content="Gérer les clés API | Je donne mon avis"
				/>
			</Head>
			<div className={classes.headerWrapper}>
				<h2>Gérer les clés API</h2>
				<Link className={fr.cx('fr-link')} target="_blank" href="/open-api">
					Voir la documentation de l'API
				</Link>
			</div>
			<h3 className={fr.cx('fr-mt-10v')}>Clés API</h3>
			<ApiKeyHandler product={product} ownRight={ownRight}></ApiKeyHandler>
		</ProductLayout>
	);
};

const useStyles = tss.withName(ProductApiKeysPage.name).create({
	headerWrapper: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		[fr.breakpoints.down('md')]: {
			flexDirection: 'column',
			alignItems: 'flex-start',
		}
	}
});

export default ProductApiKeysPage;

export { getServerSideProps };
