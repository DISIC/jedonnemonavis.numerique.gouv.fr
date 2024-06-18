import { ProductWithButtons } from '@/src/types/prismaTypesExtended';
import { getIntentionFromAverage } from '@/src/utils/stats';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import { Badge } from '@codegouvfr/react-dsfr/Badge';
import Button from '@codegouvfr/react-dsfr/Button';
import { Skeleton } from '@mui/material';
import { AnswerIntention, Entity } from '@prisma/client';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import { tss } from 'tss-react/dsfr';
import router from 'next/router';
import NoButtonsPanel from '../Pannels/NoButtonsPanel';
import NoReviewsPanel from '../Pannels/NoReviewsPanel';
import {
	formatNumberWithSpaces,
	getColorFromIntention,
	getReadableValue
} from '@/src/utils/tools';

interface Indicator {
	title: string;
	total: number;
	value: number;
	color: 'new' | 'success' | 'error' | 'info';
	appreciation: AnswerIntention;
}

const ProductCard = ({
	product,
	userId,
	entity,
	isFavorite
}: {
	product: ProductWithButtons;
	userId: number;
	entity: Entity;
	isFavorite: boolean;
}) => {
	const utils = trpc.useUtils();
	const { data: session } = useSession();
	const { classes, cx } = useStyles();

	const currentDate = new Date();

	const {
		data: resultStatsObservatoire,
		isLoading: isLoadingStatsObservatoire,
		isRefetching: isRefetchingStatsObservatoire
	} = trpc.answer.getObservatoireStats.useQuery(
		{
			product_id: product.id.toString(),
			start_date: '2023-01-01',
			end_date: '2024-06-18'
		},
		{
			initialData: {
				data: {
					satisfaction: 0,
					comprehension: 0,
					contact: 0,
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

	const diplayAppreciation = (appreciation: AnswerIntention) => {
		switch (appreciation) {
			case 'bad':
				return 'Mauvais';
			case 'medium':
				return 'Moyen';
			case 'good':
				return 'Très bien';
		}
	};

	const { satisfaction, comprehension, contact, autonomy } =
		resultStatsObservatoire.data;

	const indicators: Indicator[] = [
		{
			title: 'Satisfaction',
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
			total: resultStatsObservatoire.metadata.contact_count,
			value: Math.round(contact * 10) / 10 || 0,
			color:
				contact !== -1
					? getColorFromIntention(getIntentionFromAverage(contact || 0))
					: 'info',
			appreciation: getIntentionFromAverage(contact || 0)
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

	return (
		<Link href={`/administration/dashboard/product/${product.id}/stats`}>
			<div className={fr.cx('fr-card', 'fr-my-3w', 'fr-p-2w')}>
				<div
					className={fr.cx(
						'fr-grid-row',
						'fr-grid-row--gutters',
						'fr-grid-row--top'
					)}
				>
					<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-6')}>
						<Link
							href={`/administration/dashboard/product/${product.id}/stats`}
							className={cx(classes.productTitle)}
						>
							{product.title}
						</Link>
					</div>
					<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-5')}>
						<p className={cx(fr.cx('fr-mb-0'), classes.entityName)}>
							{entity?.name}
						</p>
					</div>
					{session?.user.role !== 'user' && (
						<div
							className={cx(
								fr.cx('fr-col', 'fr-col-6', 'fr-col-md-1'),
								classes.favoriteWrapper
							)}
						>
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
								onClick={() => {
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
						) : (product.buttons.length > 0 && nbReviews && nbReviews > 0) ||
						  session?.user.role === 'admin' ? (
							<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
								{indicators.map((indicator, index) => (
									<div
										className={fr.cx('fr-col', 'fr-col-6', 'fr-col-md-3')}
										key={index}
									>
										<p className={fr.cx('fr-text--xs', 'fr-mb-0')}>
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
											<Badge
												noIcon
												severity={
													!!indicator.total ? indicator.color : undefined
												}
												className={fr.cx('fr-text--sm')}
											>
												{!!indicator.total
													? `${diplayAppreciation(indicator.appreciation)} ${getReadableValue(indicator.value)}/10`
													: 'Aucune donnée'}
											</Badge>
										)}
									</div>
								))}
								{!isLoadingReviewsCount && nbReviews !== undefined && (
									<div className={fr.cx('fr-col', 'fr-col-6', 'fr-col-md-3')}>
										<p className={fr.cx('fr-text--xs', 'fr-mb-0')}>
											Nombre d'avis
										</p>
										<Badge noIcon severity="info">
											{formatNumberWithSpaces(nbReviews)}
										</Badge>
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
				</div>
			</div>
		</Link>
	);
};

const useStyles = tss.withName(ProductCard.name).create({
	favoriteWrapper: {
		display: 'flex',
		justifyContent: 'end'
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
	}
});

export default ProductCard;
