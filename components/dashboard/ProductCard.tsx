import { fr } from '@codegouvfr/react-dsfr';
import { Badge } from '@codegouvfr/react-dsfr/Badge';

export interface Product {
	title: string;
	owner: string;
	indicators: Indicator[];
}

interface Indicator {
	title: string;
	value: number;
	color: 'new' | 'success' | 'error';
	appreciation: 'bad' | 'average' | 'excellent';
}

const ProductCard = ({ product }: { product: Product }) => {
	return (
		<div className={fr.cx('fr-card', 'fr-mb-3w')}>
			<div className={fr.cx('fr-card__header')}>
				<p className={fr.cx('fr-card__title')}>{product.title}</p>
				<p className={fr.cx('fr-card__subtitle')}>{product.owner}</p>
			</div>
			<div className={fr.cx('fr-card__body')}>
				<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
					{product.indicators.map((indicator, index) => (
						<div className={fr.cx('fr-col', 'fr-col-4')} key={index}>
							<p>{indicator.title}</p>
							<Badge noIcon severity={indicator.color}>
								{indicator.appreciation} {indicator.value} / 10
							</Badge>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default ProductCard;
