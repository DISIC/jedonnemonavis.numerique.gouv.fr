import FormConfigurator from '@/src/components/dashboard/Form/FormConfigurator';
import { FormWithElements } from '@/src/types/prismaTypesExtended';
import prisma from '@/src/utils/db';
import { fr } from '@codegouvfr/react-dsfr';
import Breadcrumb from '@codegouvfr/react-dsfr/Breadcrumb';
import Button from '@codegouvfr/react-dsfr/Button';
import { RightAccessStatus } from '@prisma/client';
import { GetServerSideProps } from 'next';
import { getToken } from 'next-auth/jwt';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { tss } from 'tss-react/dsfr';

interface Props {
	form: FormWithElements;
	ownRight: Exclude<RightAccessStatus, 'removed'>;
}

const ProductFormPage = (props: Props) => {
	const { form } = props;

	const { classes, cx } = useStyles();

	const breadcrumbSegments = [
		{
			label: 'Services',
			linkProps: {
				href: '/administration/dashboard/products'
			}
		},
		{
			label: form.product.title,
			linkProps: {
				href: `/administration/dashboard/product/${form.product.id}/forms`
			}
		}
	];

	return (
		<div className={fr.cx('fr-container', 'fr-my-4w')}>
			<Head>
				<title>{`${form.product.title} | Configuration du formulaire | Je donne mon avis`}</title>
				<meta
					name="description"
					content={`${form.product.title} | Configuration du formulaire | Je donne mon avis`}
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
				title={`Retourner à la page du service ${form.product.title}`}
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
							Prévisualiser
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
				<div className={cx(classes.configuratorContainer, fr.cx('fr-col-12'))}>
					<FormConfigurator form={form} />
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
	},
	configuratorContainer: {
		minHeight: '75vh'
	}
});

export const getServerSideProps: GetServerSideProps = async context => {
	const { id, form_id } = context.query;
	const form = await prisma.form.findUnique({
		where: {
			id: parseInt(form_id as string)
		},
		include: {
			product: true,
			form_configs: {
				include: {
					form_config_displays: true,
					form_config_labels: true
				}
			},
			form_template: {
				include: {
					form_template_steps: {
						include: {
							form_template_blocks: {
								include: {
									options: true
								},
								orderBy: {
									position: 'asc'
								}
							}
						},

						orderBy: {
							position: 'asc'
						}
					}
				}
			}
		}
	});

	if (!form) {
		return {
			redirect: {
				destination: `/administration/dashboard/product/${id}/forms`,
				permanent: false
			}
		};
	}

	const currentUserToken = await getToken({
		req: context.req,
		secret: process.env.JWT_SECRET
	});

	if (
		!currentUserToken ||
		(currentUserToken.exp as number) > new Date().getTime()
	) {
		prisma.$disconnect();
		return {
			redirect: {
				destination: '/',
				permanent: false
			}
		};
	}

	const currentUser = await prisma.user.findUnique({
		where: {
			email: currentUserToken.email as string
		}
	});

	if (!currentUser) {
		prisma.$disconnect();
		return {
			redirect: {
				destination: '/',
				permanent: false
			}
		};
	}

	const hasAccessRightToProduct = await prisma.accessRight.findFirst({
		where: {
			user_email: currentUserToken.email as string,
			product_id: parseInt(id as string),
			status: {
				in: ['carrier_admin', 'carrier_user']
			}
		}
	});

	const hasAdminEntityRight = await prisma.adminEntityRight.findFirst({
		where: {
			user_email: currentUserToken.email as string,
			entity_id: form.product.entity_id
		}
	});

	prisma.$disconnect();

	if (
		!hasAccessRightToProduct &&
		!hasAdminEntityRight &&
		!currentUser.role.includes('admin')
	) {
		return {
			redirect: {
				destination: '/administration/dashboard/products',
				permanent: false
			}
		};
	}

	return {
		props: {
			form: JSON.parse(JSON.stringify(form)),
			ownRight:
				currentUser.role.includes('admin') ||
				hasAdminEntityRight ||
				(hasAccessRightToProduct &&
					hasAccessRightToProduct.status === 'carrier_admin')
					? 'carrier_admin'
					: 'carrier_user'
		}
	};
};

export default ProductFormPage;
