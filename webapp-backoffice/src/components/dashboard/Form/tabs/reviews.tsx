import GenericFilters from '@/src/components/dashboard/Filters/Filters';
import FormConfigVersionsDisplay from '@/src/components/dashboard/Form/FormConfigVersionsDisplay';
import NoButtonsPanel from '@/src/components/dashboard/Pannels/NoButtonsPanel';
import NoReviewsPanel from '@/src/components/dashboard/Pannels/NoReviewsPanel';
import ExportReviews from '@/src/components/dashboard/Reviews/ExportReviews';
import ReviewTableHeader from '@/src/components/dashboard/Reviews/ReviewTableHeader';
import ReviewFiltersModal from '@/src/components/dashboard/Reviews/ReviewFiltersModal';
import ReviewFiltersModalRoot from '@/src/components/dashboard/Reviews/ReviewFiltersModalRoot';
import ReviewKeywordFilters from '@/src/components/dashboard/Reviews/ReviewKeywordFilters';
import ReviewTableRow from '@/src/components/dashboard/Reviews/ReviewTableRow';
import ReviewFilterTags from '@/src/components/dashboard/Reviews/ReviewFilterTags';
import { Loader } from '@/src/components/ui/Loader';
import { Pagination } from '@/src/components/ui/Pagination';
import { useFilters } from '@/src/contexts/FiltersContext';
import { ReviewFiltersType } from '@/src/types/custom';
import { FormWithElements } from '@/src/types/prismaTypesExtended';
import {
	formatDateToFrenchStringWithHour,
	getNbPages,
	normalizeString
} from '@/src/utils/tools';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import { Button as ButtonDSFR } from '@codegouvfr/react-dsfr/Button';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import Input from '@codegouvfr/react-dsfr/Input';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { Button, RightAccessStatus } from '@prisma/client';
import { push } from '@socialgouv/matomo-next';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { tss } from 'tss-react/dsfr';
import { ButtonModalType } from '../../ProductButton/ButtonModal';

interface Props {
	form: FormWithElements;
	ownRight: Exclude<RightAccessStatus, 'removed'>;
	handleModalOpening: (modalType: ButtonModalType, button?: any) => void;
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
	const {
		form,
		ownRight,
		handleModalOpening,
		hasButtons,
		nbReviews,
		isLoading,
		buttons
	} = props;
	const router = useRouter();
	const [search, setSearch] = useState<string>('');
	const [validatedSearch, setValidatedSearch] = useState<string>('');
	const [errors, setErrors] = useState<FormErrors>(defaultErrors);
	const [currentPage, setCurrentPage] = useState(1);
	const [numberPerPage, setNumberPerPage] = useState(10);
	const [sort, setSort] = useState<string>('created_at:desc');
	const [buttonId, setButtonId] = useState<number>();
	const { fromMail } = router.query;
	const isFromMail = fromMail === 'true';

	const filter_modal = createModal({
		id: 'filter-modal',
		isOpenedByDefault: false
	});

	const { filters, updateFilters } = useFilters();

	const [initialDateState, setInitialDateState] = React.useState({
		startDate: filters.sharedFilters.currentStartDate,
		endDate: filters.sharedFilters.currentEndDate,
		dateShortcut: filters.sharedFilters.dateShortcut
	});

	const handleSubmitfilters = (filtersT: ReviewFiltersType) => {
		updateFilters({
			...filters,
			productReviews: {
				...filters.productReviews,
				filters: {
					...filtersT
				}
			},
			sharedFilters: {
				...filters.sharedFilters,
				hasChanged: true
			}
		});
		filter_modal.close();
		setCurrentPage(1);
	};

