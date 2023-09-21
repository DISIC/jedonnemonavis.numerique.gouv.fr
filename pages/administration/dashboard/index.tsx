import ProductCard from '@/components/dashboard/ProductCard';
import ProductModal from '@/components/dashboard/ProductModal';
import { fr } from '@codegouvfr/react-dsfr';
import { Button } from '@codegouvfr/react-dsfr/Button';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import { SearchBar } from '@codegouvfr/react-dsfr/SearchBar';
import { Select } from '@codegouvfr/react-dsfr/Select';
import { Entity, Product } from '@prisma/client';
import React from 'react';

const DashBoard = () => {
	const [products, setProducts] = React.useState<Product[]>([]);
	const [entities, setEntities] = React.useState<Entity[]>([]);
	const [filter, setFilter] = React.useState<string>('name');

	console.log('filter', filter);

	const retrieveProducts = React.useCallback(async () => {
		const res = await fetch('/api/prisma/products?sort=' + filter + ':asc');
		const data = await res.json();
		setProducts(data);
	}, [filter]);

	const retrieveOwners = async () => {
		const res = await fetch('/api/prisma/entities');
		const data = await res.json();
		setEntities(data);
	};

	React.useEffect(() => {
		retrieveProducts();
		retrieveOwners();
	}, [retrieveProducts]);

	const modal = createModal({
		id: 'product-modal',
		isOpenedByDefault: false
	});

	const isOpen = useIsModalOpen(modal);

	return (
		<>
			{/* <ProductModal {...modal} isOpen={isOpen} /> */}
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
							onClick={() => modal.open()}
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
								name: 'my-select',
								onChange: event => setFilter(event.target.value)
							}}
						>
							<option value="title">Nom</option>
							<option value="created_at">Date de création</option>
							<option value="updated_at">Date de mise à jour</option>
						</Select>
					</div>
					<div className={fr.cx('fr-col-12', 'fr-col-md-7', 'fr-col--bottom')}>
						<SearchBar label="Rechercher un produit" />
					</div>
				</div>
				{products.map((product, index) => (
					<ProductCard
						product={product}
						entity={
							entities.find(entity => product.entity_id === entity.id) as Entity
						}
						key={index}
					/>
				))}
			</div>
		</>
	);
};

export default DashBoard;
