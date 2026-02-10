import EssentialProductModal from '@/src/components/dashboard/Product/EssentialProductModal';
import ProductCard from '@/src/components/dashboard/Product/ProductCard';
import ProductEmptyState from '@/src/components/dashboard/Product/ProductEmptyState';
import ProductModal from '@/src/components/dashboard/Product/ProductModal';
import { Loader } from '@/src/components/ui/Loader';
import NewsModal from '@/src/components/ui/modal/NewsModal';
import { PageItemsCounter, Pagination } from '@/src/components/ui/Pagination';
import { useFilters } from '@/src/contexts/FiltersContext';
import { useOnboarding } from '@/src/contexts/OnboardingContext';
import { useUserSettings } from '@/src/contexts/UserSettingsContext';
import { LATEST_NEWS_VERSION } from '@/src/utils/cookie';
import { getNbPages, normalizeString } from '@/src/utils/tools';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Alert from '@codegouvfr/react-dsfr/Alert';
import { Button } from '@codegouvfr/react-dsfr/Button';
import Input from '@codegouvfr/react-dsfr/Input';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import { Select } from '@codegouvfr/react-dsfr/Select';
import Tag from '@codegouvfr/react-dsfr/Tag';
import { Autocomplete } from '@mui/material';
import { Entity } from '@prisma/client';
import { push } from '@socialgouv/matomo-next';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo } from 'react';
import { tss } from 'tss-react/dsfr';

const entity_modal = createModal({
	id: 'entity-modal',
	isOpenedByDefault: false
});

const essential_service_modal = createModal({
	id: 'essential-service-modal',
	isOpenedByDefault: false
});

const newsModal = createModal({
	id: 'news-modal',
	isOpenedByDefault: false
});

