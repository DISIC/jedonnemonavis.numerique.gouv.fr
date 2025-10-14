import DashboardTab from '@/src/components/dashboard/Form/tabs/dashboard';
import LinksTab from '@/src/components/dashboard/Form/tabs/links';
import ReviewsTab from '@/src/components/dashboard/Form/tabs/reviews';
import SettingsTab from '@/src/components/dashboard/Form/tabs/settings';
import StatsTab from '@/src/components/dashboard/Form/tabs/stats';
import ButtonModal, {
	ButtonModalType
} from '@/src/components/dashboard/ProductButton/ButtonModal';
import {
	ButtonWithForm,
	FormWithElements
} from '@/src/types/prismaTypesExtended';
import prisma from '@/src/utils/db';
import { getValidTabSlug } from '@/src/utils/tools';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Badge from '@codegouvfr/react-dsfr/Badge';
import Breadcrumb from '@codegouvfr/react-dsfr/Breadcrumb';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import Notice from '@codegouvfr/react-dsfr/Notice';
import { Tabs } from '@codegouvfr/react-dsfr/Tabs';
import { RightAccessStatus } from '@prisma/client';
import { GetServerSideProps } from 'next';
import { getToken } from 'next-auth/jwt';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { tss } from 'tss-react/dsfr';

const buttonModal = createModal({
	id: 'button-modal',
	isOpenedByDefault: false
});

interface Props {
	form: FormWithElements;
	ownRight: Exclude<RightAccessStatus, 'removed'>;
}

export type TabsSlug = 'dashboard' | 'reviews' | 'stats' | 'links' | 'settings';

