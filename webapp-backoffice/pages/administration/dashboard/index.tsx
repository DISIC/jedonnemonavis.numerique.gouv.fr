import ProductCard from '@/components/dashboard/Product/ProductCard';
import ProductModal from '@/components/dashboard/Product/ProductModal';
import { Pagination } from '@/components/ui/Pagination';
import { getNbPages } from '@/utils/tools';
import { fr } from '@codegouvfr/react-dsfr';
import { Button } from '@codegouvfr/react-dsfr/Button';
import Input from '@codegouvfr/react-dsfr/Input';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import { Select } from '@codegouvfr/react-dsfr/Select';
import { Entity, Product } from '@prisma/client';
import React from 'react';
import { tss } from 'tss-react/dsfr';

const modal = createModal({
	id: 'product-modal',
	isOpenedByDefault: false
});

const DashBoard = () => {
	const [products, setProducts] = React.useState<Product[]>([]);
	const [count, setCount] = React.useState<number>(0);
	const [entities, setEntities] = React.useState<Entity[]>([]);
	const [filter, setFilter] = React.useState<string>('title');
	const [search, setSearch] = React.useState<string>('');
	const [validatedSearch, setValidatedSearch] = React.useState<string>('');

	const [currentPage, setCurrentPage] = React.useState(1);
	const [numberPerPage, _] = React.useState(2);

	const { cx, classes } = useStyles();

	const retrieveProducts = React.useCallback(async () => {
		const response = await fetch(
			`/api/prisma/products?${new URLSearchParams({ sort: filter, search: validatedSearch, page: currentPage.toString(), numberPerPage: numberPerPage.toString() })}`
		);
		const res = await response.json();
		setProducts(res.data);
		setCount(res.count);
	}, [numberPerPage, currentPage, filter, validatedSearch]);

	const retrieveOwners = async () => {
		const res = await fetch('/api/prisma/entities');
		const data = await res.json();
		setEntities(data);
	};

	React.useEffect(() => {
		retrieveOwners();
	}, []);

	React.useEffect(() => {
		retrieveProducts();
	}, [retrieveProducts, validatedSearch, filter]);

	const handlePageChange = (pageNumber: number) => {
		setCurrentPage(pageNumber);
	};

	const nbPages = getNbPages(count, numberPerPage);

	const isOpen = useIsModalOpen(modal);

	return (
		<>
			<ProductModal
				modal={modal}
				isOpen={isOpen}
				onProductCreated={() => {
					setSearch('');
					if (filter === 'created_at') {
						setValidatedSearch('');
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
							<option value="title:asc">Nom A à Z</option>
							<option value="entity.name:asc">Ministère A à Z</option>
							<option value="created_at:desc">Date de création</option>
							<option value="updated_at:desc">Date de mise à jour</option>
						</Select>
					</div>
					<div className={fr.cx('fr-col-12', 'fr-col-md-5', 'fr-col--bottom')}>
						<form
							className={cx(classes.searchForm)}
							onSubmit={e => {
								e.preventDefault();
								setValidatedSearch(search);
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
												setValidatedSearch('');
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
				<div className={fr.cx('fr-col-8', 'fr-pt-3w')}>
					{nbPages > 1 && (
						<span className={fr.cx('fr-ml-0')}>
							Démarche de{' '}
							<span className={cx(classes.boldText)}>
								{numberPerPage * (currentPage - 1) + 1}
							</span>{' '}
							à{' '}
							<span className={cx(classes.boldText)}>
								{numberPerPage * (currentPage - 1) + products.length}
							</span>{' '}
							de <span className={cx(classes.boldText)}>{count}</span>
						</span>
					)}
				</div>
				<div className={cx(products.length === 0 ? classes.productsContainer : '')}>
					{products.map((product, index) => (
						<ProductCard
							product={product}
							entity={
								entities.find(
									entity => product.entity_id === entity.id
								) as Entity
							}
							key={index}
						/>
					))}
					{products.length === 0 && (
						<div className={fr.cx('fr-grid-row', 'fr-grid-row--center')}>
							<div
								className={cx(
									fr.cx('fr-col-12', 'fr-col-md-5', 'fr-mt-30v'),
									classes.textContainer
								)}
								role="status"
							>
								<p>Aucun produit trouvé</p>
							</div>
						</div>
					)}
				</div>
				<div className={fr.cx('fr-grid-row--center', 'fr-grid-row', 'fr-mb-15w')}>
					{nbPages > 1 && (
						<Pagination
							showFirstLast
							count={nbPages}
							defaultPage={currentPage}
							getPageLinkProps={pageNumber => ({
								onClick: event => {
									event.preventDefault();
									handlePageChange(pageNumber);
								},
								href: '#',
								classes: { link: fr.cx('fr-pagination__link') },
								key: `pagination-link-product-${pageNumber}`
							})}
							className={fr.cx('fr-mt-1w')}
						/>
					)}
				</div>
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
				'&:first-of-type': {
					marginRight: '1rem'
				}
			}
		},
		[fr.breakpoints.down('md')]: {
			'.fr-btn:first-of-type': {
				marginBottom: '1rem'
			}
		}
	},
	productsContainer: {
		minHeight: '20rem'
	},
	textContainer: {
		textAlign: 'center',
		p: {
			margin: 0,
			fontWeight: 'bold'
		}
	},
	searchForm: {
		'.fr-search-bar': {
			'.fr-input-group': {
				width: '100%',
				marginBottom: 0
			}
		}
	},
	boldText: {
		fontWeight: 'bold'
	}
}));

export default DashBoard;
