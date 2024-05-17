import ApiKeyModal from '@/src/components/dashboard/ApiKey/ApiKeyModal';
import ProductCard from '@/src/components/dashboard/Product/ProductCard';
import ProductModal from '@/src/components/dashboard/Product/ProductModal';
import { Loader } from '@/src/components/ui/Loader';
import { Pagination } from '@/src/components/ui/Pagination';
import { useFilters } from '@/src/contexts/FiltersContext';
import { getNbPages } from '@/src/utils/tools';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import { Button } from '@codegouvfr/react-dsfr/Button';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import Input from '@codegouvfr/react-dsfr/Input';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import { Select } from '@codegouvfr/react-dsfr/Select';
import Tag from '@codegouvfr/react-dsfr/Tag';
import { Autocomplete } from '@mui/material';
import { Entity } from '@prisma/client';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import React from 'react';
import { tss } from 'tss-react/dsfr';

const product_modal = createModal({
	id: 'product-modal',
	isOpenedByDefault: false
});

const api_modal = createModal({
	id: 'api-modal',
	isOpenedByDefault: false
});

const DashBoard = () => {
	const { filters, updateFilters } = useFilters();

	const [search, setSearch] = React.useState<string>(filters.validatedSearch);
	const [inputValue, setInputValue] = React.useState<string>('');

	const [numberPerPage, _] = React.useState(10);

	const { data: session } = useSession({ required: true });

	const { cx, classes } = useStyles();

	const {
		data: productsResult,
		isLoading: isLoadingProducts,
		isRefetching: isRefetchingProducts
	} = trpc.product.getList.useQuery(
		{
			search: filters.validatedSearch,
			sort: filters.filter,
			page: filters.currentPage,
			numberPerPage,
			filterEntityId: filters.filterEntity?.map(e => e.value),
			filterByUserFavorites: filters.filterOnlyFavorites
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
			{ initialData: { data: [], metadata: { count: 0, myEntities: [] } } }
		);

	const { data: entities } = entitiesResult;

	const { data: favoritesResult, isLoading: isLoadingFavorites } =
		trpc.favorite.getByUser.useQuery(
			{ user_id: parseInt(session?.user?.id as string) },
			{
				initialData: { data: [] },
				enabled: session?.user?.id !== undefined
			}
		);

	const { data: favorites } = favoritesResult;

	const handlePageChange = (pageNumber: number) => {
		updateFilters({ ...filters, currentPage: pageNumber });
	};

	const nbPages = getNbPages(productsCount, numberPerPage);

	const headTitle = () => {
		return search
			? `Résultat de la recherche «${search}» pour l'organisation «${inputValue}» | Démarches | Je donne mon avis`
			: 'Services | Je donne mon avis';
	};

	return (
		<>
			<Head>
				<title>{headTitle()}</title>
				<meta name="description" content={headTitle()} />
			</Head>
			<ProductModal
				modal={product_modal}
				onSubmit={() => {
					setSearch('');
					if (filters.filter === 'created_at') {
						updateFilters({ ...filters, validatedSearch: '' });
					} else {
						updateFilters({ ...filters, filter: 'created_at' });
					}
				}}
			/>
			<ApiKeyModal modal={api_modal} />
			<div className={fr.cx('fr-container', 'fr-py-6w')}>
				<div
					className={fr.cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-mb-3w')}
				>
					<div className={fr.cx('fr-col-12', 'fr-col-md-4')}>
						<h1 className={fr.cx('fr-mb-0')}>
							{session?.user?.role !== 'admin' ? 'Mes services' : 'Services'}
						</h1>
					</div>
					<div
						className={cx(
							fr.cx('fr-col-12', 'fr-col-md-8'),
							classes.buttonContainer
						)}
					>
						{session?.user.role === 'user' && (
							<Button
								priority="secondary"
								iconId="fr-icon-earth-line"
								iconPosition="right"
								type="button"
								nativeButtonProps={api_modal.buttonProps}
							>
								Mes clés API
							</Button>
						)}

						<Button
							priority="secondary"
							iconId="fr-icon-add-circle-line"
							iconPosition="right"
							type="button"
							nativeButtonProps={product_modal.buttonProps}
						>
							Ajouter un nouveau service
						</Button>
					</div>
				</div>
				<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
					<div className={fr.cx('fr-col-12', 'fr-col-md-3')}>
						<Select
							label="Trier Par"
							nativeSelectProps={{
								name: 'my-select',
								value: filters.filter,
								onChange: event =>
									updateFilters({ ...filters, filter: event.target.value })
							}}
						>
							<option value="title:asc">Nom A à Z</option>
							<option value="entity.name:asc">Organisation A à Z</option>
							<option value="created_at:desc">Date de création</option>
							<option value="updated_at:desc">Date de mise à jour</option>
						</Select>
					</div>
					<div className={fr.cx('fr-col-12', 'fr-col-md-4')}>
						<Autocomplete
							id="filter-entity"
							disablePortal
							sx={{ width: '100%' }}
							options={entities
								.map(entity => ({
									label: `${entity.name} (${entity.acronym})`,
									value: entity.id
								}))
								.filter(
									entity =>
										!filters.filterEntity.some(
											filter => filter.value === entity.value
										)
								)}
							onChange={(_, option) => {
								if (option)
									updateFilters({
										...filters,
										filterEntity: [...filters.filterEntity, option] ?? null,
										currentPage: 1
									});
							}}
							noOptionsText="Aucune organisation trouvée"
							inputValue={inputValue}
							onInputChange={(event, newInputValue) => {
								setInputValue(newInputValue);
							}}
							renderInput={params => (
								<div ref={params.InputProps.ref}>
									<label htmlFor="filter-entity" className="fr-label">
										Filtrer par organisation
									</label>
									<input
										{...params.inputProps}
										className={params.inputProps.className + ' fr-input'}
										placeholder="Sélectionner une option"
										type="search"
									/>
								</div>
							)}
						/>
					</div>
					<div className={fr.cx('fr-col-12', 'fr-col-md-5', 'fr-col--bottom')}>
						<form
							className={cx(classes.searchForm)}
							onSubmit={e => {
								e.preventDefault();
								updateFilters({
									...filters,
									currentPage: 1,
									validatedSearch: search
								});
							}}
						>
							<div role="search" className={fr.cx('fr-search-bar')}>
								<Input
									label="Rechercher un service"
									hideLabel
									nativeInputProps={{
										placeholder: 'Rechercher un service',
										type: 'search',
										value: search,
										onChange: event => {
											if (!event.target.value) {
												updateFilters({
													...filters,
													currentPage: 1,
													validatedSearch: ''
												});
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
											checked: filters.filterOnlyFavorites,
											onChange: e => {
												updateFilters({
													...filters,
													currentPage: 1,
													filterOnlyFavorites: e.target.checked
												});
											}
										}
									}
								]}
							/>
						</div>
					)}
					<div className={fr.cx('fr-col-12', 'fr-col-md-12', 'fr-col--bottom')}>
						{filters.filterEntity.map(entity => (
							<Tag
								dismissible
								className={cx(classes.tagFilter)}
								nativeButtonProps={{
									onClick: () => {
										updateFilters({
											...filters,
											filterEntity: filters.filterEntity.filter(
												e => e.value !== entity.value
											)
										});
										setInputValue('');
									}
								}}
							>
								<p>{entity.label}</p>
							</Tag>
						))}
					</div>
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
									Services de{' '}
									<span className={cx(classes.boldText)}>
										{numberPerPage * (filters.currentPage - 1) + 1}
									</span>{' '}
									à{' '}
									<span className={cx(classes.boldText)}>
										{numberPerPage * (filters.currentPage - 1) +
											products.length}
									</span>{' '}
									sur{' '}
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
										userId={parseInt(session?.user?.id as string)}
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
										<p>Aucun service trouvé</p>
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
									defaultPage={filters.currentPage}
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
	tagFilter: {
		marginRight: '0.5rem',
		marginBottom: '0.5rem'
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