const DashBoard = () => {
	const { filters, updateFilters } = useFilters();
	const {
		settings,
		setSettings,
		isLoading: isLoadingSettings
	} = useUserSettings();
	const router = useRouter();
	const { createdProduct, createdForm, reset: resetContext } = useOnboarding();

	const [search, setSearch] = React.useState<string>(filters.validatedSearch);
	const [inputValue, setInputValue] = React.useState<string>('');

	const [isModalSubmitted, setIsModalSubmitted] = React.useState(false);
	const [statusProductState, setStatusProductState] = React.useState<{
		msg: string;
		role: 'status' | 'alert';
	} | null>(null);

	const [productTitle, setProductTitle] = React.useState<string>('');
	const [numberPerPage, _] = React.useState(10);
	const [shouldModalOpen, setShouldModalOpen] = React.useState(false);
	const hasOpenedNewsModalRef = React.useRef(false);

	const isOnboardingDone = useMemo(() => {
		return !!(router.query.onboardingDone as string | undefined);
	}, []);

	const { data: session } = useSession({ required: true });

	const { cx, classes } = useStyles();

	useEffect(() => {
		const handleRouteChangeStart = (url: string) => {
			if (!url.startsWith('/administration/dashboard/products')) {
				resetContext();
			}
		};

		router.events.on('routeChangeStart', handleRouteChangeStart);

		return () => {
			router.events.off('routeChangeStart', handleRouteChangeStart);
		};
	}, [resetContext, router.events]);

	useEffect(() => {
		if (isLoadingSettings) return;
		setShouldModalOpen(!settings.newsModalSeen);
	}, [isLoadingSettings, settings.newsModalSeen]);

	useEffect(() => {
		if (!shouldModalOpen || !newsModal || hasOpenedNewsModalRef.current) return;
		const timer = setTimeout(() => {
			if (shouldModalOpen && newsModal && !hasOpenedNewsModalRef.current) {
				hasOpenedNewsModalRef.current = true;
				newsModal.open();
			}
		}, 500);
		return () => clearTimeout(timer);
	}, [shouldModalOpen, newsModal]);

	useEffect(() => {
		if (router.query.onboardingDone) {
			const { onboardingDone, ...restQuery } = router.query;
			router.replace(
				{
					pathname: router.pathname,
					query: restQuery
				},
				undefined,
				{ shallow: true }
			);
		}
	}, [router.query]);

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
			filterByUserFavorites: filters.filterOnlyFavorites,
			filterByStatusArchived: filters.filterOnlyArchived
		},
		{
			initialData: {
				data: [],
				metadata: {
					count: 0,
					countTotalUserScope: 0,
					countArchivedUserScope: 0
				}
			}
		}
	);

	const {
		data: products,
		metadata: { count: productsCount }
	} = productsResult;

	const {
		data: entitiesResult,
		isLoading: isLoadingEntities,
		refetch: refetchEntities
	} = trpc.entity.getList.useQuery(
		{ numberPerPage: 1000, userCanCreateProduct: true },
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
	const countTotalUserScope = productsResult.metadata.countTotalUserScope;
	const countArchivedUserScope = productsResult.metadata.countArchivedUserScope;

	const handlePageChange = (pageNumber: number) => {
		updateFilters({ ...filters, currentPage: pageNumber });
	};

	const nbPages = getNbPages(productsCount, numberPerPage);

	const headTitle = () => {
		return search
			? `Résultat de la recherche «${search}» pour l'organisation «${inputValue}» | Démarches | Je donne mon avis`
			: 'Services | Je donne mon avis';
	};

	const loadModalAndHead = () => {
		return (
			<>
				<Head>
					<title>{headTitle()}</title>
					<meta name="description" content={headTitle()} />
				</Head>

				<EssentialProductModal
					modal={essential_service_modal}
					productTitle={productTitle}
					onClose={() => {
						essential_service_modal.close();
					}}
				/>
				<NewsModal modal={newsModal} />
			</>
		);
	};

	useIsModalOpen(newsModal, {
		onConceal: () => {
			if (
				!hasOpenedNewsModalRef.current ||
				settings.newsModalSeen ||
				!shouldModalOpen
			)
				return;
			setSettings({
				...settings,
				newsModalSeen: true,
				newsVersionSeen: LATEST_NEWS_VERSION
			});
		}
	});

	if (
		products.length === 0 &&
		filters.filterEntity.length === 0 &&
		filters.validatedSearch === '' &&
		!filters.filterOnlyFavorites &&
		!filters.filterOnlyArchived &&
		!countArchivedUserScope &&
		!isLoadingProducts &&
		!isRefetchingProducts
	) {
		return (
			<>
				{loadModalAndHead()}
				<ProductEmptyState
					onButtonClick={() => {
						router.push('/administration/dashboard/product/new');
					}}
				/>
			</>
		);
	}

	const displayFilters =
		countTotalUserScope > 0 ||
		search !== '' ||
		filters.filterOnlyFavorites ||
		filters.filterOnlyArchived ||
		!!filters.filterEntity.length;

	return (
		<>
			{isModalSubmitted && (
				<div
					role="alert"
					className={cx(classes.container, fr.cx('fr-container'))}
				>
					<Alert
						closable
						onClose={function noRefCheck() {
							setIsModalSubmitted(false);
						}}
						severity={'success'}
						className={fr.cx('fr-mb-5w')}
						small
						description={`Vous êtes désormais administrateur de ${productTitle}`}
					/>
				</div>
			)}
			{statusProductState && (
				<div className={cx(classes.container, fr.cx('fr-container'))}>
					<Alert
						closable
						onClose={function noRefCheck() {
							setStatusProductState(null);
						}}
						severity={
							statusProductState.role === 'alert' ? 'warning' : 'success'
						}
						className={fr.cx('fr-mb-5w')}
						small
						description={
							<>
								<p role={statusProductState.role}>{statusProductState.msg}</p>
							</>
						}
					/>
				</div>
			)}

			{loadModalAndHead()}
			<div className={fr.cx('fr-container', 'fr-py-6w')}>
				<div
					className={fr.cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-mb-5v')}
				>
					<div className={fr.cx('fr-col-12', 'fr-col-md-4')}>
						<h1 className={fr.cx('fr-mb-0')}>
							{!session?.user?.role.includes('admin')
								? 'Vos services'
								: 'Services'}
						</h1>
					</div>
					<div
						className={cx(
							fr.cx('fr-col-12', 'fr-col-md-8'),
							classes.buttonContainer
						)}
					>
						<Button
							priority="secondary"
							iconId="fr-icon-add-circle-line"
							iconPosition="right"
							type="button"
							onClick={() => {
								resetContext();
								router.push('/administration/dashboard/product/new');
							}}
						>
							Ajouter un nouveau service
						</Button>
					</div>
				</div>
				{isOnboardingDone && createdProduct && createdForm && (
					<div role="alert">
						<Alert
							className={fr.cx('fr-col-12', 'fr-mb-8v')}
							title="Votre service et votre formulaire ont été créés avec succès !"
							as="h2"
							description={
								<>
									Pensez à copier le lien d’intégration sur votre site pour
									rendre votre formulaire visible aux usagers
									<Link
										href={`/administration/dashboard/product/${createdProduct.id}/forms/${createdForm.id}?tab=links`}
										className={fr.cx(
											'fr-link--icon-right',
											'fr-ml-2v',
											'fr-icon-arrow-right-line',
											'fr-link'
										)}
										onClick={() => {
											window._mtm?.push({
												event: 'matomo_event',
												container_type: 'backoffice',
												service_id: createdProduct.id,
												form_id: createdForm.id,
												template_slug: createdForm.form_template.slug,
												category: 'service',
												action: 'service_page_link_copy'
											});
										}}
									>
										Copier le lien d’intégration
									</Link>
								</>
							}
							severity="success"
							closable
						/>
					</div>
				)}

				{displayFilters && (
					<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
						{displayFilters && (
							<>
								<div className={fr.cx('fr-col-12', 'fr-col-md-3')}>
									<Select
										label="Trier Par"
										nativeSelectProps={{
											name: 'my-select',
											value: filters.filter,
											onChange: event =>
												updateFilters({
													...filters,
													filter: event.target.value
												})
										}}
									>
										<option value="title:asc">Nom A à Z</option>
										<option value="entity.name:asc">Organisation A à Z</option>
										<option value="created_at:desc">Date de création</option>
										<option value="updated_at:desc">Date de mise à jour</option>
									</Select>
								</div>
								<div className={fr.cx('fr-col-12', 'fr-col-md-3')}>
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
													filterEntity: [...filters.filterEntity, option],
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
								<div
									className={fr.cx(
										'fr-col-12',
										'fr-col-md-4',
										'fr-col--bottom'
									)}
								>
									<form
										className={cx(classes.searchForm)}
										onSubmit={e => {
											e.preventDefault();
											updateFilters({
												...filters,
												currentPage: 1,
												validatedSearch: normalizeString(search)
											});
											push(['trackEvent', 'Product', 'Search']);
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

								<div className={fr.cx('fr-col-12', 'fr-col-md-2')}>
									<Select
										label="Vue"
										nativeSelectProps={{
											name: 'select-view',
											value: filters.view,
											onChange: event => {
												const value = event.target.value as
													| 'all'
													| 'favorites'
													| 'archived';

												updateFilters({
													...filters,
													currentPage: 1,
													view: value,
													filterOnlyFavorites: value === 'favorites',
													filterOnlyArchived: value === 'archived'
												});
											},
											className: fr.cx('fr-pr-8v')
										}}
									>
										<option value="all">Services actifs</option>
										<option value="favorites">Mes favoris</option>
										<option value="archived">Services archivés</option>
									</Select>
								</div>
							</>
						)}
						{filters.filterEntity.length > 0 && (
							<ul
								className={cx(
									fr.cx('fr-col-12', 'fr-col-md-12', 'fr-my-1w'),
									classes.tagContainer
								)}
							>
								{filters.filterEntity.map((entity, index) => (
									<li key={index}>
										<Tag
											dismissible
											className={cx(classes.tagFilter)}
											title={`Retirer ${entity.label}`}
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
									</li>
								))}
							</ul>
						)}
					</div>
				)}
				{isLoadingProducts ||
				isLoadingEntities ||
				isLoadingFavorites ||
				isRefetchingProducts ? (
					<div
						className={fr.cx('fr-py-20v', 'fr-mt-4w')}
						role="status"
						aria-live="polite"
						aria-busy="true"
					>
						<Loader />
						<span className={fr.cx('fr-sr-only')}>
							Chargement des données...
						</span>
					</div>
				) : (
					<div>
						<div
							className={fr.cx(
								'fr-grid-row',
								'fr-grid-row--gutters',
								'fr-grid-row--right'
							)}
						>
							<PageItemsCounter
								label="service"
								startItemCount={numberPerPage * (filters.currentPage - 1) + 1}
								endItemCount={
									numberPerPage * (filters.currentPage - 1) + products.length
								}
								totalItemsCount={productsResult.metadata.count}
								additionalClasses={['fr-pt-3w']}
								emptyStateMessage={
									filters.filterOnlyFavorites &&
									search === '' &&
									!filters.filterEntity.length
										? 'Aucun service dans vos favoris'
										: 'Aucun service actif trouvé'
								}
							/>
						</div>
						<div
							className={cx(
								products.length === 0 ? classes.productsContainer : ''
							)}
						>
							<ul className={classes.buttonList}>
								{products.map((product, index) => (
									<li key={index}>
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
											showFavoriteButton={countTotalUserScope > 10}
											onDeleteProduct={() => {
												setStatusProductState({
													msg: `Le service "${product.title}" a bien été supprimé`,
													role: 'status'
												});
											}}
											onRestoreProduct={() => {
												updateFilters({
													...filters,
													filterOnlyArchived: false
												});
												setStatusProductState({
													msg: `Le service "${product.title}" a bien été restauré`,
													role: 'status'
												});
											}}
										/>
									</li>
								))}
							</ul>
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
	tagContainer: {
		display: 'flex',
		flexWrap: 'wrap',
		width: '100%',
		gap: '0.5rem',
		padding: 0,
		margin: 0,
		listStyle: 'none',
		justifyContent: 'flex-start'
	},
	container: {
		marginTop: '1.5rem'
	},
	checkboxContainer: {
		display: 'flex',
		gap: fr.spacing('2v')
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
	},
	buttonList: {
		paddingInlineStart: 0,
		listStyleType: 'none',
		li: {
			paddingBottom: 0
		}
	}
}));

export default DashBoard;
