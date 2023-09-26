import ProductCard from '@/components/dashboard/ProductCard';
import ProductModal from '@/components/dashboard/ProductModal';
import { fr } from '@codegouvfr/react-dsfr';
import { Button } from '@codegouvfr/react-dsfr/Button';
import Input from '@codegouvfr/react-dsfr/Input';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import { SearchBar } from '@codegouvfr/react-dsfr/SearchBar';
import { Select } from '@codegouvfr/react-dsfr/Select';
import { Entity, Product } from '@prisma/client';
import assert from 'assert';
import React from 'react';
import { tss } from 'tss-react/dsfr';
import { useDebounce } from 'usehooks-ts';

const modal = createModal({
	id: 'product-modal',
	isOpenedByDefault: false
});

const DashBoard = () => {
	const [products, setProducts] = React.useState<Product[]>([]);
	const [entities, setEntities] = React.useState<Entity[]>([]);
	const [filter, setFilter] = React.useState<string>('title');
	const [search, setSearch] = React.useState<string>('');
	const [inputElement, setInputElement] =
		React.useState<HTMLInputElement | null>(null);

	const { cx, classes } = useStyles();

	const retrieveProducts = React.useCallback(
		async (search: string) => {
			const res = await fetch(
				'/api/prisma/products?sort=' + filter + ':desc' + '&search=' + search
			);
			const data = await res.json();
			setProducts(data);
		},
		[filter]
	);

	const retrieveOwners = async () => {
		const res = await fetch('/api/prisma/entities');
		const data = await res.json();
		setEntities(data);
	};

	React.useEffect(() => {
		retrieveProducts('');
		retrieveOwners();
	}, [retrieveProducts]);

	const isOpen = useIsModalOpen(modal);

	return (
		<>
			<ProductModal
				modal={modal}
				isOpen={isOpen}
				onProductCreated={() => {
					if (filter === 'created_at') {
						retrieveProducts('');
					} else {
						setFilter('created_at');
					}
				}}
			/>
			<div className={fr.cx('fr-container', 'fr-py-6w')}>
				<h1>Tableau de bord</h1>
				<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
					<div className={fr.cx('fr-col-12', 'fr-col-md-5')}>
						<h2>Mes produits numériques</h2>
					</div>
					<div
						className={cx(
							fr.cx('fr-col-12', 'fr-col-md-7'),
							classes.buttonContainer
						)}
					>
						<Button
							priority="secondary"
							iconId="fr-icon-add-circle-line"
							iconPosition="right"
							type="button"
							nativeButtonProps={modal.buttonProps}
						>
							Ajouter un nouveau produit
						</Button>
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
					<div className={fr.cx('fr-col-12', 'fr-col-md-3')}>
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
					<div className={fr.cx('fr-col-12', 'fr-col-md-5', 'fr-col--bottom')}>
						<form
							className={cx(classes.searchForm)}
							onSubmit={e => {
								e.preventDefault();
								retrieveProducts(search);
							}}
						>
							<div role="search" className={fr.cx('fr-search-bar')}>
								<Input
									label="Rechercher un produit"
									hideLabel
									nativeInputProps={{
										placeholder: 'Rechercher un produit',
										type: 'search',
										value: search,
										onChange: event => {
											if (!event.target.value) {
												retrieveProducts('');
											}
											setSearch(event.target.value);
										}
									}}
								/>
								<Button
									priority="primary"
									type="submit"
									iconId="ri-search-2-line"
									iconPosition="left"
								>
									Rechercher
								</Button>
							</div>
						</form>
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
				{products.length === 0 && (
					<div className={fr.cx('fr-grid-row', 'fr-grid-row--center')}>
						<div
							className={cx(
								fr.cx('fr-col-12', 'fr-col-md-5', 'fr-py-10v'),
								classes.textContainer
							)}
						>
							<p>Aucun produit trouvé</p>
						</div>
					</div>
				)}
			</div>
		</>
	);
};

const useStyles = tss.withName(ProductModal.name).create(() => ({
	buttonContainer: {
		[fr.breakpoints.up('md')]: {
			display: 'flex',
			alignSelf: 'flex-end',
			justifyContent: 'flex-end',
			'.fr-btn': {
				justifySelf: 'flex-end',
				'&:first-child': {
					marginRight: '1rem'
				}
			}
		},
		[fr.breakpoints.down('md')]: {
			'.fr-btn:first-child': {
				marginBottom: '1rem'
			}
		}
	},
	textContainer: {
		textAlign: 'center'
	},
	searchForm: {
		'.fr-search-bar': {
			'.fr-input-group': {
				width: '100%',
				marginBottom: 0
			}
		}
	}
}));

export default DashBoard;
