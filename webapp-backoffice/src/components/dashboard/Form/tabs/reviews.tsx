import { ReviewPartialWithRelations } from '@/prisma/generated/zod';
import GenericFilters from '@/src/components/dashboard/Filters/Filters';
import FormConfigVersionsDisplay from '@/src/components/dashboard/Form/FormConfigVersionsDisplay';
import NoButtonsPanel from '@/src/components/dashboard/Pannels/NoButtonsPanel';
import NoReviewsPanel from '@/src/components/dashboard/Pannels/NoReviewsPanel';
import ExportReviews from '@/src/components/dashboard/Reviews/ExportReviews';
import ReviewFiltersModal from '@/src/components/dashboard/Reviews/ReviewFiltersModal';
import ReviewFilterTags from '@/src/components/dashboard/Reviews/ReviewFilterTags';
import ReviewTableHeader from '@/src/components/dashboard/Reviews/ReviewTableHeader';
import ReviewTableRow from '@/src/components/dashboard/Reviews/ReviewTableRow';
import { Loader } from '@/src/components/ui/Loader';
import { PageItemsCounter, Pagination } from '@/src/components/ui/Pagination';
import { hasAnyFilterChanged, useFilters } from '@/src/contexts/FiltersContext';
import { ReviewFiltersType } from '@/src/types/custom';
import { FormWithElements } from '@/src/types/prismaTypesExtended';
import {
	getExportFiltersLabel,
	getExportPeriodLabel,
	parseExportParams
} from '@/src/utils/export';
import { getNbPages } from '@/src/utils/tools';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Alert, { AlertProps } from '@codegouvfr/react-dsfr/Alert';
import { Button as ButtonDSFR } from '@codegouvfr/react-dsfr/Button';
import Input from '@codegouvfr/react-dsfr/Input';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { LinearProgress } from '@mui/material';
import { Button, RightAccessStatus } from '@prisma/client';
import { push } from '@socialgouv/matomo-next';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { tss } from 'tss-react/dsfr';
import ExportHistory from '../../Reviews/ExportHistory';
import ReviewDrawer from '../../Reviews/ReviewDrawer';
import ReviewFiltersModalRoot from '../../Reviews/ReviewFiltersModalRoot';
import ReviewKeywordFilters from '../../Reviews/ReviewKeywordFilters';

interface Props {
	form: FormWithElements;
	ownRight: Exclude<RightAccessStatus, 'removed'>;
	hasButtons: boolean;
	nbReviews: number;
	isLoading: boolean;
	buttons: Button[];
}

type FormErrors = {
	startDate: boolean;
	endDate: boolean;
};

const defaultErrors = {
	startDate: false,
	endDate: false
};

