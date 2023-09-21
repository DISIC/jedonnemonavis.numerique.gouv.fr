import { fr } from '@codegouvfr/react-dsfr';
import { Badge } from '@codegouvfr/react-dsfr/Badge';
import { Entity, Product } from '@prisma/client';

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
				return 'Pas bien';
			case 'average':
				return 'Moyen';
			case 'good':
				return 'Très bien';
		}
	};

	return (
		<div className={fr.cx('fr-card', 'fr-my-3w', 'fr-p-2w')}>
			<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
				<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-6')}>
					<p className={fr.cx('fr-card__title')}>{product.title}</p>
				</div>
				<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-6')}>
					<p>{entity?.name}</p>
				</div>
			</div>
			<div>
				{/* <div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
					{product.indicators.map((indicator, index) => (
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
					{product.nbReviews && (
						<div className={fr.cx('fr-col', 'fr-col-6', 'fr-col-md-3')}>
							<p className={fr.cx('fr-text--xs', 'fr-mb-0')}>
								Nouveaux avis (depuis 08/08/23)
							</p>
							<Badge noIcon severity="info">
								{product.nbReviews}
							</Badge>
						</div>
					)}
				</div> */}
			</div>
		</div>
	);
};

export default ProductCard;
