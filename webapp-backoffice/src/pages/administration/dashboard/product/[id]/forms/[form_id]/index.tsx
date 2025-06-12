import { FormWithElements } from '@/src/types/prismaTypesExtended';
import prisma from '@/src/utils/db';
import { fr } from '@codegouvfr/react-dsfr';
import Breadcrumb from '@codegouvfr/react-dsfr/Breadcrumb';
import Button from '@codegouvfr/react-dsfr/Button';
import { GetServerSideProps } from 'next';
import { getToken } from 'next-auth/jwt';
import Head from 'next/head';
import Link from 'next/link';
import { tss } from 'tss-react/dsfr';
import { Tabs } from '@codegouvfr/react-dsfr/Tabs';
import DashboardTab from '@/src/components/dashboard/Form/tabs/dashboard';
import ReviewsTab from '@/src/components/dashboard/Form/tabs/reviews';
import StatsTab from '@/src/components/dashboard/Form/tabs/stats';
import FormTab from '@/src/components/dashboard/Form/tabs/form';
import { trpc } from '@/src/utils/trpc';
import { RightAccessStatus } from '@prisma/client';
import { useRouter } from 'next/router';

interface Props {
	form: FormWithElements;
	ownRight: Exclude<RightAccessStatus, 'removed'>;
}

const ProductFormPage = (props: Props) => {
	const router = useRouter();
	const { form, ownRight } = props;
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

	const { data: reviewsData, isLoading: isLoadingReviewsCount } =
		trpc.review.countReviews.useQuery({
			numberPerPage: 0,
			page: 1,
			product_id: form.product_id,
			form_id: form.id
		});

	const nbReviews = reviewsData?.metadata.countAll || 0;

	return (
		<div className={fr.cx('fr-container', 'fr-my-4w')}>
			<Head>
				<title>{`${form.product.title} | ${form.title || form.form_template.title} | Je donne mon avis`}</title>
				<meta
					name="description"
					content={`${form.product.title} | ${form.title || form.form_template.title} | Je donne mon avis`}
				/>
			</Head>
			<Breadcrumb
				currentPageLabel={
					'Formulaire : ' + (form.title || form.form_template.title)
				}
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
					Retourner à la liste des formulaires
				</Button>
			</Link>
			<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-my-6v')}>
				<div className={fr.cx('fr-col-8')}>
					<h1>{form.title || form.form_template.title}</h1>
					{form.product.isTop250 && (
						<p className={fr.cx('fr-mb-0')}>
							Ce service est référencé comme démarche essentielle dans
							l’Observatoire des démarches essentielles. Le formulaire ne peut
							être modifié.
						</p>
					)}
				</div>
				<div className={fr.cx('fr-col-12', 'fr-pb-0')}>
					<p className={fr.cx('fr-mb-0')}>
						Vous pouvez&nbsp;
						<Link
							href={`${process.env.NEXT_PUBLIC_FORM_APP_URL}/Demarches/${form.product_id}?iframe=true`}
							target={'_blank'}
							style={{
								color: fr.colors.decisions.text.title.blueFrance.default
							}}
						>
							prévisualiser ce formulaire
						</Link>
						. Les réponses que vous déposerez ne seront pas prises en compte
						dans les statistiques.
					</p>
				</div>
				<div className={fr.cx('fr-col-12', 'fr-mt-4v')}>
					<Tabs
						tabs={[
							{
								label: 'Tableau de bord',
								content: (
									<DashboardTab
										hasReviews={nbReviews > 0}
										isLoading={isLoadingReviewsCount}
									/>
								)
							},
							{
								label: 'Réponses',
								content: <ReviewsTab form={form} ownRight={ownRight} />,
								isDefault: router.query.tab === 'reviews'
							},
							{
								label: 'Statistiques',
								content: <StatsTab form={form} ownRight={ownRight} />,
								isDefault: router.query.tab === 'stats'
							},
							{
								label: 'Formulaire',
								content: <FormTab form={form} ownRight={ownRight} />,
								isDefault: router.query.tab === 'form'
							}
						]}
					/>
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
				where: {
					status: 'published'
				},
				orderBy: {
					created_at: 'desc'
				},
				take: 100,
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
									options: {
										orderBy: {
											position: 'asc'
										}
									}
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
		!(
			hasAccessRightToProduct &&
			hasAccessRightToProduct.status === 'carrier_admin'
		) &&
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