const ReviewsTab = (props: Props) => {
	const { form, ownRight, hasButtons, nbReviews, isLoading, buttons } = props;
	const router = useRouter();
	const { data: session } = useSession({ required: true });
	const { cx, classes } = useStyles();

	const [search, setSearch] = useState<string>('');
	const [validatedSearch, setValidatedSearch] = useState<string>('');
	const [errors, setErrors] = useState<FormErrors>(defaultErrors);
	const [currentPage, setCurrentPage] = useState(1);
	const [numberPerPage, setNumberPerPage] = useState(20);
	const [sort, setSort] = useState<string>('created_at:desc');
	const [buttonId, setButtonId] = useState<number>();
	const { fromMail } = router.query;
	const isFromMail = fromMail === 'true';
	const [currentExportId, setCurrentExportId] = useState<number>();
	const [isUserFetching, setIsUserFetching] = useState(false);
	const [selectedReview, setSelectedReview] =
		useState<ReviewPartialWithRelations | null>(null);
	const rowRefsMap = React.useRef<Map<number, HTMLTableRowElement>>(new Map());

	useEffect(() => {
		if (!selectedReview?.id) return;
		rowRefsMap.current
			.get(selectedReview.id)
			?.scrollIntoView({ block: 'center', behavior: 'smooth' });
	}, [selectedReview?.id]);

	const { mutate: createReviewViewLog } =
		trpc.reviewViewLog.create.useMutation();

	const filter_modal = useMemo(
		() =>
			createModal({
				id: 'filter-modal',
				isOpenedByDefault: false
			}),
		[]
	);

	const { filters, updateFilters, scopeToForm } = useFilters();

	useEffect(() => {
		scopeToForm(form.id);
	}, [form.id]);

	const [initialDateState, setInitialDateState] = React.useState({
		startDate: filters.sharedFilters.currentStartDate,
		endDate: filters.sharedFilters.currentEndDate,
		dateShortcut: filters.sharedFilters.dateShortcut
	});

	const handleSubmitfilters = (filtersT: ReviewFiltersType) => {
		const nextFilters: typeof filters = {
			...filters,
			productReviews: {
				...filters.productReviews,
				filters: {
					...filtersT
				}
			}
		};

		updateFilters({
			...nextFilters,
			sharedFilters: {
				...filters.sharedFilters,
				hasChanged: hasAnyFilterChanged(nextFilters)
			}
		});
		filter_modal.close();
		setCurrentPage(1);
		setIsUserFetching(true);
	};

	const {
		data: reviewResults,
		isFetching: isFetchingReviews,
		isLoading: isLoadingReviews,
		isRefetching: isRefetchingReviews,
		error: errorReviews
	} = trpc.review.getList.useQuery(
		{
			product_id: form.product_id,
			form_id: form.id,
			numberPerPage: numberPerPage,
			page: currentPage,
			shouldIncludeAnswers: true,
			search: validatedSearch,
			start_date: filters.productReviews.displayNew
				? undefined
				: filters.sharedFilters.currentStartDate,
			end_date: filters.productReviews.displayNew
				? undefined
				: filters.sharedFilters.currentEndDate,
			sort: sort,
			filters: filters.productReviews.filters,
			newReviews: filters.productReviews.displayNew,
			needLogging: false,
			loggingFromMail: isFromMail
		},
		{
			keepPreviousData: true,
			enabled: nbReviews > 0 && !isLoading
		}
	);

	const reviews = reviewResults?.data ?? [];
	const reviewsCountFiltered = reviewResults?.metadata?.countFiltered ?? 0;
	const reviewsCountAll = reviewResults?.metadata?.countAll ?? 0;

	useEffect(() => {
		if (!isFetchingReviews && !isRefetchingReviews) setIsUserFetching(false);
	}, [isFetchingReviews, isRefetchingReviews]);

	const { data: reviewLogResults } =
		trpc.userEvent.getLastFormReviewView.useQuery(
			{
				product_id: form.product_id,
				form_id: form.id
			},
			{
				initialData: {
					data: []
				},
				enabled: nbReviews > 0 && !isLoading
			}
		);

	const {
		data: exports,
		isLoading: isLoadingExports,
		refetch: refetchExports
	} = trpc.export.getList.useQuery(
		{
			product_id: form.product_id,
			form_id: form.id
		},
		{
			enabled: nbReviews > 0 && !isLoading
		}
	);

	const formHasExportsInProgress =
		(exports?.data.filter(e => e.status === 'processing' || e.status === 'idle')
			.length || 0) > 0;

	const userExportInProgress = exports?.data.find(
		e =>
			e.user_id === parseInt(session?.user?.id as string) &&
			(e.status === 'processing' || e.status === 'idle')
	);

	const currentExport =
		userExportInProgress || exports?.data.find(e => e.id === currentExportId);

	const currentExportAlert = useMemo((): {
		severity: AlertProps.Severity;
		title: NonNullable<ReactNode>;
		filters?: string[];
		isClosable?: boolean;
	} => {
		if (!currentExport) {
			return {
				severity: 'info',
				title: ''
			};
		}

		const parsedParams = parseExportParams(currentExport.params);
		const periodLabel = getExportPeriodLabel({
			...parsedParams,
			startDate: parsedParams.startDate,
			endDate: parsedParams.endDate
		});
		const filters = getExportFiltersLabel(parsedParams, true, buttons);
		const finalFilters = currentExport.params
			? [`Période : ${periodLabel}`, ...(filters as string[])]
			: undefined;

		switch (currentExport.status) {
			case 'idle':
				return {
					severity: 'info',
					title: (
						<div className={cx(classes.titleContainer)}>
							Préparation de l'export
							<span
								className={fr.cx('fr-text--md', 'fr-text--regular', 'fr-m-0')}
							>
								&nbsp;—&nbsp;
							</span>
							<span
								className={fr.cx('fr-text--md', 'fr-text--regular', 'fr-m-0')}
							>
								Cela peut prendre quelques minutes
							</span>
							<Loader size="sm" />
						</div>
					),
					filters: finalFilters
				};
			case 'processing':
				return {
					severity: 'info',
					title: (
						<div className={cx(classes.titleContainer)}>
							Export en cours
							<span
								className={fr.cx('fr-text--md', 'fr-text--regular', 'fr-m-0')}
							>
								&nbsp;—&nbsp;
							</span>
							<span
								className={fr.cx('fr-text--md', 'fr-text--regular', 'fr-m-0')}
							>
								Cela peut prendre quelques minutes
							</span>
							<Loader size="sm" />
						</div>
					),
					filters: finalFilters
				};
			case 'done': {
				return {
					severity: 'success',
					title: 'Export finalisé',
					filters: finalFilters,
					isClosable: true
				};
			}
		}
	}, [currentExport]);

	const { data: reviewLog } = reviewLogResults;

	const validateDateFormat = (date: string) => {
		const regex = /^\d{4}-\d{2}-\d{2}$/;
		return regex.test(date);
	};

	const nbPages = getNbPages(reviewsCountFiltered, numberPerPage);

	const handlePageChange = (pageNumber: number) => {
		setIsUserFetching(true);
		setCurrentPage(pageNumber);
	};

	const handleSortChange = (tmp_sort: string) => {
		setIsUserFetching(true);
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

	useEffect(() => {
		if (filters.productReviews.displayNew) {
			setInitialDateState({
				startDate: filters.sharedFilters.currentStartDate,
				endDate: filters.sharedFilters.currentEndDate,
				dateShortcut: filters.sharedFilters.dateShortcut
			});
		} else if (!filters.sharedFilters.dateShortcut) {
			updateFilters({
				...filters,
				sharedFilters: {
					...filters.sharedFilters,
					dateShortcut: initialDateState.dateShortcut,
					currentStartDate: initialDateState.startDate,
					currentEndDate: initialDateState.endDate
				}
			});
		}
	}, [filters.productReviews.displayNew]);

	useEffect(() => {
		if (filters && currentPage !== 1) {
			setCurrentPage(1);
		}
	}, [filters]);

	useEffect(() => {
		if (!formHasExportsInProgress) return;

		const interval = setInterval(() => {
			if (formHasExportsInProgress) {
				refetchExports();
			}
		}, 2000);

		return () => clearInterval(interval);
	}, [formHasExportsInProgress, refetchExports]);

	useEffect(() => {
		if (formHasExportsInProgress && userExportInProgress && !currentExportId) {
			setCurrentExportId(userExportInProgress.id);
		}
	}, [exports]);

	useEffect(() => {
		window._mtm?.push({
			event: 'matomo_event',
			container_type: 'backoffice',
			service_id: form.product_id,
			form_id: form.id,
			template_slug: form.form_template.slug,
			category: 'reviews',
			action_type: 'read',
			action: 'review_list_display',
			ui_source: 'onglet'
		});
	}, []);

	const handleSendInvitation = () => {
		router.push({
			pathname: `/administration/dashboard/product/${form.product_id}/access`,
			query: { autoInvite: true }
		});
	};

	const handleSelectReview = (
		review: ReviewPartialWithRelations,
		source: '' | '_prev' | '_next' = ''
	) => {
		setSelectedReview(review);
		createReviewViewLog({
			review_id: review.id as number,
			review_created_at: review.created_at as Date
		});
		push(['trackEvent', 'Product - Avis', 'Display-More-Infos']);
		window._mtm?.push({
			event: 'matomo_event',
			container_type: 'backoffice',
			service_id: form.product_id,
			form_id: form.id,
			template_slug: form.form_template.slug,
			category: 'reviews',
			action_type: 'read',
			action: 'review_detail_display',
			ui_source: 'review_button' + source
		});
	};

	const selectedReviewIndex = selectedReview
		? reviews.findIndex(r => r.id === selectedReview.id)
		: -1;

	const handlePreviousReview = () => {
		if (selectedReviewIndex > 0) {
			handleSelectReview(reviews[selectedReviewIndex - 1], '_prev');
		}
	};

	const handleNextReview = () => {
		if (selectedReviewIndex < reviews.length - 1) {
			handleSelectReview(reviews[selectedReviewIndex + 1], '_next');
		}
	};

	const displayEmptyState = () => {
		if (form.isDeleted) {
			return (
				<div
					className={fr.cx('fr-col-12')}
					style={{ display: 'flex', justifyContent: 'center' }}
				>
					<span>Ce formulaire est fermé et ne contient aucune réponse</span>
				</div>
			);
		}
		if (!hasButtons) {
			return <NoButtonsPanel />;
		}

		if (!reviewsCountAll) {
			return <NoReviewsPanel />;
		}
	};

	const getFormConfigHelperFromDate = (date: Date) => {
		const chronologicalConfigs = formConfigs
			.slice()
			.sort(
				(a, b) =>
					new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
			);

		const matchIndex = chronologicalConfigs.findLastIndex(
			fc => new Date(fc.created_at).getTime() < new Date(date).getTime()
		);

		const foundConfig =
			matchIndex >= 0 ? chronologicalConfigs[matchIndex] : undefined;

		const hasBaseConfig = chronologicalConfigs.some(fc => fc.version === 0);
		const versionOffset = hasBaseConfig ? 0 : 1;

		return foundConfig
			? { ...foundConfig, version: matchIndex + versionOffset }
			: undefined;
	};

	const submitSearch = (tmpSearch?: string) => {
		push(['trackEvent', 'Avis', 'Filtre-Recherche']);
		const startDateValid = validateDateFormat(
			filters.sharedFilters.currentStartDate
		);
		const endDateValid = validateDateFormat(
			filters.sharedFilters.currentEndDate
		);
		let newErrors = { startDate: false, endDate: false };

		if (!startDateValid) {
			newErrors.startDate = true;
		}
		if (!endDateValid) {
			newErrors.endDate = true;
		}
		setErrors(newErrors);

		if (startDateValid && endDateValid) {
			setIsUserFetching(true);
			setValidatedSearch((tmpSearch ?? search).trim());
			setCurrentPage(1);
		}
	};

	const formConfigs = form.form_configs;

	return (
		<>
			{form.form_template.slug === 'root' ? (
				<ReviewFiltersModalRoot
					modal={filter_modal}
					filters={filters.productReviews.filters}
					submitFilters={handleSubmitfilters}
					form_id={form.id}
				/>
			) : (
				<ReviewFiltersModal
					modal={filter_modal}
					filters={filters.productReviews.filters}
					submitFilters={handleSubmitfilters}
					form={form}
				/>
			)}

			<div className={cx(classes.title)}>
				<h2 className={fr.cx('fr-mb-0')}>Réponses</h2>
				{nbReviews > 0 && form.form_template.slug === 'root' && (
					<div className={cx(classes.buttonContainer)}>
						<ExportReviews
							form={form}
							startDate={filters.sharedFilters.currentStartDate}
							endDate={filters.sharedFilters.currentEndDate}
							mustHaveVerbatims={true}
							search={search}
							button_id={buttonId}
							filters={filters.productReviews.filters}
							reviewsCountfiltered={reviewsCountFiltered}
							reviewsCountAll={reviewsCountAll}
							onExportCreated={() => {
								setCurrentExportId(undefined);
								refetchExports();
							}}
							isDisabled={
								!!userExportInProgress || isLoading || isLoadingExports
							}
						/>
						<ExportHistory
							exports={(exports?.data || []) as any}
							buttons={buttons}
						/>
					</div>
				)}
			</div>

			{currentExport && (
				<Alert
					severity={currentExportAlert.severity}
					title={currentExportAlert.title}
					description={
						<div
							className={fr.cx(
								currentExport.link === null && currentExport.params
									? 'fr-mt-4v'
									: currentExport.link
									? 'fr-mt-2v'
									: 'fr-hidden'
							)}
						>
							{currentExport.link && (
								<p className={fr.cx(currentExportAlert.filters && 'fr-mb-4v')}>
									Téléchargez l'export :{' '}
									<Link
										href={currentExport.link}
										className={fr.cx('fr-link')}
										rel="noopener noreferrer"
									>
										Export du {currentExport.created_at.toLocaleDateString()}{' '}
										<i
											className={fr.cx('fr-icon-download-line', 'fr-icon--sm')}
											aria-hidden="true"
										/>
									</Link>
								</p>
							)}
							{currentExportAlert.filters && (
								<>
									<strong>Filtres sélectionnés:</strong>
									<ul>
										{currentExportAlert.filters.map((filter, index) => (
											<li key={index}>{filter}</li>
										))}
									</ul>
								</>
							)}
							{currentExport.status === 'processing' && (
								<div className={cx(classes.progressBarContainer)}>
									<span
										className={cx(classes.progressBarLabel)}
										style={{
											color:
												(currentExport as any).progress < 5
													? 'black'
													: undefined
										}}
									>
										{(currentExport as any).progress}%
									</span>
									<LinearProgress
										value={(currentExport as any).progress}
										variant="determinate"
										className={fr.cx('fr-mt-3v', 'fr-mb-2v', 'fr-p-3v')}
										sx={{
											color: fr.colors.decisions.text.title.blueFrance.default,
											backgroundColor:
												fr.colors.decisions.background.default.grey.active
										}}
									/>
								</div>
							)}
						</div>
					}
					closable={currentExportAlert.isClosable}
				/>
			)}

			{isLoading ? (
				<div className={cx(classes.loaderContainer)}>
					<Loader />
				</div>
			) : nbReviews === 0 || buttons.length === 0 ? (
				displayEmptyState()
			) : (
				<>
					<GenericFilters
						filterKey="productReviews"
						renderTags={() => (
							<ReviewFilterTags buttons={buttons} form={form} />
						)}
						filterModal={filter_modal}
						buttons={buttons}
						showNewReviewsOption={!!reviewLog[0]}
						reviewLogDate={reviewLog[0]?.created_at.toString()}
						form={form}
					/>
					<ReviewKeywordFilters
						product_id={form.product_id}
						form_id={form.id}
						start_date={
							filters.productReviews.displayNew
								? undefined
								: filters.sharedFilters.currentStartDate
						}
						end_date={
							filters.productReviews.displayNew
								? undefined
								: filters.sharedFilters.currentEndDate
						}
						fields={filters.productReviews.filters.fields}
						selectedKeyword={validatedSearch}
						onClick={keyword => {
							push([
								'trackEvent',
								'Product - Reviews',
								'Keyword-Filter-Clicked'
							]);
							if (keyword) {
								setSearch(`"${keyword}"`);
								submitSearch(`"${keyword}"`);
							} else {
								setSearch('');
								setValidatedSearch('');
								setCurrentPage(1);
							}
						}}
					/>

					{isLoadingReviews ? (
						<div className={fr.cx('fr-py-20v', 'fr-mt-4w')}>
							<Loader />
						</div>
					) : (
						<div
							aria-disabled={isUserFetching}
							{...(isUserFetching ? { inert: '' } : {})}
						>
							{formConfigs.some(fc => fc.version !== 0) && (
								<div className={fr.cx('fr-mt-8v')}>
									<FormConfigVersionsDisplay form={form} />
								</div>
							)}
							<div
								className={classes.paginationWrapper}
								style={{
									flexDirection:
										reviews.length === 0 ? 'column-reverse' : undefined
								}}
							>
								{!isUserFetching ? (
									<PageItemsCounter
										label="réponse"
										isFeminine
										startItemCount={numberPerPage * (currentPage - 1) + 1}
										endItemCount={
											numberPerPage * (currentPage - 1) + reviews.length
										}
										totalItemsCount={reviewsCountFiltered}
										fitContent
									/>
								) : (
									<div />
								)}

								<form
									className={cx(
										classes.searchForm,
										fr.cx('fr-col-12', 'fr-col-lg-4')
									)}
									onSubmit={e => {
										e.preventDefault();
										submitSearch();
										push(['trackEvent', 'Form - Reviews', 'Search']);
									}}
								>
									<div role="search" className={fr.cx('fr-search-bar')}>
										<Input
											label="Rechercher un avis"
											hideLabel
											nativeInputProps={{
												placeholder: 'Rechercher dans les commentaires',
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
										<ButtonDSFR
											priority="primary"
											type="submit"
											iconId="ri-search-2-line"
											iconPosition="left"
										>
											Rechercher
										</ButtonDSFR>
									</div>
								</form>
							</div>

							<div>
								{isUserFetching ? (
									<div className={fr.cx('fr-py-27v')}>
										<Loader />
									</div>
								) : (
									reviews.length > 0 && (
										<>
											<table className={cx(classes.tableContainer)}>
												<ReviewTableHeader
													sort={sort}
													onClick={handleSortChange}
													form={form}
												/>
												<tbody>
													{reviews.map((review, index) => {
														return (
															<ReviewTableRow
																key={index}
																review={review}
																search={validatedSearch}
																form={form}
																isSelected={selectedReview?.id === review.id}
																onSelectReview={handleSelectReview}
																rowRef={el => {
																	if (review.id === undefined) return;
																	if (el) rowRefsMap.current.set(review.id, el);
																	else rowRefsMap.current.delete(review.id);
																}}
															/>
														);
													})}
												</tbody>
											</table>
										</>
									)
								)}
							</div>
							{reviews.length > 0 && (
								<div
									className={fr.cx(
										'fr-grid-row--center',
										'fr-grid-row',
										'fr-mt-6v'
									)}
								>
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
												if (pageNumber !== currentPage) {
													window._mtm?.push({
														event: 'matomo_event',
														container_type: 'backoffice',
														service_id: form.product_id,
														form_id: form.id,
														template_slug: form.form_template.slug,
														category: 'reviews',
														action_type: 'read',
														action: `review_other_page_display`,
														ui_source: 'navigation',
														value: pageNumber
													});
												}
											},
											href: '#',
											classes: { link: fr.cx('fr-pagination__link') },
											key: `pagination-link-${pageNumber}`
										})}
										className={fr.cx('fr-mt-1w')}
									/>
								</div>
							)}
						</div>
					)}
				</>
			)}
			<ReviewDrawer
				review={selectedReview}
				formConfig={
					selectedReview
						? getFormConfigHelperFromDate(
								selectedReview.created_at || new Date()
						  )
						: undefined
				}
				hasManyVersions={formConfigs.length > 0}
				formTemplate={form.form_template}
				onClose={() => setSelectedReview(null)}
				onPrevious={handlePreviousReview}
				onNext={handleNextReview}
				hasPrevious={selectedReviewIndex > 0}
				hasNext={selectedReviewIndex < reviews.length - 1}
			/>
		</>
	);
};

