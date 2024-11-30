import { ProductWithButtons } from '@/src/types/prismaTypesExtended';
import { getIntentionFromAverage } from '@/src/utils/stats';
import {
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
	onDeleteProduct
}: {
	product: ProductWithButtons;

	userId: number;
	entity: Entity;
	isFavorite: boolean;
	showFavoriteButton: boolean;
	onRestoreProduct: () => void;
	onDeleteProduct: () => void;
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
			pathname: `/administration/dashboard/product/${product.id}/buttons`,
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
						id: product.id
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
								id: product.id
							});
							onConfirmModalArchive.close();
						} else {
							setValidateDelete(false);
						}
					} else {
						archiveProduct.mutate({
							id: product.id
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
				href={`/administration/dashboard/product/${product.id}/stats`}
				tabIndex={0}
			>
				<div className={fr.cx('fr-card', 'fr-my-3w', 'fr-p-2w')} tabIndex={0}>
					<div
						className={cx(
							fr.cx('fr-grid-row', 'fr-grid-row--gutters'),
							classes.gridProduct
						)}
					>
						{(product.isTop250 || isDisabled) && (
							<div className={fr.cx('fr-col', 'fr-col-10', 'fr-pb-0')}>
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
							</div>
						)}

						<div className={fr.cx('fr-col', 'fr-col-8', 'fr-col-md-6')}>
							<h2 className={cx(classes.productTitle)}>{product.title}</h2>
						</div>
						<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-4')}>
							<p className={cx(fr.cx('fr-mb-0'), classes.entityName)}>
								{entity?.name}
							</p>
						</div>
						{isDisabled ? (
							<div
								className={cx(
									classes.buttonsCol,
									fr.cx('fr-col', 'fr-col-12', 'fr-col-md-2')
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
								<div
									className={cx(
										fr.cx('fr-col', 'fr-col-12', 'fr-col-md-2'),
										classes.rightButtonsWrapper
									)}
								>
									<Button
										id="button-options-service"
										iconId={'ri-more-2-fill'}
										title={`Ouvrir le menu contextuel du service « ${product.title} »`}
										aria-label={`Ouvrir le menu contextuel du service « ${product.title} »`}
										priority="tertiary"
										size="small"
										className={cx(classes.buttonWrapper)}
										onClick={handleMenuClick}
									>
										<span
											className={fr.cx('fr-hidden')}
										>{`Ouvrir le menu contextuel du service « ${product.title} »`}</span>
									</Button>
									<Menu
										id="option-menu"
										open={menuOpen}
										anchorEl={anchorEl}
										onClose={handleClose}
										MenuListProps={{
											'aria-labelledby': 'button-options-access-right'
										}}
									>
										<MenuItem
											onClick={e => {
												handleClose(e);
												onConfirmModalArchive.open();
											}}
											className={cx(classes.menuItemDanger)}
										>
											Supprimer ce service
										</MenuItem>
									</Menu>
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
													push([
														'trackEvent',
														'BO - Product',
														`Unset-Favorite`
													]);
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
								<div className={fr.cx('fr-col', 'fr-col-12', 'fr-pt-0')}>
									{isLoadingStatsObservatoire ||
									isRefetchingStatsObservatoire ? (
										<Skeleton
											className={cx(classes.cardSkeleton)}
											variant="text"
											width={'full'}
											height={50}
										/>
									) : (product.buttons.length > 0 &&
											nbReviews &&
											nbReviews > 0) ||
									  session?.user.role.includes('admin') ? (
										<div
											className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}
										>
											{indicators.map((indicator, index) => (
												<div
													className={fr.cx('fr-col', 'fr-col-6', 'fr-col-md-3')}
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
																	!!indicator.total && indicator.color !== 'new'
																		? `fr-label--${indicator.color}`
																		: 'fr-label--disabled',
																	'fr-text--bold'
																),
																classes.indicatorText
															)}
															style={
																!!indicator.total && indicator.color === 'new'
																	? {
																			color:
																				fr.colors.decisions.background.flat
																					.warning.default
																		}
																	: undefined
															}
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
													className={fr.cx('fr-col', 'fr-col-6', 'fr-col-md-3')}
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
																classes.reviewWrapper,
																fr.cx('fr-col-12', 'fr-pt-0')
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

															<div className={fr.cx('fr-label--info')}>
																{nbNewReviews !== undefined &&
																	nbNewReviews > 0 && (
																		<>
																			<span
																				title={`${nbNewReviews <= 9 ? nbNewReviews : 'Plus de 9'} ${nbNewReviews === 1 ? 'nouvel' : 'nouveaux'} avis pour ${product.title}`}
																			>
																				<Badge
																					noIcon
																					severity="info"
																					className={cx(fr.cx('fr-ml-4v'))}
																				>
																					{`${nbNewReviews <= 9 ? `+${nbNewReviews}` : '9+'}`}
																				</Badge>
																			</span>
																		</>
																	)}
															</div>
															{nbReviews > 0 && (
																<Link
																	href={`/administration/dashboard/product/${product.id}/reviews`}
																	title={`Voir les nouveaux avis pour ${product.title}`}
																	className={fr.cx('fr-link', 'fr-ml-4v')}
																>
																	Voir les avis
																</Link>
															)}
														</div>
													</div>
												</div>
											)}
										</div>
									) : product.buttons.length === 0 ? (
										<NoButtonsPanel onButtonClick={handleButtonClick} />
									) : (
										<NoReviewsPanel
											improveBtnClick={() => {}}
											sendInvitationBtnClick={handleSendInvitation}
										/>
									)}
								</div>
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
			'div:nth-child(3)': {
				order: 1
			},
			'div:nth-child(1)': {
				order: 2
			},
			'div:nth-child(2)': {
				order: 3
			},
			'div:nth-child(4)': {
				order: 4
			}
		}
	},
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
	productTitle: {
		fontSize: '18px',
		fontWeight: 'bold',
		color: fr.colors.decisions.text.title.blueFrance.default,
		backgroundImage: 'none',
		'&:hover': {
			textDecoration: 'underline'
		}
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
		gap: fr.spacing('2v')
	},
	reviewWrapper: {
		display: 'flex'
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
	}
});

export default ProductCard;
