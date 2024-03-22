import ProductLayout from '@/src/layouts/Product/ProductLayout';
import { getServerSideProps } from '.';
import { AnswerIntention, Product } from '@prisma/client';
import { fr } from '@codegouvfr/react-dsfr';
import Input from '@codegouvfr/react-dsfr/Input';
import React from 'react';
import Button from '@codegouvfr/react-dsfr/Button';
import { tss } from 'tss-react/dsfr';
import { trpc } from '@/src/utils/trpc';
import { getNbPages } from '@/src/utils/tools';
import { Loader } from '@/src/components/ui/Loader';
import Select from '@codegouvfr/react-dsfr/Select';
import { Pagination } from '@/src/components/ui/Pagination';
import ReviewLine from '@/src/components/dashboard/Reviews/ReviewLine';
import ReviewFilters from '@/src/components/dashboard/Reviews/ReviewFilters';
import ReviewLineVerbatim from '@/src/components/dashboard/Reviews/ReviewLineVerbatim';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import ReviewFiltersModal from '@/src/components/dashboard/Reviews/ReviewFiltersModal';
import { ReviewFiltersType } from '@/src/types/custom';
import Tag from '@codegouvfr/react-dsfr/Tag';
import { FILTER_LABELS } from '@/src/utils/helpers';
import { displayIntention } from '@/src/utils/stats';
import ExportReviews from '@/src/components/dashboard/Reviews/ExportReviews';
import { CallOut } from '@codegouvfr/react-dsfr/CallOut';
import ExportModal from '@/src/components/dashboard/Reviews/ExportModal';

interface Props {
	product: Product;
}