const useStyles = tss.withName(ReviewsTab.name).create({
	boldText: {
		fontWeight: 'bold'
	},
	tableContainer: {
		width: '100%',
		borderCollapse: 'collapse'
	},
	loaderContainer: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		height: '350px',
		width: '100%'
	},
	searchForm: {
		display: 'flex',
		alignSelf: 'end',
		width: '100%',
		'.fr-search-bar': {
			width: '100%',

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
		marginBottom: '1.5rem',
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
	paginationWrapper: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: fr.spacing('8v'),
		marginBottom: fr.spacing('2v'),
		[fr.breakpoints.down('lg')]: {
			flexDirection: 'column-reverse',
			alignItems: 'flex-start',
			gap: fr.spacing('8v')
		}
	},
	buttonContainer: {
		width: '100%',
		[fr.breakpoints.up('lg')]: {
			display: 'flex',
			gap: fr.spacing('2v'),
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
	},
	titleContainer: {
		display: 'flex',
		flexWrap: 'wrap',
		alignItems: 'center',
		gap: fr.spacing('2v')
	},
	progressBarContainer: {
		position: 'relative'
	},
	progressBarLabel: {
		position: 'absolute',
		top: '50%',
		left: 25,
		transform: 'translate(-50%, -50%)',
		fontWeight: 'bold',
		color: 'white',
		zIndex: 1
	}
});

export default ReviewsTab;
