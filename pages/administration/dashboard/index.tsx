import ProductCard from '@/components/dashboard/ProductCard';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { SearchBar } from '@codegouvfr/react-dsfr/SearchBar';
import { Select } from '@codegouvfr/react-dsfr/Select';
import { Owner, Product } from '@prisma/client';
import React from 'react';

const DashBoard = () => {
	const [products, setProducts] = React.useState<Product[]>([]);
	const [owners, setOwners] = React.useState<Owner[]>([]);

	const retrieveProducts = async () => {
		const res = await fetch('/api/prisma/products');
		const data = await res.json();
		setProducts(data);
	};

	const retrieveOwners = async () => {
		const res = await fetch('/api/prisma/owners');
		const data = await res.json();
		setOwners(data);
	};

	React.useEffect(() => {
		retrieveProducts();
		retrieveOwners();
	}, []);

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
				<ProductCard
					product={product}
					owner={owners.find(owner => product.owner_id === owner.id) as Owner}
					key={index}
				/>
			))}
		</div>
	);
};

export default DashBoard;
