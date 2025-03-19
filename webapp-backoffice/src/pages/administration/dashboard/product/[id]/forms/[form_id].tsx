import { ProductWithForms } from '@/src/types/prismaTypesExtended';
import { fr } from '@codegouvfr/react-dsfr';
import Breadcrumb from '@codegouvfr/react-dsfr/Breadcrumb';
import Button from '@codegouvfr/react-dsfr/Button';
import { RightAccessStatus } from '@prisma/client';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { tss } from 'tss-react/dsfr';
import { getServerSideProps } from '..';

interface Props {
	product: ProductWithForms;
	ownRight: Exclude<RightAccessStatus, 'removed'>;
}

const ProductFormPage = (props: Props) => {
	const { product, ownRight } = props;

	const { classes, cx } = useStyles();

	const router = useRouter();

	const { form_id } = router.query;

	const form = product.forms.find(f => f.id === parseInt(form_id as string));

	if (!form || ownRight !== 'carrier_admin') {
		router.back();
		return;
	}

	const breadcrumbSegments = [
		{
			label: 'Services',
			linkProps: {
				href: '/administration/dashboard/products'
			}
		},
		{
			label: product.title,
			linkProps: {
				href: `/administration/dashboard/product/${product.id}/forms`
			}
		}
	];

	return (
		<div className={fr.cx('fr-container', 'fr-my-4w')}>
			<Head>
				<title>{`${product.title} | Configuration du formulaire | Je donne mon avis`}</title>
				<meta
					name="description"
					content={`${product.title} | Configuration du formulaire | Je donne mon avis`}
				/>
			</Head>
			<Breadcrumb
				currentPageLabel={form.form_template.title}
				segments={breadcrumbSegments}
				className={fr.cx('fr-mb-6v')}
			/>
			<Link
				href={breadcrumbSegments[1].linkProps.href}
				className={cx(classes.backLink)}
				title={`Retourner à la page du service ${product.title}`}
			>
				<Button
					iconId="fr-icon-arrow-left-s-line"
					priority="tertiary"
					size="small"
				>
					Annuler et retourner au service
				</Button>
			</Link>
		</div>
	);
};

const useStyles = tss.withName(ProductFormPage.name).create({
	backLink: {
		backgroundImage: 'none'
	}
});

export default ProductFormPage;

export { getServerSideProps };