const ProductReviewsPage = (props: Props) => {
	const { product } = props;
	const [startDate, setStartDate] = React.useState<string>(
		new Date(new Date().setFullYear(new Date().getFullYear() - 1))
			.toISOString()
			.split('T')[0]
	);
	const currentDate = new Date();
	const [endDate, setEndDate] = React.useState<string>(
		currentDate.toISOString().split('T')[0]
	);
	const [search, setSearch] = React.useState<string>('');
	const [validatedSearch, setValidatedSearch] = React.useState<string>('');
	const [currentPage, setCurrentPage] = React.useState(1);
	const [numberPerPage, setNumberPerPage] = React.useState(10);
	const [sort, setSort] = React.useState<string>('created_at:desc');
	const [displayMode, setDisplayMode] = React.useState<'reviews' | 'verbatim'>(
		'reviews'
	);
	const [buttonId, setButtonId] = React.useState<number>();

	const filter_modal = createModal({
		id: 'filter-modal',
		isOpenedByDefault: false
	});

	const [filters, setFilters] = React.useState<ReviewFiltersType>({
		satisfaction: '',
		easy: '',
		comprehension: '',
		needVerbatim: false,
		needOtherDifficulties: false,
		needOtherHelp: false,
		difficulties: '',
		help: ''
	});

	const handleSubmitfilters = (filters: ReviewFiltersType) => {
		setFilters(filters);
		filter_modal.close();
		setCurrentPage(1);
	};

	const {
		data: reviewResults,
		isFetching: isLoadingReviews,
		error: errorReviews
	} = trpc.review.getList.useQuery(
		{
			product_id: product.id,
			numberPerPage: numberPerPage,
			page: currentPage,
			shouldIncludeAnswers: true,
			mustHaveVerbatims: displayMode === 'reviews' ? false : true,
			search: validatedSearch,
			startDate,
			sort: sort,
			endDate,
			button_id: buttonId,
			filters: filters
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

	const { data: buttonResults, isLoading } = trpc.button.getList.useQuery({
		page: currentPage,
		numberPerPage: numberPerPage,
		product_id: product.id,
		isTest: true
	});

	const {
		data: reviews,
		metadata: { count: reviewsCount }
	} = reviewResults;

	const reviewsExtended = reviews.map(review => {
		if (review.answers) {
			return {
				...review,
				satisfaction: review.answers.find(
					answer => answer.field_code === 'satisfaction'
				),
				easy: review.answers.find(answer => answer.field_code === 'easy'),
				comprehension: review.answers.find(
					answer => answer.field_code === 'comprehension'
				),
				verbatim: review.answers.find(
					answer => answer.field_code === 'verbatim'
				),
				contact_satisfaction: review.answers.find(
					answer => answer.field_code === 'contact_satisfaction'
				)
			};
		}
	});

	const { cx, classes } = useStyles();

	const nbPages = getNbPages(reviewsCount, numberPerPage);

	const handlePageChange = (pageNumber: number) => {
		setCurrentPage(pageNumber);
	};

	const handleSortChange = (tmp_sort: string) => {
		if (!sort.includes(tmp_sort)) {
			setSort(`${tmp_sort}:asc`);
			return;
		}
		if (sort.includes(':asc') || sort.includes(':desc')) {
			setSort(
				`${sort.split(':')[0]}:${sort.split(':')[1] === 'asc' ? 'desc' : 'asc'}`
			);
		} else {
			setSort(`${sort}:asc`);
		}
	};

	const renderLabel = (
		type: string | undefined,
		key: string,
		value: string | boolean
	) => {
		switch (type) {
			case 'checkbox':
				return (
					<>
						<p>
							Avec {FILTER_LABELS.find(filter => filter.value === key)?.label}
						</p>
					</>
				);
			case 'iconbox':
				return (
					<>
						<p>
							{FILTER_LABELS.find(filter => filter.value === key)?.label} :{' '}
							{displayIntention((value ?? 'neutral') as AnswerIntention)}
						</p>
					</>
				);
			case 'select':
				return (
					<>
						<p>{value}</p>
					</>
				);
			default:
				return '';
		}
	};

	return (
		<>
			<ReviewFiltersModal
				modal={filter_modal}
				filters={filters}
				submitFilters={handleSubmitfilters}
			></ReviewFiltersModal>

			<ProductLayout product={product}>
				<h1>Avis</h1>
				<div
					className={fr.cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-mt-8v')}
				>
					<div className={fr.cx('fr-col-12', 'fr-col-md-6', 'fr-col-lg-4')}>
						<Input
							label="Date de début"
							nativeInputProps={{
								type: 'date',
								value: startDate,
								onChange: e => {
									setStartDate(e.target.value);
								}
							}}
						/>
					</div>
					<div className={fr.cx('fr-col-12', 'fr-col-md-6', 'fr-col-lg-4')}>
						<Input
							label="Date de fin"
							nativeInputProps={{
								type: 'date',
								value: endDate,
								onChange: e => {
									setEndDate(e.target.value);
								}
							}}
						/>
					</div>
					<div
						className={fr.cx(
							'fr-col-12',
							'fr-col-md-6',
							'fr-col-lg-4',
							'fr-col--bottom'
						)}
					>
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
										placeholder: 'Rechercher',
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
				<div
					className={fr.cx(
						'fr-grid-row',
						'fr-grid-row--gutters',
						'fr-grid-row--left',
						'fr-mt-4v'
					)}
				>
					<div
						className={cx(
							classes.filtersWrapper,
							fr.cx('fr-col-12', 'fr-col-md-6', 'fr-col-lg-4', 'fr-col-xl-3')
						)}
					>
						<div className={cx(classes.filterView)}>
							<label>Vue</label>
							<div className={fr.cx('fr-mt-2v')}>
								<Button
									priority={displayMode === 'reviews' ? 'primary' : 'secondary'}
									onClick={() => {
										setDisplayMode('reviews');
										setCurrentPage(1);
									}}
								>
									Avis
								</Button>
								<Button
									priority={displayMode === 'reviews' ? 'secondary' : 'primary'}
									onClick={() => {
										setDisplayMode('verbatim');
										setCurrentPage(1);
									}}
								>
									Verbatims
								</Button>
							</div>
						</div>
					</div>
					<div
						className={cx(
							classes.filtersWrapper,
							fr.cx('fr-col-12', 'fr-col-md-6', 'fr-col-lg-4', 'fr-col-xl-3')
						)}
					>
						<Select
							label="Sélectionner une source"
							nativeSelectProps={{
								onChange: e => {
									if (e.target.value !== 'undefined') {
										setButtonId(parseInt(e.target.value));
									} else {
										setButtonId(undefined);
									}
								}
							}}
						>
							<option value="undefined">Toutes les sources</option>
							{buttonResults?.data?.map(button => {
								return (
									<option key={button.id} value={button.id}>
										{button.title}
									</option>
								);
							})}
						</Select>
					</div>
					<div
						className={cx(
							classes.filtersWrapper,
							fr.cx('fr-col-12', 'fr-col-md-6', 'fr-col-lg-4', 'fr-col-xl-3')
						)}
					>
						<div className={cx(classes.buttonContainer)}>
							<Button
								priority="tertiary"
								iconId="fr-icon-filter-line"
								iconPosition="right"
								type="button"
								nativeButtonProps={filter_modal.buttonProps}
							>
								Plus de filtres
							</Button>
						</div>
					</div>
					<div
						className={cx(
							classes.filtersWrapper,
							fr.cx('fr-col-12', 'fr-col-md-6', 'fr-col-lg-4', 'fr-col-xl-3')
						)}
					>
						<div className={cx(classes.buttonContainer)}>
							<ExportReviews
								product_id={product.id}
								startDate={startDate}
								endDate={endDate}
								mustHaveVerbatims={displayMode === 'reviews' ? false : true}
								search={search}
								button_id={buttonId}
								filters={filters}
							></ExportReviews>
						</div>
					</div>
					<div className={fr.cx('fr-col-12', 'fr-col--bottom', 'fr-mt-8v')}>
						{Object.keys(filters).map((key, index) => {
							if (
								filters[key as keyof ReviewFiltersType] !== '' &&
								filters[key as keyof ReviewFiltersType] !== false
							) {
								return (
									<Tag
										key={index}
										dismissible
										className={cx(classes.tagFilter)}
										nativeButtonProps={{
											onClick: () => {
												setFilters({
													...filters,
													[key]:
														typeof filters[key as keyof ReviewFiltersType] ===
														'boolean'
															? false
															: ''
												});
											}
										}}
									>
										{renderLabel(
											FILTER_LABELS.find(filter => filter.value === key)?.type,
											key,
											filters[key as keyof ReviewFiltersType]
										)}
									</Tag>
								);
							}
						})}
					</div>
				</div>
				{isLoadingReviews ? (
					<div className={fr.cx('fr-py-20v', 'fr-mt-4w')}>
						<Loader />
					</div>
				) : (
					<>
						<div
							className={fr.cx(
								'fr-grid-row',
								'fr-grid-row--gutters',
								'fr-grid-row--right'
							)}
						>
							{reviews.length > 0 && nbPages > 0 && (
								<>
									<div className={fr.cx('fr-col-12', 'fr-mt-8v')}>
										Avis de{' '}
										<span className={cx(classes.boldText)}>
											{numberPerPage * (currentPage - 1) + 1}
										</span>{' '}
										à{' '}
										<span className={cx(classes.boldText)}>
											{numberPerPage * (currentPage - 1) + reviews.length}
										</span>{' '}
										sur{' '}
										<span className={cx(classes.boldText)}>{reviewsCount}</span>
									</div>
								</>
							)}
						</div>
						<div>
							{reviewsExtended.length > 0 ? (
								<>
									<ReviewFilters
										displayMode={displayMode}
										sort={sort}
										onClick={handleSortChange}
									/>
									{reviewsExtended.map((review, index) => {
										if (review && displayMode === 'reviews') {
											return <ReviewLine key={index} review={review} />;
										} else if (review && displayMode === 'verbatim') {
											return <ReviewLineVerbatim key={index} review={review} />;
										}
									})}
								</>
							) : (
								<div
									className={fr.cx(
										'fr-grid-row',
										'fr-grid-row--center',
										'fr-mt-20v'
									)}
								>
									<p>Aucun avis disponible </p>
								</div>
							)}
						</div>
						{reviewsExtended.length > 0 && (
							<div className={fr.cx('fr-grid-row--center', 'fr-grid-row')}>
								<Pagination
									count={nbPages}
									showFirstLast
									defaultPage={currentPage}
									maxVisiblePages={8}
									slicesSize={3}
									getPageLinkProps={pageNumber => ({
										onClick: event => {
											event.preventDefault();
											handlePageChange(pageNumber);
										},
										href: '#',
										classes: { link: fr.cx('fr-pagination__link') },
										key: `pagination-link-${pageNumber}`
									})}
									className={fr.cx('fr-mt-1w')}
								/>
							</div>
						)}
					</>
				)}
			</ProductLayout>
		</>
	);
};

export default ProductReviewsPage;

const useStyles = tss.withName(ProductReviewsPage.name).create(() => ({
	boldText: {
		fontWeight: 'bold'
	},
	searchForm: {
		'.fr-search-bar': {
			'.fr-input-group': {
				width: '100%',
				marginBottom: 0
			}
		}
	},
	filterView: {
		display: 'flex',
		flexDirection: 'column'
	},
	tagFilter: {
		marginRight: '0.5rem',
		marginBottom: '0.5rem'
	},
	filtersWrapper: {
		display: 'flex',
		alignItems: 'end'
	},
	buttonContainer: {
		width: '100%',
		[fr.breakpoints.up('lg')]: {
			display: 'flex',
			alignSelf: 'flex-end',
			justifyContent: 'flex-end',
			'.fr-btn': {
				justifySelf: 'flex-end'
			}
		},
		[fr.breakpoints.down('lg')]: {
			'.fr-btn:first-of-type': {
				marginBottom: '1rem'
			}
		}
	}
}));

export { getServerSideProps };
