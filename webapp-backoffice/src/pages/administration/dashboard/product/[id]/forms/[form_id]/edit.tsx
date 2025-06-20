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
import { useCallback, useEffect, useMemo, useState } from 'react';
import { tss } from 'tss-react/dsfr';
import OnConfirmModal from '@/src/components/ui/modal/OnConfirm';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useRouter } from 'next/router';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import FormCreationModal from '@/src/components/dashboard/Form/FormCreationModal';
import CustomFormHelpPanel from '@/src/components/dashboard/Pannels/CustomFormHelpPanel';
import { useUserSettings } from '@/src/contexts/UserSettingsContext';
import { Tooltip } from '@codegouvfr/react-dsfr/Tooltip';

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

const rename_form_modal = createModal({
	id: 'rename-form-modal',
	isOpenedByDefault: false
});

const formHelpModal = createModal({
	id: 'form-help-modal',
	isOpenedByDefault: false
});

const ProductFormPage = (props: Props) => {
	const { form } = props;
	const router = useRouter();
	const formConfig = form.form_configs[0];

	const {
		settings,
		setSetting,
		isLoading: isLoadingSettings
	} = useUserSettings();

	const { classes, cx } = useStyles();

	const createFormConfig = trpc.formConfig.create.useMutation({
		onSuccess: response => {
			router.push(
				`/administration/dashboard/product/${form.product.id}/forms/${form.id}?formPublished=true`
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
	const [shouldModalOpen, setShouldModalOpen] = useState(false);

	useEffect(() => {
		if (isLoadingSettings) return;
		setShouldModalOpen(!settings.formHelpModalSeen);
	}, [isLoadingSettings]);

	useEffect(() => {
		if (shouldModalOpen) {
			formHelpModal.open();
		}
	}, [shouldModalOpen, formHelpModal]);

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
		},
		{
			label: 'Formulaire : ' + (form.title || form.form_template.title),
			linkProps: {
				href: `/administration/dashboard/product/${form.product.id}/forms/${form.id}`
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
				createFormConfig.mutate({
					...createConfig,
					version: form.form_configs.length + 1
				});
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

	useIsModalOpen(formHelpModal, {
		onConceal: () => {
			if (!settings.formHelpModalSeen && shouldModalOpen) {
				setSetting('formHelpModalSeen', true);
			}
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
				Vos usagers auront directement accès au formulaire modifié, sans
				nécessité de rééditer le lien d'accès.
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
			<FormCreationModal
				form={form}
				productId={form.product.id}
				modal={rename_form_modal}
			/>
			<Breadcrumb
				currentPageLabel={'Personnaliser le formulaire'}
				segments={breadcrumbSegments}
				className={fr.cx('fr-mb-4v')}
			/>
			<OnConfirmModal
				modal={formHelpModal}
				title={``}
				handleOnConfirm={() => {
					formHelpModal.close();
				}}
			>
				<CustomFormHelpPanel />
			</OnConfirmModal>
			<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-mb-6v')}>
				<div className={fr.cx('fr-col-8')}>
					<div className={cx(classes.titleContainer)}>
						<h1 className={fr.cx('fr-mb-0')}>
							{form.title || form.form_template.title}
						</h1>
						<Tooltip
							className={classes.tooltip}
							kind="hover"
							title={
								<>
									<b>Pourquoi ce modèle ?</b>
									<br />
									<span>
										Évaluez le niveau de satisfaction de votre service numérique
										et identifiez les problèmes rencontrés par vos usagers.
										<br />
										Récoltez des données sur les indicateurs clés définis par la
										plateforme Vos démarches essentielles.
									</span>
								</>
							}
						/>
					</div>
				</div>
				<div className={cx(classes.headerButtons, fr.cx('fr-col-4'))}>
					<Button
						priority="secondary"
						iconId="fr-icon-edit-line"
						iconPosition="right"
						onClick={() => rename_form_modal.open()}
						size="small"
					>
						Renommer
					</Button>
				</div>
				<div className={fr.cx('fr-col-12', 'fr-pb-0')}>
					<hr className={fr.cx('fr-hr')} />
				</div>
				<div className={fr.cx('fr-col-8')}>
					<h2 className={fr.cx('fr-mb-0')}>Personnaliser le formulaire</h2>
				</div>
				<div className={cx(classes.headerButtons, fr.cx('fr-col-4'))}>
					{hasConfigChanged && (
						<Link
							className={fr.cx('fr-btn', 'fr-btn--secondary', 'fr-btn--lg')}
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
						size="large"
					>
						Publier
					</Button>
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
	},
	tooltip: {
		...fr.typography[18].style
	},
	titleContainer: {
		display: 'flex',
		alignItems: 'center',
		'.fr-icon-question-line': {
			marginLeft: fr.spacing('2v')
		}
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
			form: JSON.parse(JSON.stringify(form))
		}
	};
};

export default ProductFormPage;