const ProductFormPage = (props: Props) => {
	const router = useRouter();
	const { form, ownRight } = props;
	const { classes, cx } = useStyles();

	const [modalType, setModalType] = useState<ButtonModalType>();
	const [currentButton, setCurrentButton] = useState<ButtonWithForm | null>(
		null
	);
	const [alertText, setAlertText] = useState<string>('');
	const [isAlertShown, setIsAlertShown] = useState<boolean>(false);
	const [selectedTabId, setSelectedTabId] = useState<TabsSlug>(
		getValidTabSlug(router.query.tab as string | undefined)
	);

	const tabsRef = useRef<HTMLDivElement>(null);

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

	const {
		data: buttonResults,
		isLoading: isLoadingButtons,
		isRefetching: isRefetchingButtons,
		refetch: refetchButtons
	} = trpc.button.getList.useQuery(
		{
			page: 1,
			numberPerPage: 1000,
			form_id: form.id,
			isTest: false
		},
		{
			initialData: {
				data: [],
				metadata: {
					count: 0
				}
			},
			enabled: !!form.id && !isNaN(form.id)
		}
	);

	const nbButtons = buttonResults?.metadata.count || 0;
	const nbReviews = reviewsData?.metadata.countFiltered || 0;

	const handleModalOpening = (
		modalType: ButtonModalType,
		button?: ButtonWithForm
	) => {
		setCurrentButton(button ? button : null);
		setModalType(modalType);
		buttonModal.open();
	};

	const onButtonMutation = async (
		isTest: boolean,
		finalButton: ButtonWithForm
	) => {
		buttonModal.close();
		await refetchButtons();

		switch (modalType) {
			case 'create': {
				setAlertText(
					`Le lien d'intégration "${finalButton.title}" a été créé avec succès.`
				);
				setIsAlertShown(true);
				handleModalOpening('install', finalButton);
				break;
			}
			case 'delete': {
				setAlertText(
					`Le lien d'intégration "${finalButton.title}" a bien été fermé.`
				);
				setIsAlertShown(true);
				break;
			}
		}
	};

	useEffect(() => {
		if (!router.isReady) return;
		setSelectedTabId(getValidTabSlug(router.query.tab as string | undefined));
	}, [router.asPath]);

	return (
		<div className={fr.cx('fr-container', 'fr-my-4w')}>
			<Head>
				<title>{`${form.product.title} | ${form.title || form.form_template.title} | Je donne mon avis`}</title>
				<meta
					name="description"
					content={`${form.product.title} | ${form.title || form.form_template.title} | Je donne mon avis`}
				/>
			</Head>
			<ButtonModal
				form_id={form.id}
				modal={buttonModal}
				modalType={modalType}
				button={currentButton}
				onButtonMutation={onButtonMutation}
			/>
			<Breadcrumb
				currentPageLabel={
					'Formulaire : ' + (form.title || form.form_template.title)
				}
				segments={breadcrumbSegments}
				className={fr.cx('fr-mb-4v')}
			/>
			<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-mb-6v')}>
				<div className={fr.cx('fr-col-12')}>
					<div className={cx(classes.titleContainer, fr.cx('fr-mb-6v'))}>
						<h1 className={fr.cx('fr-mb-0')}>
							{form.title || form.form_template.title}
						</h1>
						{form.product.isTop250 && (
							<Badge severity="info" noIcon className={fr.cx('fr-ml-md-6v')}>
								Démarche essentielle
							</Badge>
						)}
						{form.isDeleted && (
							<Badge severity="error" noIcon className="fr-ml-md-3v">
								Fermé
							</Badge>
						)}
					</div>
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
					{form.product.isTop250 && (
						<Notice
							isClosable
							onClose={function noRefCheck() {}}
							className={cx(classes.notice, fr.cx('fr-mt-6v'))}
							title={'Ce formulaire ne peut être ni édité ni supprimé'}
							description={
								<>
									Ce service est référencé comme démarche essentielle dans l’
									<a
										href="https://observatoire.numerique.gouv.fr/"
										target="_blank"
									>
										Observatoire des démarches essentielles
									</a>
									. Ce formulaire ne peut donc pas être modifié ou supprimé du
									service.
								</>
							}
						/>
					)}
					{form.isDeleted && (
						<Notice
							severity="alert"
							className={cx(classes.notice, fr.cx('fr-mt-6v'))}
							title={'Ce formulaire est fermé et ne peut être plus être édité'}
						/>
					)}
				</div>
				<div className={fr.cx('fr-col-12', 'fr-mt-4v')}>
					<Tabs
						ref={tabsRef}
						selectedTabId={selectedTabId}
						onTabChange={tabSlug => {
							const { tab, ...restQuery } = router.query;
							router.push(
								{
									pathname: router.pathname,
									query:
										tabSlug !== 'dashboard'
											? {
													...router.query,
													tab: tabSlug
												}
											: restQuery
								},
								undefined,
								{ shallow: true }
							);
						}}
						tabs={[
							{
								tabId: 'dashboard',
								label: 'Tableau de bord'
							},
							{
								tabId: 'reviews',
								label: 'Réponses'
							},
							{
								tabId: 'stats',
								label: 'Statistiques'
							},
							...(ownRight === 'carrier_admin'
								? [
										{
											tabId: 'links',
											label: "Liens d'intégration"
										},
										{
											tabId: 'settings',
											label: 'Paramètres'
										}
									]
								: [])
						]}
					>
						{selectedTabId === 'dashboard' && (
							<DashboardTab
								form={form}
								hasButtons={nbButtons > 0}
								nbReviews={nbReviews}
								isLoading={isLoadingReviewsCount}
								handleModalOpening={handleModalOpening}
								onClickGoToReviews={() => {
									tabsRef.current
										?.querySelector<HTMLButtonElement>(
											'li[role="presentation"]:nth-child(2) button[role="tab"]'
										)
										?.click();
								}}
							/>
						)}
						{selectedTabId === 'reviews' && (
							<ReviewsTab
								form={form}
								ownRight={ownRight}
								handleModalOpening={handleModalOpening}
								hasButtons={nbButtons > 0}
							/>
						)}
						{selectedTabId === 'stats' && (
							<StatsTab
								form={form}
								ownRight={ownRight}
								handleModalOpening={handleModalOpening}
								onClickGoToReviews={() => {
									tabsRef.current
										?.querySelector<HTMLButtonElement>(
											'li[role="presentation"]:nth-child(2) button[role="tab"]'
										)
										?.click();
								}}
							/>
						)}
						{ownRight === 'carrier_admin' && (
							<>
								{selectedTabId === 'links' && (
									<LinksTab
										form={form}
										ownRight={ownRight}
										modal={buttonModal}
										handleModalOpening={handleModalOpening}
										alertText={alertText}
										isAlertShown={isAlertShown}
										setIsAlertShown={setIsAlertShown}
									/>
								)}
								{selectedTabId === 'settings' && (
									<SettingsTab
										form={form}
										alertText={alertText}
										isAlertShown={isAlertShown}
										setIsAlertShown={setIsAlertShown}
									/>
								)}
							</>
						)}
					</Tabs>
				</div>
			</div>
		</div>
	);
};

const useStyles = tss.withName(ProductFormPage.name).create({
	backLink: {
		backgroundImage: 'none'
	},
	titleContainer: {
		display: 'flex',
		alignItems: 'center',
		[fr.breakpoints.down('md')]: {
			flexDirection: 'column',
			alignItems: 'start',
			gap: fr.spacing('2v')
		},
		'& .fr-badge': {
			textWrap: 'nowrap'
		}
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
	notice: {
		p: { display: 'flex', flexDirection: 'column', gap: fr.spacing('2v') }
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
