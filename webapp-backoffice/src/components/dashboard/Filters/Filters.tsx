import {
	Filters,
	initialFilterState,
	useFilters
} from '@/src/contexts/FiltersContext';
import { tss } from 'tss-react/dsfr';
import { fr } from '@codegouvfr/react-dsfr';
import { useEffect, useMemo } from 'react';
import Button from '@codegouvfr/react-dsfr/Button';
import { getDatesByShortCut } from '@/src/utils/tools';
import { FormWithElements } from '@/src/types/prismaTypesExtended';
import { CustomModalProps } from '@/src/types/custom';
import { Button as PrismaButton } from '@prisma/client';
import DateRangePickerButton from './DateRangePickerButton';
import IntegrationLinksDropdown from './IntegrationLinksDropdown';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { push } from '@socialgouv/matomo-next';

const dateShortcuts = [
	{
		label: '365 derniers jours',
		name: 'one-year'
	},
	{
		label: '30 derniers jours',
		name: 'one-month'
	},
	{
		label: '7 derniers jours',
		name: 'one-week'
	}
] as const;

export type DateShortcutName =
	| (typeof dateShortcuts)[number]['name']
	| undefined;

export type FilterSectionKey = keyof Pick<
	Filters,
	'productActivityLogs' | 'productReviews' | 'productStats'
>;

type FiltersProps<T extends FilterSectionKey> = {
	filterKey: T;
	sticky?: Boolean;
	children?: React.ReactNode;
	topRight?: React.ReactNode;
	renderTags?: () => (React.JSX.Element | null)[] | React.JSX.Element | null;
	form?: FormWithElements;
	productId?: number;
	filterModal?: CustomModalProps;
	buttons?: PrismaButton[];
	showNewReviewsOption?: boolean;
	reviewLogDate?: string;
};

