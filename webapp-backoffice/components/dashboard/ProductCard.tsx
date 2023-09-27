import { fr } from '@codegouvfr/react-dsfr';
import { Badge } from '@codegouvfr/react-dsfr/Badge';
import { Entity, Product } from '@prisma/client';
import Link from 'next/link';

interface Indicator {
	title: string;
	value: number;
	color: 'new' | 'success' | 'error';
	appreciation: 'bad' | 'average' | 'good';
}

const ProductCard = ({
	product,
	entity
}: {
	product: Product;
	entity: Entity;
}) => {
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
			<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
				<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-6')}>
					<Link
						href={`/administration/dashboard/product/${product.id}`}
						className={fr.cx('fr-card__title')}
					>
						{product.title}
					</Link>
				</div>
				<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-6')}>
					<p>{entity?.name}</p>
				</div>
			</div>
			<div>
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
								{diplayAppreciation(indicator.appreciation)} {indicator.value} /
								10
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
	);
};

export default ProductCard;
