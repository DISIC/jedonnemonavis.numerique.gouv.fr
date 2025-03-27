import FormConfigurator from '@/src/components/dashboard/Form/FormConfigurator';
import { FormWithElements } from '@/src/types/prismaTypesExtended';
import prisma from '@/src/utils/db';
import {
	getHasConfigChanged,
	getHelperFromFormConfig
} from '@/src/utils/tools';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Breadcrumb from '@codegouvfr/react-dsfr/Breadcrumb';
import Button from '@codegouvfr/react-dsfr/Button';
import { $Enums, Prisma, RightAccessStatus } from '@prisma/client';
import { GetServerSideProps } from 'next';
import { getToken } from 'next-auth/jwt';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { tss } from 'tss-react/dsfr';

export type FormConfigHelper = {
	displays: {
		hidden: boolean;
		kind: $Enums.FormConfigKind;
		parent_id: number;
	}[];
	labels: {
		label: string;
		kind: $Enums.FormConfigKind;
		parent_id: number;
	}[];
};

interface Props {
	form: FormWithElements;
	ownRight: Exclude<RightAccessStatus, 'removed'>;
}

const ProductFormPage = (props: Props) => {
	const { form } = props;
	const formConfig = form.form_configs[0];

	const { classes, cx } = useStyles();

	const createFormConfig = trpc.formConfig.create.useMutation({
		onSuccess: response => {
			alert('Le formulaire a été publié avec succès');
		}
	});

	const [tmpConfigHelper, setTmpConfigHelper] = useState<FormConfigHelper>();
	const [hasConfigChanged, setHasConfigChanged] = useState(false);
	const [createConfig, setCreateConfig] =
		useState<Prisma.FormConfigUncheckedCreateInput>({
			form_id: form.id,
			status: 'published'
		});

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

	const publish = () => {
		if (createConfig) {
			try {
				createFormConfig.mutate(createConfig);
			} catch (error) {
				console.error(error);
			}
		}
	};

	const onChangeConfig = (configHelper: FormConfigHelper) => {
		setTmpConfigHelper(configHelper);

		const rootConfigHelper = getHelperFromFormConfig(formConfig);
		setHasConfigChanged(getHasConfigChanged(configHelper, rootConfigHelper));

		setCreateConfig({
			...createConfig,
			form_config_displays: { create: configHelper.displays },
			form_config_labels: { create: configHelper.labels }
		});
	};

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
					{hasConfigChanged && (
						<Link
							className={fr.cx('fr-btn', 'fr-btn--secondary')}
							href={`${process.env.NEXT_PUBLIC_FORM_APP_URL}/Demarches/${form.product_id}?iframe=true&formConfig=${JSON.stringify(tmpConfigHelper)}`}
							target={'_blank'}
						>
							Prévisualiser
						</Link>
					)}
					<Button
						priority="primary"
						iconId="fr-icon-computer-line"
						iconPosition="right"
						onClick={publish}
						disabled={!hasConfigChanged}
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
					<FormConfigurator form={form} onChange={onChangeConfig} />
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
				take: 10,
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
