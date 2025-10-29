import { useFilters } from '@/src/contexts/FiltersContext';
import { ProductWithForms } from '@/src/types/prismaTypesExtended';
import { formatNumberWithSpaces } from '@/src/utils/tools';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import { Badge } from '@codegouvfr/react-dsfr/Badge';
import Button from '@codegouvfr/react-dsfr/Button';
import { Input } from '@codegouvfr/react-dsfr/Input';
import { createModal, ModalProps } from '@codegouvfr/react-dsfr/Modal';
import { Entity } from '@prisma/client';
import { push } from '@socialgouv/matomo-next';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { tss } from 'tss-react/dsfr';
import OnConfirmModal from '../../ui/modal/OnConfirm';
import { Toast } from '../../ui/Toast';
import starFill from '.././../../../public/assets/star-fill.svg';
import starOutline from '.././../../../public/assets/star-outline.svg';
import NoFormsPanel from '../Pannels/NoFormsPanel';

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
	product: ProductWithForms;
	userId: number;
	entity: Entity;
	isFavorite: boolean;
	showFavoriteButton: boolean;
	onRestoreProduct: () => void;
	onDeleteProduct: () => void;
}) => {
	const { clearFilters } = useFilters();
	const [onConfirmModalRestore, setOnConfirmModalRestore] =
		useState<CreateModalProps | null>(null);
	const [onConfirmModalArchive, setOnConfirmModalArchive] =
		useState<CreateModalProps | null>(null);
	const [displayToast, setDisplayToast] = React.useState<boolean>(false);

	const [validateDelete, setValidateDelete] = useState(false);

	const utils = trpc.useUtils();
	const { classes, cx } = useStyles();

	const {
		control,
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

	const { data: reviewsCountData, isLoading: isLoadingReviewsCount } =
		trpc.review.getCountsByForm.useQuery({
			product_id: product.id
		});

	const totalReviews = reviewsCountData?.totalCount ?? 0;
	const getFormReviewCount = (formId: number, legacy: boolean) =>
		legacy
			? (reviewsCountData?.countsByForm[formId.toString()] ?? 0) +
				(reviewsCountData?.countsByForm['1'] ?? 0) +
				(reviewsCountData?.countsByForm['2'] ?? 0)
			: (reviewsCountData?.countsByForm[formId.toString()] ?? 0);
	const getFormNewReviewCount = (formId: number, legacy: boolean) =>
		reviewsCountData?.newCountsByForm[formId.toString()] ?? 0;

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

	const renderProductBadges = () => {
		const badges = [];

		if (product.isTop250) {
			badges.push(
				<Badge key="top250" severity="info" noIcon small>
					Démarche essentielle
				</Badge>
			);
		}

		if (isDisabled) {
			badges.push(
				<Badge key="archived" noIcon small>
					Service archivé
				</Badge>
			);
		}

		if (product.forms.length === 0) {
			badges.push(
				<Badge key="no-forms" severity="warning" small noIcon>
					Configuration à terminer
				</Badge>
			);
		}

		return badges.length > 0 ? (
			<div className={classes.badgesContainer}>{badges}</div>
		) : null;
	};

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
					if (totalReviews && totalReviews > 1000) {
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
				disableAction={
					totalReviews && totalReviews > 1000 ? !validateDelete : false
				}
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
					{totalReviews && totalReviews > 1000 ? (
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
			<div className={fr.cx('fr-card', 'fr-my-3w', 'fr-p-2w')}>
				<div
					className={cx(
						fr.cx('fr-grid-row', 'fr-grid-row--gutters'),
						classes.gridProduct
					)}
				>
					<div
						className={cx(fr.cx('fr-col-12', 'fr-pb-1v'), classes.titleSection)}
					>
						<div className={cx(fr.cx('fr-col-9'), classes.titleWithBadges)}>
							<Link
								href={`/administration/dashboard/product/${product.id}/forms`}
								tabIndex={0}
								title={`Voir les statistiques pour le service ${product.title}`}
								className={cx(classes.productLink, fr.cx('fr-link'))}
								onClick={() => clearFilters()}
								style={{
									pointerEvents: isDisabled ? 'none' : 'auto'
								}}
							>
								<span className={cx(classes.productTitle)}>
									{product.title}
								</span>
							</Link>
							{renderProductBadges()}
						</div>
						<div className={cx(fr.cx('fr-col'), classes.actionsSection)}>
							{isDisabled && (
								<div className={cx(classes.buttonsCol)}>
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
							)}
							{showFavoriteButton && !isDisabled && (
								<Button
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

					{!isDisabled &&
						!isLoadingReviewsCount &&
						totalReviews !== undefined && (
							<div
								className={cx(
									fr.cx(
										'fr-col',
										'fr-col-12',
										'fr-col-md-12',
										product.forms.length === 0 && 'fr-hidden'
									)
								)}
							>
								{[
									...product.forms.filter(f => !f.isDeleted),
									...product.forms
										.filter(f => f.isDeleted)
										.sort(
											(a, b) =>
												(b.deleted_at?.getTime() ?? 0) -
												(a.deleted_at?.getTime() ?? 0)
										)
								]
									.slice(0, 2)
									.map(form => {
										const newReviewsCount = getFormNewReviewCount(
											form.id,
											form.legacy
										);
										return (
											<div
												key={form.id}
												className={cx(
													fr.cx('fr-grid-row', 'fr-p-4v'),
													classes.formCard
												)}
												style={{
													backgroundColor: form.isDeleted
														? fr.colors.decisions.background.default.grey.hover
														: undefined
												}}
											>
												<Link
													href={`/administration/dashboard/product/${product.id}/forms/${form.id}`}
													className={classes.formLink}
													onClick={() => clearFilters()}
												/>
												<div
													className={cx(
														classes.productTitleContainer,
														fr.cx('fr-pb-0')
													)}
												>
													<span className={cx(classes.productTitle)}>
														{form.title || form.form_template.title}
													</span>
													{form.isDeleted ? (
														<Badge severity="error" noIcon>
															Fermé
														</Badge>
													) : (
														<>
															{form.buttons.length === 0 ? (
																<Badge severity="warning" small noIcon>
																	Configuration à terminer
																</Badge>
															) : (
																newReviewsCount > 0 && (
																	<Badge severity="success" noIcon small>
																		{newReviewsCount} NOUVELLES RÉPONSES
																	</Badge>
																)
															)}
														</>
													)}
												</div>
												{!form.isDeleted && (
													<div className={cx(classes.formStatsWrapper)}>
														<div className={classes.formStatsContent}>
															<span
																className={cx(
																	fr.cx('fr-mr-2v'),
																	classes.smallText
																)}
															>
																Réponses déposées
															</span>
															<span className={fr.cx('fr-text--bold')}>
																{formatNumberWithSpaces(
																	getFormReviewCount(form.id, form.legacy)
																)}
															</span>
														</div>
													</div>
												)}
											</div>
										);
									})}
								{product.forms.length > 2 && (
									<Link
										href={`/administration/dashboard/product/${product.id}/forms`}
										title={`Voir les formulaires pour ${product.title}`}
										className={cx(classes.productLink, fr.cx('fr-link'))}
										onClick={() => clearFilters()}
									>
										Voir tous les formulaires ({product.forms.length})
									</Link>
								)}
							</div>
						)}
				</div>
			</div>
		</>
	);
};

const useStyles = tss.withName(ProductCard.name).create({
	gridProduct: {
		[fr.breakpoints.down('md')]: {
			'.buttonsWrapper': {
				order: 0
			},
			'.titleSection': {
				order: 1
			},
			'.entitySection': {
				order: 2
			},
			'.actionsSection': {
				order: 3
			},
			'.statsSection': {
				order: 4
			}
		}
	},
	titleSection: {
		display: 'flex',
		justifyContent: 'space-between'
	},
	entitySection: {},
	actionsSection: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'end'
	},
	buttonWrapper: {
		maxHeight: '32px !important',
		'&::before': {
			marginRight: '0 !important'
		}
	},
	productLink: {
		backgroundImage: 'none',
		'&:hover': {
			textDecoration: 'underline'
		}
	},
	formLink: {
		backgroundImage: 'none',
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
		'&:active': {
			opacity: 0.2
		}
	},
	productTitleContainer: {
		display: 'flex',
		flexWrap: 'wrap',
		gap: fr.spacing('4v')
	},
	productTitle: {
		fontSize: '18px',
		lineHeight: '1.5rem',
		fontWeight: 'bold',
		color: fr.colors.decisions.text.title.blueFrance.default,
		'&:hover': {
			textDecoration: 'underline'
		}
	},
	titleWithBadges: {
		display: 'flex',
		gap: fr.spacing('2v'),
		alignItems: 'center'
	},
	entityName: {
		color: '#666666'
	},
	badgesContainer: {
		display: 'flex',
		alignItems: 'center',
		height: '100%',
		gap: fr.spacing('2v'),
		marginRight: '1rem',
		textWrap: 'nowrap'
	},
	formCard: {
		backgroundColor: fr.colors.decisions.background.alt.blueFrance.default,
		display: 'flex',
		justifyContent: 'space-between',
		position: 'relative',
		flexWrap: 'nowrap',
		width: '100%',
		maxWidth: '100%',
		marginLeft: 0,
		marginRight: 0,
		marginBottom: '1.5rem',
		':nth-child(2), :last-child': {
			marginBottom: '0.5rem'
		},
		'&:hover > div:first-of-type span:first-of-type': {
			textDecoration: 'underline'
		}
	},
	formStatsWrapper: {
		display: 'flex',
		justifyContent: 'flex-end',
		alignItems: 'center',
		[fr.breakpoints.down('md')]: {
			justifyContent: 'start'
		}
	},
	formStatsContent: {
		display: 'flex',
		alignItems: 'center',
		gap: fr.spacing('1v'),
		textWrap: 'nowrap',
		[fr.breakpoints.down('md')]: {
			marginTop: fr.spacing('4v'),
			justifyContent: 'start',
			flexWrap: 'wrap'
		}
	},
	smallText: {
		color: fr.colors.decisions.text.default.grey.default,
		fontSize: '0.8rem'
	},
	buttonsCol: {
		textAlign: 'right'
	},
	asterisk: {
		color: fr.colors.decisions.text.default.error.default
	}
});

export default ProductCard;