	const {
		data: reviewResults,
		isFetching: isLoadingReviews,
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
			initialData: {
				data: [],
				metadata: {
					countFiltered: 0,
					countAll: 0,
					countNew: 0,
					countForm1: 0,
					countForm2: 0
				}
			},
			enabled: nbReviews > 0 && !isLoading
		}
	);

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

	const { data: reviewLog } = reviewLogResults;

	const {
		data: reviews,
		metadata: { countFiltered: reviewsCountFiltered, countAll: reviewsCountAll }
	} = reviewResults;

	const validateDateFormat = (date: string) => {
		const regex = /^\d{4}-\d{2}-\d{2}$/;
		return regex.test(date);
	};

	const { cx, classes } = useStyles();

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

	useEffect(() => {
		if (filters.productReviews.displayNew) {
			setInitialDateState({
				startDate: filters.sharedFilters.currentStartDate,
				endDate: filters.sharedFilters.currentEndDate,
				dateShortcut: filters.sharedFilters.dateShortcut
			});

			updateFilters({
				...filters,
				sharedFilters: {
					...filters.sharedFilters,
					currentStartDate: new Date(
						reviewLog[0]
							? reviewLog[0].created_at
							: new Date(new Date().setFullYear(new Date().getFullYear() - 4))
									.toISOString()
									.split('T')[0]
					).toISOString(),
					currentEndDate: new Date(
						reviewLog[0]
							? reviewLog[0].created_at
							: new Date(new Date().setFullYear(new Date().getFullYear() - 4))
									.toISOString()
									.split('T')[0]
					)
						.toISOString()
						.split('T')[0],
					dateShortcut: undefined
				},
				currentPage: 1
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
		const formConfig = form.form_configs
			.slice()
			.reverse()
			.find(
				formConfig =>
					new Date(formConfig.created_at).getTime() < new Date(date).getTime()
			);

		let formConfigIndex = -1;

		if (formConfig) {
			formConfigIndex = form.form_configs
				.map(formConfig => formConfig.id)
				.indexOf(formConfig.id);
		}

		return { formConfig, versionNumber: formConfigIndex + 1 };
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
			setValidatedSearch(normalizeString(tmpSearch ?? search));
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
					setButtonId={setButtonId}
				/>
			) : (
				<ReviewFiltersModal
					modal={filter_modal}
					filters={filters.productReviews.filters}
					submitFilters={handleSubmitfilters}
					form={form}
					setButtonId={setButtonId}
				/>
			)}

			<div className={cx(classes.title)}>
				<h2 className={fr.cx('fr-mb-0')}>Réponses</h2>
				{nbReviews > 0 && (
					<div className={cx(classes.buttonContainer)}>
						<ExportReviews
							product_id={form.product_id}
							form_id={form.id}
							startDate={filters.sharedFilters.currentStartDate}
							endDate={filters.sharedFilters.currentEndDate}
							mustHaveVerbatims={true}
							search={search}
							button_id={buttonId}
							filters={filters.productReviews.filters}
							reviewsCountfiltered={reviewsCountFiltered}
							reviewsCountAll={reviewsCountAll}
						></ExportReviews>
					</div>
				)}
			</div>
			{isLoading ? (
				<div className={cx(classes.loaderContainer)}>
					<Loader />
				</div>
			) : nbReviews === 0 || buttons.length === 0 ? (
				displayEmptyState()
			) : (
				<>
					<div className={fr.cx('fr-my-8v')}>
						<GenericFilters
							filterKey="productReviews"
							topRight={
								<ButtonDSFR
									priority="tertiary"
									iconId="fr-icon-filter-line"
									iconPosition="right"
									type="button"
									nativeButtonProps={filter_modal.buttonProps}
								>
									Plus de filtres
								</ButtonDSFR>
							}
							renderTags={() => (
								<ReviewFilterTags buttons={buttons} form={form} />
							)}
						>
							{reviewLog[0] && (
								<Checkbox
									style={{ userSelect: 'none' }}
									className={fr.cx('fr-mb-0')}
									options={[
										{
											label: 'Afficher uniquement les nouvelles réponses',
											hintText: `Depuis votre dernière consultation (le ${formatDateToFrenchStringWithHour(
												reviewLog[0].created_at.toString()
											)})`,
											nativeInputProps: {
												name: 'favorites-products',
												checked: filters.productReviews.displayNew,
												onChange: e => {
													updateFilters({
														...filters,
														productReviews: {
															...filters.productReviews,
															displayNew: e.target.checked
														},
														sharedFilters: {
															...filters.sharedFilters,
															hasChanged: true
														}
													});
												}
											}
										}
									]}
								/>
							)}
						</GenericFilters>
					</div>
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
						selectedKeyword={validatedSearch}
						onClick={keyword => {
							setSearch(keyword);
							submitSearch(keyword);
						}}
					/>
					<div
						className={cx(
							classes.filtersWrapper,
							fr.cx('fr-col-12', 'fr-col-lg-4')
						)}
					>
						<form
							className={cx(classes.searchForm)}
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
					{isLoadingReviews ? (
						<div className={fr.cx('fr-py-20v', 'fr-mt-4w')}>
							<Loader />
						</div>
					) : (
						<>
							{formConfigs.some(fc => fc.version !== 0) && (
								<div className={fr.cx('fr-mt-8v')}>
									<FormConfigVersionsDisplay
										formConfigs={formConfigs}
										product={{
											...form.product,
											forms: [
												{
													...form,
													buttons: []
												}
											]
										}}
									/>
								</div>
							)}
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
											Réponses de{' '}
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
								{reviews.length > 0 ? (
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
															formTemplate={form.form_template}
															formConfigHelper={getFormConfigHelperFromDate(
																review.created_at || new Date()
															)}
															hasManyVersions={formConfigs.length > 0}
														/>
													);
												})}
											</tbody>
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
							{reviews.length > 0 && (
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
		</>
	);
};

export default ReviewsTab;

const useStyles = tss.withName(ReviewsTab.name).create({
	boldText: {
		fontWeight: 'bold'
	},
	tableContainer: {
		width: '100%'
	},
	loaderContainer: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		height: '350px',
		width: '100%'
	},
	searchForm: {
		width: '100%',
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
	filtersWrapper: {
		display: 'flex',
		alignItems: 'end'
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
});
