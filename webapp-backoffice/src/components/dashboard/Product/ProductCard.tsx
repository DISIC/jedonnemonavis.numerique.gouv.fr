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
import { Skeleton } from '@mui/material';
import { AnswerIntention, Entity } from '@prisma/client';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import router from 'next/router';
import { tss } from 'tss-react/dsfr';
import NoButtonsPanel from '../Pannels/NoButtonsPanel';
import NoReviewsPanel from '../Pannels/NoReviewsPanel';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import OnConfirmModal from '../../ui/modal/OnConfirm';

interface Indicator {
	title: string;
	slug: string;
	total: number;
	value: number;
	color: 'new' | 'success' | 'error' | 'info';
	appreciation: AnswerIntention;
}

const onConfirmModal = createModal({
	id: 'restore-on-confirm-modal',
	isOpenedByDefault: false
});

const ProductCard = ({
	product,
	userId,
	entity,
	isFavorite,
	showFavoriteButton,
	onRestoreProduct
}: {
	product: ProductWithButtons;
	userId: number;
	entity: Entity;
	isFavorite: boolean;
	showFavoriteButton: boolean;
	onRestoreProduct: () => void;
}) => {
	const utils = trpc.useUtils();
	const { data: session } = useSession();
	const { classes, cx } = useStyles();

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
					autonomy_count: 0
				}
			}
		}
	);

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

	const isDisabled = product.status === 'archived';
	const productLink = isDisabled
		? ''
		: `/administration/dashboard/product/${product.id}/stats`;

	return (
		<Link
			href={productLink}
			className={cx(isDisabled ? classes.disabled : undefined)}
		>
			<OnConfirmModal
				modal={onConfirmModal}
				title="Restaurer un service"
				handleOnConfirm={() => {
					restoreProduct.mutate({
						id: product.id
					});
					onConfirmModal.close();
				}}
			>
				<div>
					<p>
						Vous êtes sûr de vouloir restaurer le service{' '}
						<b>"{product.title}"</b> ?{' '}
					</p>
				</div>
			</OnConfirmModal>
			<div className={fr.cx('fr-card', 'fr-my-3w', 'fr-p-2w')}>
				<div
					className={fr.cx(
						'fr-grid-row',
						'fr-grid-row--gutters',
						'fr-grid-row--middle'
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
					<div className={fr.cx('fr-col', 'fr-col-11', 'fr-col-md-5')}>
						<Link href={productLink} className={cx(classes.productTitle)}>
							{product.title}
						</Link>
					</div>
					<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-5')}>
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
									onConfirmModal.open();
								}}
							>
								Restaurer
							</Button>
						</div>
					) : (
						<>
							{showFavoriteButton && !isDisabled && (
								<div className={cx(classes.rightButtonsWrapper)}>
									<Button
										iconId={isFavorite ? 'ri-star-fill' : 'ri-star-line'}
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
										priority="tertiary"
										size="small"
										onClick={e => {
											e.preventDefault();
											if (isFavorite) {
												deleteFavorite.mutate({
													product_id: product.id,
													user_id: userId
												});
											} else {
												createFavorite.mutate({
													product_id: product.id,
													user_id: userId
												});
											}
										}}
									/>
								</div>
							)}
							<div className={fr.cx('fr-col', 'fr-col-12', 'fr-pt-0')}>
								{isLoadingStatsObservatoire || isRefetchingStatsObservatoire ? (
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
									<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
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
													<div
														className={fr.cx(
															!!indicator.total && indicator.color !== 'new'
																? `fr-label--${indicator.color}`
																: 'fr-label--disabled',
															'fr-text--bold'
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
													</div>
												)}
											</div>
										))}
										{!isLoadingReviewsCount && nbReviews !== undefined && (
											<div
												className={fr.cx('fr-col', 'fr-col-6', 'fr-col-md-3')}
											>
												<p className={fr.cx('fr-text--xs', 'fr-mb-0')}>
													Nombre d'avis
												</p>
												<div
													className={fr.cx('fr-label--info', 'fr-text--bold')}
												>
													{formatNumberWithSpaces(nbReviews)}
												</div>
											</div>
										)}
									</div>
								) : product.buttons.length === 0 ? (
									<NoButtonsPanel isSmall onButtonClick={handleButtonClick} />
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
	);
};

const useStyles = tss.withName(ProductCard.name).create({
	rightButtonsWrapper: {
		display: 'flex',
		justifyContent: 'end',
		position: 'absolute',
		right: fr.spacing('3v'),
		top: fr.spacing('3v')
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
	buttonsCol: {
		textAlign: 'right'
	}
});

export default ProductCard;
