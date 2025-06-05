import { ProductWithForms } from '@/src/types/prismaTypesExtended';
import { getIntentionFromAverage } from '@/src/utils/stats';
import {
	formatDateToFrenchString,
	formatNumberWithSpaces,
	getColorFromIntention,
	getReadableValue
} from '@/src/utils/tools';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import { Badge } from '@codegouvfr/react-dsfr/Badge';
import Button from '@codegouvfr/react-dsfr/Button';
import { Menu, MenuItem, Skeleton } from '@mui/material';
import { AnswerIntention, Entity } from '@prisma/client';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import router from 'next/router';
import { tss } from 'tss-react/dsfr';
import NoButtonsPanel from '../Pannels/NoButtonsPanel';
import NoReviewsPanel from '../Pannels/NoReviewsPanel';
import { createModal, ModalProps } from '@codegouvfr/react-dsfr/Modal';
import OnConfirmModal from '../../ui/modal/OnConfirm';
import React, { useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { Input } from '@codegouvfr/react-dsfr/Input';
import { Toast } from '../../ui/Toast';
import Image from 'next/image';
import starFill from '.././../../../public/assets/star-fill.svg';
import starOutline from '.././../../../public/assets/star-outline.svg';
import { push } from '@socialgouv/matomo-next';

interface Indicator {
	title: string;
	slug: string;
	total: number;
	value: number;
	color: 'new' | 'success' | 'error' | 'info';
	appreciation: AnswerIntention;
}

interface CreateModalProps {
	buttonProps: {
		/** Only for analytics, feel free to overwrite */
		id: string;
		'aria-controls': string;
		'data-fr-opened': boolean;
	};
	Component: (props: ModalProps) => JSX.Element;
	close: () => void;
	open: () => void;
	isOpenedByDefault: boolean;
	id: string;
}

interface FormValues {
	product_name: string;
}

const ProductCard = ({
	product,
	userId,
	entity,
	isFavorite,
	showFavoriteButton,
	onRestoreProduct,
	onDeleteProduct,
	onDeleteEssential
}: {
	product: ProductWithForms;
	userId: number;
	entity: Entity;
	isFavorite: boolean;
	showFavoriteButton: boolean;
	onRestoreProduct: () => void;
	onDeleteProduct: () => void;
	onDeleteEssential: () => void;
}) => {
	const [onConfirmModalRestore, setOnConfirmModalRestore] =
		useState<CreateModalProps | null>(null);
	const [onConfirmModalArchive, setOnConfirmModalArchive] =
		useState<CreateModalProps | null>(null);
	const [displayToast, setDisplayToast] = React.useState<boolean>(false);

	const [validateDelete, setValidateDelete] = useState(false);

	const utils = trpc.useUtils();
	const { data: session } = useSession();
	const { classes, cx } = useStyles();

	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const menuOpen = Boolean(anchorEl);
	const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		event.stopPropagation();
		setAnchorEl(event.currentTarget);
		push(['trackEvent', 'BO - Product', `Open-Menu`]);
	};

	const {
		control,
		register,
		setError,
		clearErrors,
		formState: { errors }
	} = useForm<FormValues>({
		defaultValues: {
			product_name: ''
		}
	});

	const verifyProductName = (e: React.ChangeEvent<HTMLInputElement>) => {
		const normalizedInput = e.target.value.trim().toLowerCase();
		const normalizedTitle = product.title.trim().toLowerCase();
		if (normalizedInput !== normalizedTitle) {
			setError('product_name', {
				message:
					'Veuillez saisir le nom du service pour confirmer la suppression'
			});
			setValidateDelete(false);
		} else {
			clearErrors('product_name');
			setValidateDelete(true);
		}
	};

	const handleClose = (
		event: React.MouseEvent<HTMLButtonElement | HTMLLIElement>
	) => {
		event.preventDefault();
		event.stopPropagation();
		setAnchorEl(null);
	};

	const {
		data: resultStatsObservatoire,
		isLoading: isLoadingStatsObservatoire,
		isRefetching: isRefetchingStatsObservatoire
	} = trpc.answer.getObservatoireStats.useQuery(
		{
			product_id: product.id.toString(),
			start_date: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
				.toISOString()
				.split('T')[0],
			end_date: new Date().toISOString().split('T')[0]
		},
		{
			trpc: {
				context: {
					skipBatch: true
				}
			},
			initialData: {
				data: {
					satisfaction: 0,
					comprehension: 0,
					contact: 0,
					contact_reachability: 0,
					contact_satisfaction: 0,
					autonomy: 0
				},
				metadata: {
					satisfaction_count: 0,
					comprehension_count: 0,
					contact_count: 0,
					contactReachability_count: 0,
					contactSatisfaction_count: 0,
					autonomy_count: 0
				}
			}
		}
	);

	const archiveProduct = trpc.product.archive.useMutation({
		onSuccess: () => {
			utils.product.getList.invalidate({});
			onDeleteProduct();
		}
	});

	const restoreProduct = trpc.product.restore.useMutation({
		onSuccess: () => {
			utils.product.getList.invalidate({ filterByStatusArchived: true });
			onRestoreProduct();
		}
	});

	const { data: reviewsData, isLoading: isLoadingReviewsCount } =
		trpc.review.getList.useQuery({
			numberPerPage: 0,
			page: 1,
			product_id: product.id
		});

	const nbReviews = reviewsData?.metadata.countAll;
	const nbNewReviews = reviewsData?.metadata.countNew;

	const createFavorite = trpc.favorite.create.useMutation({
		onSuccess: result => {
			utils.product.getList.invalidate({ filterByUserFavorites: true });
			utils.favorite.getByUser.invalidate({ user_id: result.data.user_id });
		}
	});

	const deleteFavorite = trpc.favorite.delete.useMutation({
		onSuccess: result => {
			utils.product.getList.invalidate({ filterByUserFavorites: true });
			utils.favorite.getByUser.invalidate({ user_id: result.data.user_id });
		}
	});

	const diplayAppreciation = (appreciation: AnswerIntention, slug: string) => {
		switch (appreciation) {
			case 'bad':
				return slug === 'contact' ? 'Faible' : 'Mauvais';
			case 'medium':
				return 'Moyen';
			case 'good':
				return slug === 'contact' ? 'Optimal' : 'Bien';
		}
	};

	const { satisfaction, comprehension, contact, autonomy } =
		resultStatsObservatoire.data;

	const indicators: Indicator[] = [
		{
			title: 'Satisfaction',
			slug: 'satisfaction',
			total: resultStatsObservatoire.metadata.satisfaction_count,
			value: Math.round(satisfaction * 10) / 10 || 0,
			color:
				satisfaction !== -1
					? getColorFromIntention(getIntentionFromAverage(satisfaction || 0))
					: 'info',
			appreciation: getIntentionFromAverage(satisfaction || 0)
		},
		{
			title: 'Simplicité du langage',
			slug: 'comprehension',
			value: Math.round(comprehension * 10) / 10 || 0,
			total: resultStatsObservatoire.metadata.comprehension_count,
			color:
				comprehension !== -1
					? getColorFromIntention(getIntentionFromAverage(comprehension || 0))
					: 'info',
			appreciation: getIntentionFromAverage(comprehension || 0)
		},
		{
			title: 'Aide joignable et efficace',
			slug: 'contact',
			total: resultStatsObservatoire.metadata.contact_count,
			value: Math.round(contact * 1000) / 100 || 0,
			color:
				contact !== -1
					? getColorFromIntention(
							getIntentionFromAverage(contact || 0, 'contact')
						)
					: 'info',
			appreciation: getIntentionFromAverage(contact || 0, 'contact')
		}
	];

	const handleButtonClick = () => {
		router.push({
			pathname: `/administration/dashboard/product/${product.id}/forms`,
			query: { autoCreate: true }
		});
	};

	const handleSendInvitation = () => {
		router.push({
			pathname: `/administration/dashboard/product/${product.id}/access`,
			query: { autoInvite: true }
		});
	};

	React.useEffect(() => {
		if (product) {
			setOnConfirmModalRestore(
				createModal({
					id: `restore-on-confirm-modal-${product.id}`,
					isOpenedByDefault: false
				})
			);

			setOnConfirmModalArchive(
				createModal({
					id: `archive-on-confirm-modal-${product.id}`,
					isOpenedByDefault: false
				})
			);
		}
	}, [product]);

	if (!onConfirmModalRestore || !onConfirmModalArchive) return;

	const isDisabled = product.status === 'archived';
	const productLink = isDisabled
		? ''
		: `/administration/dashboard/product/${product.id}/stats`;

	return (
		<>
			<Toast
				isOpen={displayToast}
				setIsOpen={setDisplayToast}
				autoHideDuration={4000}
				severity="success"
				message="Le service a été correctement supprimé"
			/>
			<OnConfirmModal
				modal={onConfirmModalRestore}
				title="Restaurer un service"
				handleOnConfirm={() => {
					restoreProduct.mutate({
						product_id: product.id
					});
					onConfirmModalRestore.close();
				}}
			>
				<div>
					<p>
						Vous êtes sûr de vouloir restaurer le service{' '}
						<b>"{product.title}"</b> ?{' '}
					</p>
				</div>
			</OnConfirmModal>
			<OnConfirmModal
				modal={onConfirmModalArchive}
				title="Supprimer ce service"
				handleOnConfirm={() => {
					if (nbReviews && nbReviews > 1000) {
						if (validateDelete) {
							archiveProduct.mutate({
								product_id: product.id
							});
							onConfirmModalArchive.close();
						} else {
							setValidateDelete(false);
						}
					} else {
						archiveProduct.mutate({
							product_id: product.id
						});
						onConfirmModalArchive.close();
					}
				}}
				kind="danger"
				disableAction={nbReviews && nbReviews > 1000 ? !validateDelete : false}
			>
				<div>
					<p>
						Vous êtes sûr de vouloir supprimer le service{' '}
						<b>"{product.title}"</b> ?{' '}
					</p>
					<p>En supprimant ce service :</p>
					<ul className={fr.cx('fr-mb-8v')}>
						<li>vous n’aurez plus accès aux avis du formulaire,</li>
						<li>
							les utilisateurs de ce service n’auront plus accès au formulaire.
						</li>
					</ul>
					{nbReviews && nbReviews > 1000 ? (
						<form id="delete-product-form">
							<div className={fr.cx('fr-input-group')}>
								<Controller
									control={control}
									name="product_name"
									rules={{ required: 'Ce champ est obligatoire' }}
									render={({ field: { value, onChange, name } }) => (
										<Input
											label={
												<p className={fr.cx('fr-mb-0')}>
													Veuillez saisir le nom du service pour confirmer la
													suppression
													<span className={cx(classes.asterisk)}>*</span>
												</p>
											}
											nativeInputProps={{
												onChange: e => {
													onChange(e);
													verifyProductName(e);
												},
												defaultValue: value,
												value,
												name,
												required: true
											}}
											state={errors[name] ? 'error' : 'default'}
											stateRelatedMessage={errors[name]?.message}
										/>
									)}
								/>
							</div>
						</form>
					) : (
						<></>
					)}
				</div>
			</OnConfirmModal>{' '}
			<Link
				href={`/administration/dashboard/product/${product.id}/forms`}
				tabIndex={-1}
			>
				<div className={fr.cx('fr-card', 'fr-my-3w', 'fr-p-2w')}>
					<div
						className={cx(
							fr.cx('fr-grid-row', 'fr-grid-row--gutters'),
							classes.gridProduct
						)}
					>
						<div
							className={cx(
								fr.cx('fr-col-12', 'fr-col-6', 'fr-col-md-6', 'fr-pb-1v'),
								classes.titleSection
							)}
						>
							<Link
								href={`/administration/dashboard/product/${product.id}/forms`}
								tabIndex={0}
								title={`Voir les statistiques pour le service ${product.title}`}
								className={cx(classes.productLink, fr.cx('fr-link'))}
							>
								<span className={cx(classes.productTitle)}>
									{product.title}
								</span>
							</Link>
						</div>
						<div
							className={cx(
								fr.cx('fr-col', 'fr-col-6', 'fr-pb-1v'),
								classes.badgesSection
							)}
						>
							{(product.isTop250 || isDisabled) && (
								<div className={classes.badgesContainer}>
									{product.isTop250 && (
										<Badge severity="info" noIcon small>
											Démarche essentielle
										</Badge>
									)}
									{isDisabled && (
										<Badge noIcon small>
											Service supprimé
										</Badge>
									)}
								</div>
							)}
							{showFavoriteButton && !isDisabled && (
								<Button
									//iconId={isFavorite ? 'ri-star-fill' : 'ri-star-line'}
									title={
										isFavorite
											? `Supprimer le produit « ${product.title} » des favoris`
											: `Ajouter le produit « ${product.title} » aux favoris`
									}
									aria-label={
										isFavorite
											? `Supprimer le produit « ${product.title} » des favoris`
											: `Ajouter le produit « ${product.title} » aux favoris`
									}
									className={cx(fr.cx('fr-ml-2v'), classes.buttonWrapper)}
									priority="tertiary"
									size="small"
									onClick={e => {
										e.preventDefault();
										if (isFavorite) {
											deleteFavorite.mutate({
												product_id: product.id,
												user_id: userId
											});
											push(['trackEvent', 'BO - Product', `Set-Favorite`]);
										} else {
											createFavorite.mutate({
												product_id: product.id,
												user_id: userId
											});
											push(['trackEvent', 'BO - Product', `Unset-Favorite`]);
										}
									}}
								>
									{isFavorite ? (
										<Image alt="favoris ajouté" src={starFill} />
									) : (
										<Image alt="favoris retiré" src={starOutline} />
									)}
								</Button>
							)}
						</div>
						<div
							className={cx(
								fr.cx('fr-col-12', 'fr-col-md-12', 'fr-pt-1v'),
								classes.entitySection
							)}
						>
							<p className={cx(fr.cx('fr-mb-0'), classes.entityName)}>
								{entity?.name}
							</p>
						</div>

						{isDisabled ? (
							<div
								className={cx(
									classes.buttonsCol,
									fr.cx('fr-col', 'fr-col-12', 'fr-col-md-12')
								)}
							>
								<Button
									iconId={'ri-inbox-unarchive-line'}
									iconPosition="right"
									title={`Restaurer le produit « ${product.title} »`}
									aria-label={`Restaurer le produit « ${product.title} »`}
									priority="secondary"
									size="small"
									onClick={e => {
										e.preventDefault();
										onConfirmModalRestore.open();
										push(['trackEvent', 'BO - Product', `Restore`]);
									}}
								>
									Restaurer
								</Button>
							</div>
						) : (
							<>
								{!isLoadingReviewsCount && nbReviews !== undefined && (
									<div className={cx(fr.cx('fr-col', 'fr-col-12', 'fr-col-md-12'))}> 
										{product.forms.slice(0, 2).map((form) => (
											<div key={form.id} className={cx(fr.cx('fr-grid-row', 'fr-grid-row--gutters'), classes.formCard)}>
												<Link href={`/administration/dashboard/product/${product.id}/forms/${form.id}`} className={classes.formLink} />	
												<div className={cx(fr.cx('fr-col', 'fr-col-12', 'fr-col-md-6', 'fr-pb-0', 'fr-p-4v'))}> 
														<span className={cx(classes.productTitle)}>
															{form.title || form.form_template.title}
														</span>
												</div>
												<div className={cx(fr.cx('fr-col', 'fr-col-12', 'fr-col-md-6', 'fr-p-4v'), classes.formStatsWrapper)}> 
													<div className={classes.formStatsContent}>
														<span className={cx(fr.cx('fr-mr-2v'), classes.smallText)}>
															Réponses déposées
														</span>
														<span className={fr.cx('fr-text--bold', 'fr-mr-4v')}>{formatNumberWithSpaces(nbReviews)}</span>
														<Badge severity="success" noIcon small>
															{nbNewReviews} NOUVELLES RÉPONSES
														</Badge>
													</div>
												</div>
											</div>
										))}
										{product.forms.length > 2 && (
											<Link
												href={`/administration/dashboard/product/${product.id}/forms`}
												title={`Voir les formulaires pour ${product.title}`}
												className={fr.cx('fr-link')}
											>
												Voir tous les formulaires ({product.forms.length})
											</Link>
										)}
									</div>
								)}
								{/* <div
									className={cx(
										fr.cx('fr-col', 'fr-col-12', 'fr-pt-0'),
										classes.statsSection
									)}
								>
									{isLoadingStatsObservatoire ||
									isRefetchingStatsObservatoire ? (
										<Skeleton
											className={cx(classes.cardSkeleton)}
											variant="text"
											width={'full'}
											height={50}
										/>
									) : (product.forms[0]?.buttons.length > 0 &&
											nbReviews &&
											nbReviews > 0) ||
									  session?.user.role.includes('admin') ? (
										<div
											className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}
										>
											{indicators.map((indicator, index) => (
												<div
													className={fr.cx(
														'fr-col',
														'fr-col-12',
														'fr-col-sm-6',
														'fr-col-md-3'
													)}
													key={index}
												>
													<p
														className={fr.cx(
															'fr-text--xs',
															'fr-mb-0',
															'fr-hint-text'
														)}
													>
														{indicator.title}
													</p>
													{isLoadingStatsObservatoire ? (
														<Skeleton
															className={cx(classes.badgeSkeleton)}
															variant="text"
															width={130}
															height={25}
														/>
													) : (
														<p
															className={cx(
																fr.cx(
																	!(
																		!!indicator.total &&
																		indicator.color !== 'new'
																	) && 'fr-label--disabled',
																	'fr-text--bold'
																),
																classes.indicatorText,
																!!indicator.total && classes[indicator.color]
															)}
														>
															{!!indicator.total
																? `${diplayAppreciation(indicator.appreciation, indicator.slug)} ${getReadableValue(indicator.value)}${indicator.slug === 'contact' ? '%' : '/10'}`
																: 'Aucune donnée'}
														</p>
													)}
												</div>
											))}
											{!isLoadingReviewsCount && nbReviews !== undefined && (
												<div
													className={fr.cx(
														'fr-col',
														'fr-col-12',
														'fr-col-sm-6',
														'fr-col-md-3'
													)}
												>
													<div
														className={fr.cx(
															'fr-grid-row',
															'fr-grid-row--gutters'
														)}
													>
														<div className={fr.cx('fr-col-12')}>
															<p className={fr.cx('fr-text--xs', 'fr-mb-0')}>
																Nombre d'avis
															</p>
														</div>
													</div>
													<div
														className={fr.cx(
															'fr-grid-row',
															'fr-grid-row--gutters'
														)}
													>
														<div
															className={cx(
																fr.cx('fr-col-12', 'fr-col-xl-4', 'fr-pt-0')
															)}
														>
															<div
																className={fr.cx(
																	'fr-label--info',
																	'fr-text--bold',
																	'fr-pt-0-5v'
																)}
															>
																{formatNumberWithSpaces(nbReviews)}
															</div>
														</div>
														<div
															className={cx(
																classes.reviewWrapper,
																fr.cx('fr-col-12', 'fr-col-xl-8', 'fr-pt-0')
															)}
														>
															<div className={fr.cx('fr-label--info')}>
																{nbNewReviews !== undefined &&
																	nbNewReviews > 0 && (
																		<>
																			<span
																				title={`${nbNewReviews <= 9 ? nbNewReviews : 'Plus de 9'} ${nbNewReviews === 1 ? 'nouvel' : 'nouveaux'} avis pour ${product.title}`}
																			>
																				<Badge
																					severity="new"
																					className={fr.cx('fr-mr-4v')}
																				>
																					{`${nbNewReviews <= 9 ? `${nbNewReviews}` : '9+'}`}
																				</Badge>
																			</span>
																		</>
																	)}
															</div>
															{nbReviews > 0 && (
																<Link
																	href={`/administration/dashboard/product/${product.id}/reviews`}
																	title={`Voir les avis pour ${product.title}`}
																	className={fr.cx('fr-link')}
																>
																	Voir les avis
																</Link>
															)}
														</div>
													</div>
												</div>
											)}
										</div>
									) : product.forms[0]?.buttons.length === 0 ? (
										<NoButtonsPanel onButtonClick={handleButtonClick} />
									) : (
										<NoReviewsPanel
											improveBtnClick={() => {}}
											sendInvitationBtnClick={handleSendInvitation}
										/>
									)}
								</div> */}
							</>
						)}
					</div>
				</div>
			</Link>
		</>
	);
};

