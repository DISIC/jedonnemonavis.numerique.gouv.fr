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
import { useCallback, useEffect, useState } from 'react';
import { tss } from 'tss-react/dsfr';
import OnConfirmModal from '@/src/components/ui/modal/OnConfirm';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useRouter } from 'next/router';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';

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
}

const onConfirmPublishModal = createModal({
	id: 'form-publish-modal',
	isOpenedByDefault: false
});

const onConfirmLeaveModal = createModal({
	id: 'form-leave-modal',
	isOpenedByDefault: false
});

const ProductFormPage = (props: Props) => {
	const { form } = props;
	const router = useRouter();
	const formConfig = form.form_configs[0];

	const { classes, cx } = useStyles();

	const createFormConfig = trpc.formConfig.create.useMutation({
		onSuccess: response => {
			router.push(
				`/administration/dashboard/product/${form.product.id}/forms?formPublished=true`
			);
		}
	});

	const [leaveUrl, setLeaveUrl] = useState<string | null>();

	const [tmpConfigHelper, setTmpConfigHelper] = useState<FormConfigHelper>();
	const [isPublishing, setIsPublishing] = useState(false);
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

	const leave = () => {
		if (!!leaveUrl) {
			router.push(leaveUrl);
		}
	};

	const publish = () => {
		if (createConfig) {
			try {
				setIsPublishing(true);
				createFormConfig.mutate(createConfig);
			} catch (error) {
				console.error(error);
				setIsPublishing(false);
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

	const handleBeforeUnload = useCallback(
		(e: BeforeUnloadEvent) => {
			if (hasConfigChanged && !isPublishing) {
				e.preventDefault();
			}
		},
		[hasConfigChanged, isPublishing]
	);

	useEffect(() => {
		if (hasConfigChanged && !isPublishing) {
			window.addEventListener('beforeunload', handleBeforeUnload);
		} else {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		}

		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	}, [hasConfigChanged, isPublishing, handleBeforeUnload]);

	useEffect(() => {
		const handleRouteChangeStart = (url: string) => {
			if (hasConfigChanged && !isPublishing && !leaveUrl) {
				setLeaveUrl(url);
				onConfirmLeaveModal.open();
				router.events.emit('routeChangeError');
				throw 'Navigation aborted by the user';
			}
		};

		router.events.on('routeChangeStart', handleRouteChangeStart);

		return () => {
			router.events.off('routeChangeStart', handleRouteChangeStart);
		};
	}, [hasConfigChanged, isPublishing, leaveUrl, router]);

	useIsModalOpen(onConfirmLeaveModal, {
		onConceal: () => {
			setLeaveUrl(null);
		}
	});

	return (
		<div className={fr.cx('fr-container', 'fr-my-4w')}>
			<Head>
				<title>{`${form.product.title} | Configuration du formulaire | Je donne mon avis`}</title>
				<meta
					name="description"
					content={`${form.product.title} | Configuration du formulaire | Je donne mon avis`}
				/>
			</Head>
			<OnConfirmModal
				modal={onConfirmPublishModal}
				title={`Publier le formulaire`}
				handleOnConfirm={publish}
			>
				Vos usagers auront directement accès au formulaire modifié. Vous n’avez
				pas besoin de changer le lien.
			</OnConfirmModal>
			<OnConfirmModal
				modal={onConfirmLeaveModal}
				title={`Vos modifications ne sont pas enregistrées`}
				confirmText="Quitter la page"
				cancelText="Continuer l’édition du formulaire"
				handleOnConfirm={leave}
				priorityReversed
			>
				Si vous quittez cette page, vos modifications seront perdues.
				<br />
				Vous pouvez publier votre formulaire modifié depuis l’écran de
				configuration du formulaire.
			</OnConfirmModal>
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
							href={`${process.env.NEXT_PUBLIC_FORM_APP_URL}/Demarches/${form.product_id}?iframe=true&formConfig=${encodeURIComponent(JSON.stringify(tmpConfigHelper))}`}
							target={'_blank'}
						>
							Prévisualiser
						</Link>
					)}
					<Button
						priority="primary"
						iconId="fr-icon-computer-line"
						iconPosition="right"
						onClick={() => {
							onConfirmPublishModal.open();
						}}
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
					<FormConfigurator
						form={form}
						onChange={onChangeConfig}
						onPublish={() => {
							onConfirmPublishModal.open();
						}}
						hasConfigChanged={hasConfigChanged}
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
			form: JSON.parse(JSON.stringify(form))
		}
	};
};

export default ProductFormPage;
