import ProductLayout from '@/src/layouts/Product/ProductLayout';
import { getServerSideProps } from '.';
import { AnswerIntention, Product } from '@prisma/client';
import { fr } from '@codegouvfr/react-dsfr';
import Input from '@codegouvfr/react-dsfr/Input';
import React from 'react';
import Button from '@codegouvfr/react-dsfr/Button';
import { tss } from 'tss-react/dsfr';
import { trpc } from '@/src/utils/trpc';
import {
	formatDateToFrenchStringWithHour,
	getNbPages
} from '@/src/utils/tools';
import { Loader } from '@/src/components/ui/Loader';
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
import Head from 'next/head';
import NoReviewsPanel from '@/src/components/dashboard/Pannels/NoReviewsPanel';
import { useRouter } from 'next/router';
import NoButtonsPanel from '@/src/components/dashboard/Pannels/NoButtonsPanel';
import { useDebounce } from 'usehooks-ts';
import { push } from '@socialgouv/matomo-next';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { useSession } from 'next-auth/react';

interface Props {
	product: Product;
	ownRight: 'admin' | 'viewer';
}

type FormErrors = {
	startDate: boolean;
	endDate: boolean;
};

const defaultErrors = {
	startDate: false,
	endDate: false
};

const ProductReviewsPage = (props: Props) => {
	const { product, ownRight } = props;
	const router = useRouter();
	const { data: session } = useSession();
	const { view } = router.query;
	const [startDate, setStartDate] = React.useState<string>(
		new Date(new Date().setFullYear(new Date().getFullYear() - 1))
			.toISOString()
			.split('T')[0]
	);
	const [realStartDate, setRealStartDate] = React.useState<string>(
		new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString()
	);
	const currentDate = new Date();
	const [endDate, setEndDate] = React.useState<string>(
		currentDate.toISOString().split('T')[0]
	);
	const [search, setSearch] = React.useState<string>('');
	const [validatedSearch, setValidatedSearch] = React.useState<string>('');
	const [errors, setErrors] = React.useState<FormErrors>(defaultErrors);
	const [currentPage, setCurrentPage] = React.useState(1);
	const [numberPerPage, setNumberPerPage] = React.useState(10);
	const [newReviews, setNewReviews] = React.useState(false);
	const [sort, setSort] = React.useState<string>('created_at:desc');
	const [displayMode, setDisplayMode] = React.useState<'reviews' | 'verbatim'>(
		view === 'verbatim' ? 'verbatim' : 'reviews'
	);
	const [buttonId, setButtonId] = React.useState<number>();
	const [newReviewHandled, setNewReviewHandled] =
		React.useState<boolean>(false);
	const { fromMail } = router.query;
	const isFromMail = fromMail === 'true';

	const debouncedStartDate = useDebounce<string>(startDate, 500);
	const debouncedEndDate = useDebounce<string>(endDate, 500);

	const filter_modal = createModal({
		id: 'filter-modal',
		isOpenedByDefault: false
	});

	const [filters, setFilters] = React.useState<ReviewFiltersType>({
		satisfaction: [],
		comprehension: [],
		needVerbatim: false,
		needOtherDifficulties: false,
		needOtherHelp: false,
		help: [],
		buttonId: []
	});

	const handleSubmitfilters = (filters: ReviewFiltersType) => {
		setFilters(filters);
		filter_modal.close();
		setCurrentPage(1);
	};

	const { data: reviewMetaResults, isLoading: isLoadingMetaResults } =
		trpc.review.getList.useQuery(
			{
				product_id: product.id,
				numberPerPage: 1,
				page: 1
			},
			{
				initialData: {
					data: [],
					metadata: {
						countFiltered: 0,
						countAll: 0,
						countNew: 0,
						countForm1: 0,
						countForm2: 0
					}
				}
			}
		);

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
			start_date: realStartDate,
			end_date: debouncedEndDate,
			sort: sort,
			filters: filters,
			newReviews: newReviews,
			needLogging: true,
			loggingFromMail: isFromMail
		},
		{
			initialData: {
				data: [],
				metadata: {
					countFiltered: 0,
					countAll: 0,
					countNew: 0,
					countForm1: 0,
					countForm2: 0
				}
			}
		}
	);

	const {
		data: reviewLogResults,
		isFetching: isLoadingReviewLog,
		error: errorReviewLog
	} = trpc.userEvent.getLastReviewView.useQuery(
		{
			product_id: product.id
		},
		{
			initialData: {
				data: []
			}
		}
	);

	const { data: reviewLog } = reviewLogResults;

	const createReviewLog = trpc.userEvent.createReviewView.useMutation({
		onSuccess: result => {}
	});

	const { data: buttonResults, isLoading: isLoadingButtons } =
		trpc.button.getList.useQuery({
			page: 1,
			numberPerPage: 1000,
			product_id: product.id,
			isTest: true
		});

	const {
		data: reviews,
		metadata: { countFiltered: reviewsCountFiltered, countAll: reviewsCountAll }
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

	const validateDateFormat = (date: string) => {
		const regex = /^\d{4}-\d{2}-\d{2}$/;
		return regex.test(date);
	};

	const { cx, classes } = useStyles({ displayMode });

	const nbPages = getNbPages(reviewsCountFiltered, numberPerPage);

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

	const renderTags = () => {
		const tags = Object.keys(filters).flatMap((key, index) => {
			const filterValue = filters[key as keyof ReviewFiltersType];
			if (!Array.isArray(filterValue) && filterValue !== false) {
				return (
					<Tag
						key={index}
						title={'Retirer le filtre : Verbatim complété'}
						dismissible
						className={cx(classes.tagFilter)}
						nativeButtonProps={{
							onClick: () => {
								setFilters({
									...filters,
									[key]: typeof filterValue === 'boolean' ? false : ''
								});
							}
						}}
					>
						{renderLabel(
							FILTER_LABELS.find(filter => filter.value === key)?.type,
							key,
							filterValue
						)}
					</Tag>
				);
			} else if (Array.isArray(filterValue) && filterValue.length > 0) {
				return filterValue.map((value, subIndex) => {
					const labelRendered = renderLabel(
						FILTER_LABELS.find(filter => filter.value === key)?.type,
						key,
						value
					);

					return (
						<Tag
							key={`${key}-${subIndex}`}
							title={`Retirer le filtre ${labelRendered}`}
							dismissible
							className={cx(classes.tagFilter)}
							nativeButtonProps={{
								onClick: () => {
									setFilters({
										...filters,
										[key]: filterValue.filter(item => item !== value)
									});
								}
							}}
						>
							{labelRendered}
						</Tag>
					);
				});
			} else {
				return null;
			}
		});

		return tags.length > 0 ? tags : null;
	};

	const renderLabel = (
		type: string | undefined,
		key: string,
		value: string | string[] | boolean
	) => {
		switch (type) {
			case 'checkbox':
				return `${FILTER_LABELS.find(filter => filter.value === key)?.label} complété`;
			case 'iconbox':
				return `${FILTER_LABELS.find(filter => filter.value === key)?.label} : ${displayIntention((value ?? 'neutral') as AnswerIntention)}`;
			case 'select':
				return `Source : ${buttonResults?.data.find(b => b.id === parseInt(value as string))?.title}`;
			default:
				return '';
		}
	};

	const handleNewReviews = (e: boolean) => {
		setNewReviews(e);
		if (e) {
			setStartDate(
				new Date(
					reviewLog[0]
						? reviewLog[0].created_at
						: new Date(new Date().setFullYear(new Date().getFullYear() - 4))
								.toISOString()
								.split('T')[0]
				)
					.toISOString()
					.split('T')[0]
			);
			setRealStartDate(
				new Date(
					reviewLog[0]
						? reviewLog[0].created_at
						: new Date(new Date().setFullYear(new Date().getFullYear() - 4))
								.toISOString()
								.split('T')[0]
				).toISOString()
			);
		} else {
			setStartDate(
				new Date(new Date().setFullYear(new Date().getFullYear() - 1))
					.toISOString()
					.split('T')[0]
			);
			setRealStartDate(
				new Date(new Date().setFullYear(new Date().getFullYear() - 1))
					.toISOString()
					.split('T')[0]
			);
		}
	};

	const handleButtonClick = () => {
		router.push({
			pathname: `/administration/dashboard/product/${product.id}/buttons`,
			query: { autoCreate: true }
		});
	};

	const handleSendInvitation = () => {
		router.push({
			pathname: `/administration/dashboard/product/${product.id}/access`,
			query: { autoInvite: true }
		});
	};

	const displayEmptyState = () => {
		if (!buttonResults?.data.length) {
			return <NoButtonsPanel onButtonClick={handleButtonClick} />;
		}

		if (!reviewsCountAll) {
			return (
				<NoReviewsPanel
					improveBtnClick={() => {}}
					sendInvitationBtnClick={handleSendInvitation}
				/>
			);
		}
	};

	const submit = () => {
		const startDateValid = validateDateFormat(startDate);
		const endDateValid = validateDateFormat(endDate);
		let newErrors = { startDate: false, endDate: false };

		if (!startDateValid) {
			newErrors.startDate = true;
		}
		if (!endDateValid) {
			newErrors.endDate = true;
		}
		setErrors(newErrors);

		if (startDateValid && endDateValid) {
			setValidatedSearch(search.replace(/[^\w\sÀ-ÿ'"]/gi, '').trim());
			setCurrentPage(1);
		}
	};

	return (
		<>
			<ReviewFiltersModal
				modal={filter_modal}
				filters={filters}
				submitFilters={handleSubmitfilters}
				product_id={product.id}
				setButtonId={setButtonId}
			></ReviewFiltersModal>

			<ProductLayout product={product} ownRight={ownRight}>
				<Head>
					<title>{product.title} | Avis | Je donne mon avis</title>
					<meta
						name="description"
						content={`${product.title} Avis | Je donne mon avis`}
					/>
				</Head>
				<div className={cx(classes.title)}>
					<h1 className={fr.cx('fr-mb-0')}>Avis</h1>

					<div className={cx(classes.buttonContainer)}>
						<ExportReviews
							product_id={product.id}
							startDate={startDate}
							endDate={endDate}
							mustHaveVerbatims={displayMode === 'reviews' ? false : true}
							search={search}
							button_id={buttonId}
							filters={filters}
							reviewsCountfiltered={reviewsCountFiltered}
							reviewsCountAll={reviewsCountAll}
						></ExportReviews>
					</div>
				</div>
				{isLoadingMetaResults || isLoadingButtons ? (
					<Loader />
				) : reviewMetaResults.metadata.countAll === 0 ||
				  buttonResults?.data.length === 0 ? (
					displayEmptyState()
				) : (
					<>
						<div
							className={fr.cx(
								'fr-grid-row',
								'fr-grid-row--gutters',
								'fr-mt-8v'
							)}
						>
							<div className={cx(classes.filtersWrapper, fr.cx('fr-col-12'))}>
								<div className={cx(classes.filterView)}>
									<label>Vue</label>
									<div className={fr.cx('fr-mt-2v')}>
										<Button
											priority={
												displayMode === 'reviews' ? 'primary' : 'secondary'
											}
											className={
												displayMode === 'reviews'
													? classes.buttonOption
													: classes.buttonOptionDisabled
											}
											onClick={() => {
												setDisplayMode('reviews');
												setCurrentPage(1);
												push([
													'trackEvent',
													'Product - Reviews',
													'Filtre-Vue-Avis'
												]);
											}}
										>
											{displayMode === 'reviews' && (
												<span
													className="ri-chat-poll-line fr-mr-1v fr-icon--sm"
													aria-hidden="true"
												></span>
											)}
											Avis
										</Button>
										<Button
											priority={
												displayMode === 'reviews' ? 'secondary' : 'primary'
											}
											className={
												displayMode === 'reviews'
													? classes.buttonOptionDisabled
													: classes.buttonOption
											}
											onClick={() => {
												setDisplayMode('verbatim');
												setCurrentPage(1);
												push([
													'trackEvent',
													'Product - Reviews',
													'Filtre-Vue-Verbatim'
												]);
											}}
										>
											{displayMode === 'verbatim' && (
												<span
													className="ri-chat-3-line fr-mr-1v fr-icon--sm"
													aria-hidden="true"
												></span>
											)}
											Verbatims
										</Button>
									</div>
								</div>
							</div>
						</div>
						<div
							className={fr.cx(
								'fr-grid-row',
								'fr-grid-row--gutters',
								'fr-mt-8v'
							)}
						>
							<div
								className={cx(
									fr.cx('fr-col-12', 'fr-col-md-6', 'fr-col-lg-3'),
									classes.errorMsg
								)}
							>
								<Input
									label="Date de début"
									nativeInputProps={{
										type: 'date',
										value: startDate,
										onChange: e => {
											setStartDate(e.target.value);
											setRealStartDate(e.target.value);
											push(['trackEvent', 'Avis', 'Filtre-Date-Début']);
											submit();
										}
									}}
									state={errors.startDate ? 'error' : 'default'}
									stateRelatedMessage={
										errors.startDate ? (
											<span role="alert">format attendu : JJ/MM/AAAA</span>
										) : null
									}
								/>
							</div>
							<div
								className={cx(
									fr.cx('fr-col-12', 'fr-col-md-6', 'fr-col-lg-3'),
									classes.errorMsg
								)}
							>
								<Input
									label="Date de fin"
									nativeInputProps={{
										type: 'date',
										value: endDate,
										onChange: e => {
											setEndDate(e.target.value);
											push(['trackEvent', 'Avis', 'Filtre-Date-Fin']);
											submit();
										}
									}}
									state={errors.endDate ? 'error' : 'default'}
									stateRelatedMessage={
										errors.endDate ? (
											<span role="alert">format attendu : JJ/MM/AAAA</span>
										) : null
									}
								/>
							</div>
							<div
								className={fr.cx(
									'fr-col-12',
									'fr-col-md-6',
									'fr-col-lg-6',
									'fr-col--bottom'
								)}
							>
								<form
									className={cx(classes.searchForm)}
									onSubmit={e => {
										e.preventDefault();
										submit();
										push(['trackEvent', 'Product - Reviews', 'Search']);
									}}
								>
									<div role="search" className={fr.cx('fr-search-bar')}>
										<Input
											label="Rechercher un avis"
											hideLabel
											nativeInputProps={{
												placeholder: 'Rechercher dans les verbatims',
												type: 'search',
												value: search,
												onChange: event => {
													if (!event.target.value) {
														setValidatedSearch('');
													}
													setSearch(event.target.value);
													push(['trackEvent', 'Avis', 'Filtre-Recherche']);
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
								'fr-mt-6v'
							)}
						>
							<div
								className={cx(
									classes.filtersWrapper,
									fr.cx('fr-col-12', 'fr-col-md-6', 'fr-col-lg-6')
								)}
							>
								{reviewLog[0] && (
									<Checkbox
										style={{ userSelect: 'none' }}
										className={fr.cx('fr-mb-0')}
										options={[
											{
												label: 'Afficher uniquement les nouveaux avis',
												hintText: `Depuis votre dernière consultation (le ${formatDateToFrenchStringWithHour(reviewLog[0].created_at.toString())})`,
												nativeInputProps: {
													name: 'favorites-products',
													checked: newReviews,
													onChange: e => {
														handleNewReviews(e.target.checked);
													}
												}
											}
										]}
									/>
								)}
							</div>
							<div
								className={cx(
									classes.filtersWrapper,
									fr.cx('fr-col-12', 'fr-col-md-6', 'fr-col-lg-6')
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
							<div className={fr.cx('fr-col-12', 'fr-col--bottom', 'fr-mt-8v')}>
								{renderTags()}
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
											<div
												role="status"
												className={fr.cx('fr-col-12', 'fr-mt-8v')}
											>
												Avis de{' '}
												<span className={cx(classes.boldText)}>
													{numberPerPage * (currentPage - 1) + 1}
												</span>{' '}
												à{' '}
												<span className={cx(classes.boldText)}>
													{numberPerPage * (currentPage - 1) + reviews.length}
												</span>{' '}
												sur{' '}
												<span className={cx(classes.boldText)}>
													{reviewsCountFiltered}
												</span>
											</div>
										</>
									)}
								</div>
								<div>
									{reviewsExtended.length > 0 ? (
										<>
											<table className={cx(classes.tableContainer)}>
												<ReviewFilters
													displayMode={displayMode}
													sort={sort}
													onClick={handleSortChange}
												/>
												{reviewsExtended.map((review, index) => {
													if (review && displayMode === 'reviews') {
														return (
															<ReviewLine
																key={index}
																review={review}
																search={validatedSearch}
															/>
														);
													} else if (review && displayMode === 'verbatim') {
														return (
															<ReviewLineVerbatim
																key={index}
																review={review}
																search={validatedSearch}
															/>
														);
													}
												})}
											</table>
										</>
									) : (
										<div
											className={fr.cx(
												'fr-grid-row',
												'fr-grid-row--center',
												'fr-mt-20v'
											)}
										>
											<p role="status">Aucun avis disponible </p>
										</div>
									)}
								</div>
								{reviewsExtended.length > 0 && (
									<div className={fr.cx('fr-grid-row--center', 'fr-grid-row')}>
										<Pagination
											count={nbPages}
											showFirstLast
											defaultPage={currentPage}
											maxVisiblePages={6}
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
					</>
				)}
			</ProductLayout>
		</>
	);
};

export default ProductReviewsPage;

const useStyles = tss
	.withName(ProductReviewsPage.name)
	.withParams<{ displayMode: 'reviews' | 'verbatim' }>()
	.create(({ displayMode }) => ({
		boldText: {
			fontWeight: 'bold'
		},
		tableContainer: {
			width: '100%'
		},
		searchForm: {
			'.fr-search-bar': {
				'.fr-input-group': {
					width: '100%',
					marginBottom: 0
				}
			}
		},
		buttonOption: {
			border: `1px solid ${fr.colors.decisions.border.active.blueFrance.default}`
		},
		buttonOptionDisabled: {
			border: 'none'
		},
		title: {
			display: 'flex',
			justifyContent: 'space-between',
			marginBottom: '1rem',
			[fr.breakpoints.down('lg')]: {
				flexDirection: 'column',
				'.fr-btn': {
					marginTop: '1rem'
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
			alignItems: 'start'
		},
		buttonContainer: {
			width: '100%',
			[fr.breakpoints.up('lg')]: {
				display: 'flex',
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
		},
		errorMsg: {
			'.fr-error-text': {
				marginTop: '0.5rem'
			},
			'p.fr-error-text': {
				position: 'absolute'
			}
		}
	}));

export { getServerSideProps };
