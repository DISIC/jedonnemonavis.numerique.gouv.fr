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
				className={fr.cx('fr-mb-4v')}
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
			<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-my-6v')}>
				<div className={fr.cx('fr-col-8')}>
					<h1 className={fr.cx('fr-mb-0')}>{form.form_template.title}</h1>
				</div>
				<div className={cx(classes.headerButtons, fr.cx('fr-col-4'))}>
					<Button priority="secondary">
						<Link
							href={`${process.env.NEXT_PUBLIC_FORM_APP_URL}/Demarches/${form.product_id}?iframe=true`}
							target="_blank"
						>
							Prévisuliser
						</Link>
					</Button>
					<Button
						priority="primary"
						iconId="fr-icon-computer-line"
						iconPosition="right"
					>
						Publier
					</Button>
				</div>
				<div className={fr.cx('fr-col-12')}>
					<p>
						Ici, un texte décrivant brièvement le modèle Évaluation et usager,
						le type de données récoltées et comment les exploiter.
					</p>
				</div>
			</div>
		</div>
	);
};

const useStyles = tss.withName(ProductFormPage.name).create({
	backLink: {
		backgroundImage: 'none'
	},
	headerButtons: {
		display: 'flex',
		justifyContent: 'end',
		gap: fr.spacing('4v'),
		alignSelf: 'center',
		button: {
			a: {
				display: 'flex',
				alignItems: 'center'
			}
		}
	}
});

export default ProductFormPage;

export { getServerSideProps };
