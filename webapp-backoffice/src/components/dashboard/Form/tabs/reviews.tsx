import GenericFilters from '@/src/components/dashboard/Filters/Filters';
import FormConfigVersionsDisplay from '@/src/components/dashboard/Form/FormConfigVersionsDisplay';
import NoButtonsPanel from '@/src/components/dashboard/Pannels/NoButtonsPanel';
import NoReviewsPanel from '@/src/components/dashboard/Pannels/NoReviewsPanel';
import ExportReviews from '@/src/components/dashboard/Reviews/ExportReviews';
import ReviewTableHeader from '@/src/components/dashboard/Reviews/ReviewTableHeader';
import ReviewFiltersModal from '@/src/components/dashboard/Reviews/ReviewFiltersModal';
import ReviewTableRow from '@/src/components/dashboard/Reviews/ReviewTableRow';
import ReviewFilterTags from '@/src/components/dashboard/Reviews/ReviewFilterTags';
import { Loader } from '@/src/components/ui/Loader';
import { PageItemsCounter, Pagination } from '@/src/components/ui/Pagination';
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
import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { tss } from 'tss-react/dsfr';
import { ButtonModalType } from '../../ProductButton/ButtonModal';
import ReviewKeywordFilters from '../../Reviews/ReviewKeywordFilters';
import ExportHistory from '../../Reviews/ExportHistory';
import { useSession } from 'next-auth/react';
import Alert, { AlertProps } from '@codegouvfr/react-dsfr/Alert';
import {
	getExportFiltersLabel,
	getExportPeriodLabel,
	parseExportParams
} from '@/src/utils/export';
import Link from 'next/link';
import { LinearProgress } from '@mui/material';
import ReviewFiltersModalRoot from '../../Reviews/ReviewFiltersModalRoot';

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
	const { data: session } = useSession({ required: true });
	const { cx, classes } = useStyles();

	const [search, setSearch] = useState<string>('');
	const [validatedSearch, setValidatedSearch] = useState<string>('');
	const [errors, setErrors] = useState<FormErrors>(defaultErrors);
	const [currentPage, setCurrentPage] = useState(1);
	const [numberPerPage, setNumberPerPage] = useState(10);
	const [sort, setSort] = useState<string>('created_at:desc');
	const [buttonId, setButtonId] = useState<number>();
	const { fromMail } = router.query;
	const isFromMail = fromMail === 'true';
	const [currentExportId, setCurrentExportId] = useState<number>();

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
			? [`Période : ${periodLabel}`, ...filters]
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

	const {
		data: reviews,
		metadata: { countFiltered: reviewsCountFiltered, countAll: reviewsCountAll }
	} = reviewResults;

	const validateDateFormat = (date: string) => {
		const regex = /^\d{4}-\d{2}-\d{2}$/;
		return regex.test(date);
	};

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

	const handleSendInvitation = () => {
		router.push({
			pathname: `/administration/dashboard/product/${form.product_id}/access`,
			query: { autoInvite: true }
		});
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
				{nbReviews > 0 && form.form_template.slug === 'root' && (
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
							push([
								'trackEvent',
								'Product - Reviews',
								'Keyword-Filter-Clicked'
							]);
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
									<FormConfigVersionsDisplay form={form} />
								</div>
							)}
							<div
								className={fr.cx(
									'fr-grid-row',
									'fr-grid-row--gutters',
									'fr-grid-row--right'
								)}
							>
								<PageItemsCounter
									label="réponse"
									isFeminine
									startItemCount={numberPerPage * (currentPage - 1) + 1}
									endItemCount={
										numberPerPage * (currentPage - 1) + reviews.length
									}
									totalItemsCount={reviewsCountFiltered}
									additionalClasses={['fr-col-12', 'fr-mt-8v']}
								/>
							</div>
							<div>
								{reviews.length > 0 && (
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
