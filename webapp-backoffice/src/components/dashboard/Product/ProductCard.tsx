import { ProductWithButtons } from '@/src/types/prismaTypesExtended';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import { Badge } from '@codegouvfr/react-dsfr/Badge';
import Button from '@codegouvfr/react-dsfr/Button';
import { Entity } from '@prisma/client';
import Link from 'next/link';
import { tss } from 'tss-react/dsfr';

interface Indicator {
	title: string;
	value: number;
	color: 'new' | 'success' | 'error';
	appreciation: 'bad' | 'average' | 'good';
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
	const utils = trpc.useContext();
	const { classes, cx } = useStyles();

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

	const diplayAppreciation = (appreciation: string) => {
		switch (appreciation) {
			case 'bad':
				return 'Mauvais';
			case 'average':
				return 'Moyen';
			case 'good':
				return 'Très bien';
		}
	};

	const indicators: Indicator[] = [
		{
			title: 'Accessibilité',
			value: 2,
			color: 'error',
			appreciation: 'bad'
		},
		{
			title: 'Sécurité',
			value: 8,
			color: 'success',
			appreciation: 'good'
		},
		{
			title: 'Performance',
			value: 8,
			color: 'new',
			appreciation: 'average'
		}
	];

	return (
		<div className={fr.cx('fr-card', 'fr-my-3w', 'fr-p-2w')}>
			<div
				className={fr.cx(
					'fr-grid-row',
					'fr-grid-row--gutters',
					'fr-grid-row--middle'
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
								<Badge
									noIcon
									severity={indicator.color}
									className={fr.cx('fr-text--sm')}
								>
									{diplayAppreciation(indicator.appreciation)} {indicator.value}{' '}
									/ 10
								</Badge>
							</div>
						))}
						{/* {product.nbReviews && (
			<div className={fr.cx('fr-col', 'fr-col-6', 'fr-col-md-3')}>
				<p className={fr.cx('fr-text--xs', 'fr-mb-0')}>
					Nouveaux avis (depuis 08/08/23)
				</p>
				<Badge noIcon severity="info">
					{product.nbReviews}
				</Badge>
			</div>
		)} */}
					</div>
				</div>
			</div>
		</div>
	);
};

const useStyles = tss.withName(ProductCard.name).create({
	favoriteWrapper: {
		display: 'flex',
		justifyContent: 'end'
	}
});

export default ProductCard;
