import ProductCard, { Product } from '@/components/dashboard/ProductCard';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { SearchBar } from '@codegouvfr/react-dsfr/SearchBar';
import { Select } from '@codegouvfr/react-dsfr/Select';

const DashBoard = () => {
	const products: Product[] = [
		{
			title: '1000 premiers jours',
			owner: 'Nom de l’entité de rattachement',
			indicators: [
				{
					title: 'Satisfaction Usagers',
					value: 6,
					color: 'new',
					appreciation: 'average'
				},
				{
					title: 'Compréhension du langage',
					value: 10,
					color: 'success',
					appreciation: 'good'
				},
				{
					title: 'Aide joignable et efficace',
					value: 9,
					color: 'error',
					appreciation: 'bad'
				}
			],
			nbReviews: 12
		},
		{
			title: 'Impots.gouv.fr',
			owner: 'Nom de l’entité de rattachement',
			indicators: [
				{
					title: 'Satisfaction Usagers',
					value: 7,
					color: 'new',
					appreciation: 'average'
				},
				{
					title: 'Compréhension du langage',
					value: 9,
					color: 'success',
					appreciation: 'good'
				},
				{
					title: 'Aide joignable et efficace',
					value: 3,
					color: 'error',
					appreciation: 'bad'
				}
			],
			nbReviews: 12
		},
		{
			title: 'Mon compte formation',
			owner: 'Nom de l’entité de rattachement',
			indicators: [
				{
					title: 'Satisfaction Usagers',
					value: 5,
					color: 'new',
					appreciation: 'average'
				},
				{
					title: 'Compréhension du langage',
					value: 9.5,
					color: 'success',
					appreciation: 'good'
				},
				{
					title: 'Aide joignable et efficace',
					value: 1,
					color: 'error',
					appreciation: 'bad'
				}
			],
			nbReviews: 12
		}
	];

	return (
		<div className={fr.cx('fr-container', 'fr-py-6w')}>
			<h1>Tableau de bord</h1>
			<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
				<div className={fr.cx('fr-col-12', 'fr-col-md-5')}>
					<h2>Mes produits numériques</h2>
				</div>
				<div className={fr.cx('fr-col-6', 'fr-col-md-3')}>
					<Button
						priority="secondary"
						iconId="fr-icon-add-circle-line"
						iconPosition="right"
					>
						Ajouter un nouveau produit
					</Button>
				</div>
				<div className={fr.cx('fr-col-6', 'fr-col-md-4')}>
					<Button
						priority="secondary"
						iconId="fr-icon-edit-line"
						iconPosition="right"
					>
						Modifier mes entités de rattachement
					</Button>
				</div>
			</div>
			<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
				<div className={fr.cx('fr-col-12', 'fr-col-md-5')}>
					<Select
						label="Trier Par"
						nativeSelectProps={{
							name: 'my-select'
						}}
					>
						<option value="3">Nom</option>
						<option value="1">Date de création</option>
						<option value="2">Date de mise à jour</option>
					</Select>
				</div>
				<div className={fr.cx('fr-col-12', 'fr-col-md-7', 'fr-col--bottom')}>
					<SearchBar label="Rechercher un produit" />
				</div>
			</div>
			{products.map((product, index) => (
				<ProductCard product={product} key={index} />
			))}
		</div>
	);
};

export default DashBoard;
