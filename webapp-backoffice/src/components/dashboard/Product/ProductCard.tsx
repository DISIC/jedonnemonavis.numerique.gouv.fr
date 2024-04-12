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

interface Indicator {
	title: string;
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

	const { data: resultSatisfaction, isLoading: isLoadingSatisfaction } =
		trpc.answer.getByFieldCode.useQuery({
			product_id: product.id.toString(),
			field_code: 'satisfaction',
			start_date: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
				.toISOString()
				.split('T')[0],
			end_date: currentDate.toISOString().split('T')[0]
		});
	const satisfaction =
		(resultSatisfaction?.metadata.total || 0) > 0
			? resultSatisfaction?.metadata.average
			: -1;

	const { data: resultEasy, isLoading: isLoadingEasy } =
		trpc.answer.getByFieldCode.useQuery({
			product_id: product.id.toString(),
			field_code: 'easy',
			start_date: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
				.toISOString()
				.split('T')[0],
			end_date: currentDate.toISOString().split('T')[0]
		});
	const easy =
		(resultEasy?.metadata.total || 0) > 0 ? resultEasy?.metadata.average : -1;

	const { data: resultComprehension, isLoading: isLoadingComprehension } =
		trpc.answer.getByFieldCode.useQuery({
			product_id: product.id.toString(),
			field_code: 'comprehension',
			start_date: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
				.toISOString()
				.split('T')[0],
			end_date: currentDate.toISOString().split('T')[0]
		});
	const comprehension =
		(resultComprehension?.metadata.total || 0) > 0
			? resultComprehension?.metadata.average
			: -1;

	const isLoadingStats =
		isLoadingSatisfaction || isLoadingEasy || isLoadingComprehension;

	const { data: reviewsData, isLoading: isLoadingReviewsCount } =
		trpc.review.getList.useQuery({
			numberPerPage: 0,
			page: 1,
			product_id: product.id
		});

	const nbReviews = reviewsData?.metadata.count;

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

	const getColorFromIntention = (appreciation: AnswerIntention) => {
		switch (appreciation) {
			case 'bad':
				return 'error';
			case 'medium':
				return 'new';
			case 'good':
				return 'success';
		}

		return 'info';
	};

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

	const indicators: Indicator[] = [
		{
			title: 'Satisfaction',
			value: satisfaction || 0,
			color:
				satisfaction !== -1
					? getColorFromIntention(getIntentionFromAverage(satisfaction || 0))
					: 'info',
			appreciation: getIntentionFromAverage(satisfaction || 0)
		},
		{
			title: "Simplicité d'usage",
			value: easy || 0,
			color:
				easy !== -1
					? getColorFromIntention(getIntentionFromAverage(easy || 0))
					: 'info',
			appreciation: getIntentionFromAverage(easy || 0)
		},
		{
			title: 'Facilité du langage',
			value: comprehension || 0,
			color:
				comprehension !== -1
					? getColorFromIntention(getIntentionFromAverage(comprehension || 0))
					: 'info',
			appreciation: getIntentionFromAverage(comprehension || 0)
		}
	];

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
					<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-5')}>
						<Link
							href={`/administration/dashboard/product/${product.id}/stats`}
							className={fr.cx('fr-card__title')}
						>
							{product.title}
						</Link>
					</div>
					<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-6')}>
						<p className={fr.cx('fr-mb-0')}>{entity?.name}</p>
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
								title={isFavorite ? 'Supprimer le favori' : 'Ajouter aux favoris'}
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

					<div className={fr.cx('fr-col', 'fr-col-12')}>
						<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
							{indicators.map((indicator, index) => (
								<div
									className={fr.cx('fr-col', 'fr-col-6', 'fr-col-md-3')}
									key={index}
								>
									<p className={fr.cx('fr-text--xs', 'fr-mb-0')}>
										{indicator.title}
									</p>
									{isLoadingStats ? (
										<Skeleton
											className={cx(classes.badgeSkeleton)}
											variant="text"
											width={130}
											height={25}
										/>
									) : (
										<Badge
											noIcon
											severity={!!nbReviews ? indicator.color : 'info'}
											className={fr.cx('fr-text--sm')}
										>
											{!!nbReviews && indicator.value !== -1
												? `${diplayAppreciation(indicator.appreciation)} ${indicator.value}/10`
												: 'Aucune donnée'}
										</Badge>
									)}
								</div>
							))}
							{!isLoadingReviewsCount && nbReviews !== undefined && (
								<div className={fr.cx('fr-col', 'fr-col-6', 'fr-col-md-3')}>
									<p className={fr.cx('fr-text--xs', 'fr-mb-0')}>Nombre d'avis</p>
									<Badge noIcon severity="info">
										{nbReviews}
									</Badge>
								</div>
							)}
						</div>
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
	}
});

export default ProductCard;