const GenericFilters = <T extends FilterSectionKey>({
	filterKey,
	sticky,
	children,
	topRight,
	renderTags,
	form,
	productId,
	filterModal,
	buttons,
	showNewReviewsOption,
	reviewLogDate
}: FiltersProps<T>) => {
	const { classes, cx } = useStyles();
	const { filters, updateFilters, resetSectionFilters } = useFilters();

	const sharedFilters = filters['sharedFilters'];

	const getActiveFilterCount = (): number => {
		if (filterKey === 'productReviews') {
			const reviewFilters = filters.productReviews.filters;
			let count = 0;
			if (reviewFilters.needOtherDifficulties) count++;
			if (reviewFilters.needOtherHelp) count++;
			if (reviewFilters.fields) {
				count += reviewFilters.fields.reduce(
					(acc, f) => acc + f.values.length,
					0
				);
			}
			return count;
		}
		return 0;
	};

	const hasVerbatimBlock =
		form &&
		form.form_template.form_template_steps
			.flatMap(step => step.form_template_blocks)
			.some(block => block.field_code === 'verbatim');

	const activeFilterCount = getActiveFilterCount();

	const isAnyVisibleFilterActive = useMemo((): boolean => {
		if (
			sharedFilters.dateShortcut !==
			initialFilterState.sharedFilters.dateShortcut
		)
			return true;
		if (showNewReviewsOption && filters.productReviews.displayNew) return true;
		if (buttons && buttons.length > 0) {
			if (
				filterKey === 'productStats' &&
				filters.productStats.buttonId !== undefined
			)
				return true;
			if (
				filterKey === 'productReviews' &&
				filters.productReviews.filters.buttonId?.length > 0
			)
				return true;
		}
		if (filterModal && filterKey === 'productReviews') {
			const rf = filters.productReviews.filters;
			if (rf.needVerbatim || rf.needOtherDifficulties || rf.needOtherHelp)
				return true;
			if (rf.fields?.some(f => f.values.length > 0)) return true;
		}
		if (
			filterKey === 'productActivityLogs' &&
			filters.productActivityLogs.actionType.length > 0
		)
			return true;
		return false;
	}, [
		sharedFilters.dateShortcut,
		filters,
		filterKey,
		showNewReviewsOption,
		buttons,
		filterModal
	]);

	useEffect(() => {
		if (sharedFilters.dateShortcut) {
			const { startDate, endDate } = getDatesByShortCut(
				sharedFilters.dateShortcut
			);

			if (
				startDate !== sharedFilters.currentStartDate ||
				endDate !== sharedFilters.currentEndDate
			) {
				updateFilters({
					...filters,
					[filterKey]: {
						...filters[filterKey]
					},
					sharedFilters: {
						...filters['sharedFilters'],
						currentStartDate: startDate,
						currentEndDate: endDate
					},
					currentPage: 1
				});
			}
		}
	}, [sharedFilters.hasChanged, sharedFilters.dateShortcut]);

	return (
		<div
			className={cx(classes.filterContainer, sticky && classes.stickyContainer)}
		>
			<div className={cx(fr.cx('fr-mb-1v'), classes.titleContainer)}>
				<span className={fr.cx('fr-mb-2v', 'fr-h5')}>Filtrer</span>
				{topRight}
			</div>

			<div className={cx(classes.filterButtonsContainer)}>
				<DateRangePickerButton
					filterKey={filterKey}
					showNewReviewsOption={showNewReviewsOption}
					reviewLogDate={reviewLogDate}
					form={form}
					productId={productId}
				/>
				{buttons && buttons.length > 0 && (
					<IntegrationLinksDropdown buttons={buttons} filterKey={filterKey} />
				)}
				{filterModal && (
					<>
						<Button
							priority="tertiary"
							className={cx(classes.filterButton)}
							iconId="fr-icon-filter-line"
							iconPosition="right"
							type="button"
							nativeButtonProps={filterModal.buttonProps}
						>
							Plus de filtres
							{activeFilterCount > 0 && (
								<span className={cx(classes.filterCountBadge)}>
									{activeFilterCount}
								</span>
							)}
						</Button>
						{hasVerbatimBlock && (
							<div className={cx(classes.section)}>
								<Checkbox
									small
									options={[
										{
											label: 'Avis avec commentaire complété',
											nativeInputProps: {
												name: 'needVerbatim',
												checked: filters.productReviews.filters.needVerbatim,
												onChange: () => {
													updateFilters({
														...filters,
														productReviews: {
															...filters.productReviews,
															filters: {
																...filters.productReviews.filters,
																needVerbatim:
																	!filters.productReviews.filters.needVerbatim
															}
														}
													});
													push(['trackEvent', 'Avis', 'Filtre-Complémentaire']);
												}
											}
										}
									]}
									state="default"
								/>
							</div>
						)}
					</>
				)}

				<div className={cx(classes.tagsContainer, fr.cx('fr-col-12'))}>
					{renderTags && renderTags()}
					{isAnyVisibleFilterActive && (
						<Button
							priority="tertiary no outline"
							iconPosition="right"
							iconId="ri-refresh-line"
							size="small"
							onClick={() => {
								resetSectionFilters(filterKey);
							}}
						>
							Réinitialiser les filtres
						</Button>
					)}
				</div>
			</div>

			{children && <div>{children}</div>}
		</div>
	);
};

const useStyles = tss.create({
	filterContainer: {
		display: 'flex',
		flexDirection: 'column',
		gap: '0.5rem'
	},
	stickyContainer: {
		[fr.breakpoints.up('md')]: {
			position: 'sticky',
			top: -1,
			zIndex: 99,
			backgroundColor: fr.colors.decisions.background.default.grey.default
		}
	},
	titleContainer: {
		display: 'flex',
		justifyContent: 'space-between'
	},
	filterButtonsContainer: {
		display: 'flex',
		flexWrap: 'wrap',
		gap: fr.spacing('4v'),
		alignItems: 'center'
	},
	filterButton: {
		border: `1px solid ${fr.colors.decisions.border.default.grey.default}`
	},
	filterCountBadge: {
		display: 'inline-flex',
		alignItems: 'center',
		justifyContent: 'center',
		minWidth: '1.5rem',
		height: '1.5rem',
		borderRadius: '5rem',
		backgroundColor: fr.colors.decisions.background.contrast.grey.default,
		color: fr.colors.decisions.text.label.grey.default,
		fontSize: '0.75rem',
		marginLeft: fr.spacing('1v'),
		padding: `0 ${fr.spacing('1v')}`
	},
	section: {
		position: 'relative',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		'& .fr-fieldset': {
			marginBottom: 0,
			'&  .fr-label': {
				...fr.spacing('padding', { topBottom: 0 }),
				'&::before': {
					top: '0!important'
				}
			}
		},
		'& .fr-fieldset__element': {
			margin: 0
		},
		'& .fr-checkbox-group': {
			margin: '0!important'
		}
	},
	tagsContainer: {
		display: 'flex',
		alignItems: 'center',
		flexWrap: 'wrap',
		gap: '1rem'
	}
});

export default GenericFilters;
