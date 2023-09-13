import { fr } from '@codegouvfr/react-dsfr';
import { Badge } from '@codegouvfr/react-dsfr/Badge';

export interface Product {
	title: string;
	owner: string;
	indicators: Indicator[];
	nbReviews?: number;
}

interface Indicator {
	title: string;
	value: number;
	color: 'new' | 'success' | 'error';
	appreciation: 'Pas bien' | 'Moyen' | 'Très bien';
}

const ProductCard = ({ product }: { product: Product }) => {
	return (
		<div className={fr.cx('fr-card', 'fr-my-3w', 'fr-p-2w')}>
			<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
				<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-6')}>
					<p className={fr.cx('fr-card__title')}>{product.title}</p>
				</div>
				<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-6')}>
					<p>{product.owner}</p>
				</div>
			</div>
			<div className={fr.cx('fr-card__body')}>
				<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
					{product.indicators.map((indicator, index) => (
						<div
							className={fr.cx('fr-col', 'fr-col-6', 'fr-col-md-3')}
							key={index}
						>
							<p className={fr.cx('fr-text--xs', 'fr-mb-0')}>
								{indicator.title}
							</p>
							<Badge noIcon severity={indicator.color}>
								{indicator.appreciation} {indicator.value} / 10
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
				</div>
			</div>
		</div>
	);
};

export default ProductCard;
