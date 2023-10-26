import ProductCard from '@/src/components/dashboard/Product/ProductCard';
import ProductModal from '@/src/components/dashboard/Product/ProductModal';
import { Loader } from '@/src/components/ui/Loader';
import { Pagination } from '@/src/components/ui/Pagination';
import { getNbPages } from '@/src/utils/tools';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import { Button } from '@codegouvfr/react-dsfr/Button';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import Input from '@codegouvfr/react-dsfr/Input';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import { Select } from '@codegouvfr/react-dsfr/Select';
import { Autocomplete } from '@mui/material';
import { Entity } from '@prisma/client';
import { useSession } from 'next-auth/react';
import React from 'react';
import { tss } from 'tss-react/dsfr';

const modal = createModal({
	id: 'product-modal',
	isOpenedByDefault: false
});

const DashBoard = () => {
	const [filter, setFilter] = React.useState<string>('title');
	const [filterEntityId, setFilterEntityId] = React.useState<number>();
	const [filterOnlyFavorites, setFilterOnlyFavorites] =
		React.useState<boolean>(false);
	const [search, setSearch] = React.useState<string>('');
	const [validatedSearch, setValidatedSearch] = React.useState<string>('');

	const [currentPage, setCurrentPage] = React.useState(1);
	const [numberPerPage, _] = React.useState(10);

	const { data: session } = useSession({ required: true });

	const { cx, classes } = useStyles();

	const {
		data: productsResult,
		isLoading: isLoadingProducts,
		isRefetching: isRefetchingProducts
	} = trpc.product.getList.useQuery(
		{
			search: validatedSearch,
			sort: filter,
			page: currentPage,
			numberPerPage,
			filterEntityId,
			filterByUserFavorites: filterOnlyFavorites
		},
		{
			initialData: {
				data: [],
				metadata: {
					count: 0
				}
			}
		}
	);

	const {
		data: products,
		metadata: { count: productsCount }
	} = productsResult;

	const { data: entitiesResult, isLoading: isLoadingEntities } =
		trpc.entity.getList.useQuery(
			{ numberPerPage: 1000 },
			{ initialData: { data: [], metadata: { count: 0 } } }
		);

	const { data: entities } = entitiesResult;

	const { data: favoritesResult, isLoading: isLoadingFavorites } =
		trpc.favorite.getByUser.useQuery(
			{ user_id: session?.user?.id || 0 },
			{
				initialData: { data: [] },
				enabled: session?.user?.id !== undefined
			}
		);

	const { data: favorites } = favoritesResult;

	const handlePageChange = (pageNumber: number) => {
		setCurrentPage(pageNumber);
	};

	const getEntitiesFilterOptions = (): Entity[] => {
		if (session?.user?.role === 'admin') {
			return entities;
		} else {
			return session?.user?.entities || [];
		}
	};

	const nbPages = getNbPages(productsCount, numberPerPage);
	const showEntitiesFilter =
		session?.user.role === 'admin' ||
		(session?.user.role === 'supervisor' && session.user.entities.length > 1);

	return (
		<>
			<ProductModal
				modal={modal}
				onSubmit={() => {
					setSearch('');
					if (filter === 'created_at') {
						setValidatedSearch('');
					} else {
						setFilter('created_at');
					}
				}}
			/>
			<div className={fr.cx('fr-container', 'fr-py-6w')}>
				<div
					className={fr.cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-mb-3w')}
				>
					<div className={fr.cx('fr-col-12', 'fr-col-md-5')}>
						<h1 className={fr.cx('fr-mb-0')}>
							{session?.user?.role !== 'admin' ? 'Mes démarches' : 'Démarches'}
						</h1>
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
					{showEntitiesFilter && (
						<div className={fr.cx('fr-col-12', 'fr-col-md-4')}>
							<Autocomplete
								id="filter-entity"
								disablePortal
								sx={{ width: '100%' }}
								options={getEntitiesFilterOptions().map((entity: Entity) => ({
									label: entity.name,
									value: entity.id
								}))}
								onChange={(_, option) => {
									setFilterEntityId(option?.value);
								}}
								noOptionsText="Aucune organisation trouvée"
								renderInput={params => (
									<div ref={params.InputProps.ref}>
										<label className="fr-label">
											Filtrer par une organisation
										</label>
										<input
											{...params.inputProps}
											className={cx(params.inputProps.className, 'fr-input')}
											placeholder="Sélectionner une option"
											type="search"
										/>
									</div>
								)}
							/>
						</div>
					)}
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
					{session?.user.role !== 'user' && (
						<div
							className={fr.cx(
								'fr-col-12',
								'fr-mt-4w',
								nbPages > 1 ? 'fr-mb-2w' : 'fr-mb-0',
								'fr-py-0'
							)}
						>
							<Checkbox
								className={fr.cx('fr-mb-0')}
								style={{ userSelect: 'none' }}
								options={[
									{
										label: 'Afficher uniquement mes favoris',
										nativeInputProps: {
											name: 'favorites-products',
											checked: filterOnlyFavorites,
											onChange: e => {
												setFilterOnlyFavorites(e.currentTarget.checked);
												setCurrentPage(1);
											}
										}
									}
								]}
							/>
						</div>
					)}
				</div>
				{isLoadingProducts || isLoadingEntities || isLoadingFavorites ? (
					<div className={fr.cx('fr-py-20v', 'fr-mt-4w')}>
						<Loader />
					</div>
				) : (
					<div>
						<div className={fr.cx('fr-col-8', 'fr-pt-3w')}>
							{nbPages > 1 && (
								<span className={fr.cx('fr-ml-0')}>
									Démarches de{' '}
									<span className={cx(classes.boldText)}>
										{numberPerPage * (currentPage - 1) + 1}
									</span>{' '}
									à{' '}
									<span className={cx(classes.boldText)}>
										{numberPerPage * (currentPage - 1) + products.length}
									</span>{' '}
									de{' '}
									<span className={cx(classes.boldText)}>
										{productsResult.metadata.count}
									</span>
								</span>
							)}
						</div>
						<div
							className={cx(
								products.length === 0 ? classes.productsContainer : ''
							)}
						>
							{isRefetchingProducts ? (
								<div className={fr.cx('fr-py-20v', 'fr-mt-4w')}>
									<Loader />
								</div>
							) : (
								products.map((product, index) => (
									<ProductCard
										product={product}
										userId={session?.user?.id || 0}
										entity={
											entities.find(
												entity => product.entity_id === entity.id
											) as Entity
										}
										isFavorite={
											!!favorites.find(
												favorite => favorite.product_id === product.id
											)
										}
										key={index}
									/>
								))
							)}

							{products.length === 0 && !isRefetchingProducts && (
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
						<div
							className={fr.cx(
								'fr-grid-row--center',
								'fr-grid-row',
								'fr-mb-15w'
							)}
						>
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