const useStyles = tss.withName(ProductCard.name).create({
	gridProduct: {
		[fr.breakpoints.down('md')]: {
			'.rightButtonsWrapper': {
				order: 0
			},
			'.titleSection': {
				order: 1
			},
			'.entitySection': {
				order: 2
			},
			'.badgesSection': {
				order: 3
			},
			'.statsSection': {
				order: 4
			}
		}
	},
	titleSection: {},
	entitySection: {},
	badgesSection: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'end'
	},
	statsSection: {},
	rightButtonsWrapper: {
		display: 'flex',
		justifyContent: 'end'
	},
	buttonWrapper: {
		maxHeight: '32px !important',
		'&::before': {
			marginRight: '0 !important'
		}
	},
	badgeSkeleton: {
		transformOrigin: '0',
		transform: 'none'
	},
	cardSkeleton: {},
	productLink: {
		backgroundImage: 'none'
	},
	formLink: {},
	productTitle: {
		fontSize: '18px',
		lineHeight: '1.5rem',
		fontWeight: 'bold',
		color: fr.colors.decisions.text.title.blueFrance.default,
		'&:hover': {
			textDecoration: 'underline'
		}
	},
	menuItem: {
		color: fr.colors.decisions.text.title.blueFrance.default
	},
	entityName: {
		color: '#666666'
	},
	indicatorText: {
		marginBottom: 0
	},
	disabled: {
		cursor: 'default',
		'.fr-card': {
			backgroundColor: fr.colors.decisions.background.disabled.grey.default
		},
		a: {
			color: fr.colors.decisions.text.default.grey.default,
			pointerEvents: 'none',
			cursor: 'default',
			textDecoration: 'none'
		}
	},
	badgesContainer: {
		display: 'flex',
		gap: fr.spacing('2v'),
		marginRight: '1rem'
	},
	reviewWrapper: {
		display: 'flex',
		justifyContent: 'flex-end',
		[fr.breakpoints.down('xl')]: {
			justifyContent: 'flex-start'
		}
	},
	formCard: {
		backgroundColor: fr.colors.decisions.background.contrast.info.default,
		display: 'flex',
		flexWrap: 'wrap',
		width: '100%',
		maxWidth: '100%',
		marginLeft: 0,
		marginRight: 0,
		marginBottom: '1.5rem',
		':nth-child(2), :last-child': {
			marginBottom: '0.5rem'
		}
	},
	formStatsWrapper: {
		display: 'flex',
		justifyContent: 'flex-end',
		alignItems: 'center'
	},
	formStatsContent: {
		display: 'flex',
		alignItems: 'center',
		gap: fr.spacing('1v')
	},
	smallText: {
		color: fr.colors.decisions.text.default.grey.default,
		fontSize: "0.8rem"
	},
	notifSpan: {
		display: 'block',
		backgroundColor: fr.colors.decisions.background.flat.redMarianne.default,
		color: fr.colors.decisions.background.default.grey.default,
		borderRadius: '50%',
		height: '1.4rem',
		width: '1.4rem',
		fontSize: '0.8rem',
		textAlign: 'center'
	},
	menuItemDanger: {
		color: fr.colors.decisions.text.default.error.default
	},
	buttonsCol: {
		textAlign: 'right'
	},
	asterisk: {
		color: fr.colors.decisions.text.default.error.default
	},
	info: {
		color: fr.colors.decisions.text.default.info.default
	},
	error: {
		color: fr.colors.decisions.text.default.error.default
	},
	new: {
		color: fr.colors.decisions.background.flat.yellowTournesol.default
	},
	success: {
		color: fr.colors.decisions.text.default.success.default
	}
});

export default ProductCard;
