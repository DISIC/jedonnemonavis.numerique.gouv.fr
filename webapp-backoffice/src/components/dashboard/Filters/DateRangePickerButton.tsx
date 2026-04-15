import { hasAnyFilterChanged, useFilters } from '@/src/contexts/FiltersContext';
import {
	formatDateToFrenchString,
	getDatesByShortCut
} from '@/src/utils/tools';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import Input from '@codegouvfr/react-dsfr/Input';
import { Popover } from '@mui/material';
import { push } from '@socialgouv/matomo-next';
import { debounce } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';
import { tss } from 'tss-react/dsfr';
import { DateShortcutName, FilterSectionKey } from './Filters';
import { FormWithElements } from '@/src/types/prismaTypesExtended';
import DateRangeCalendar from './DateRangeCalendar';

const dateShortcuts = [
	{ label: '1 an', name: 'one-year' as const },
	{ label: '30 jours', name: 'one-month' as const },
	{ label: '7 jours', name: 'one-week' as const }
];

interface DateRangePickerButtonProps {
	filterKey: FilterSectionKey;
	showNewReviewsOption?: boolean;
	reviewLogDate?: string;
	form?: FormWithElements;
	productId?: number;
}

const DateRangePickerButton = ({
	filterKey,
	showNewReviewsOption,
	reviewLogDate,
	form,
	productId
}: DateRangePickerButtonProps) => {
	const { classes, cx } = useStyles();
	const { filters, updateFilters } = useFilters();
	const sharedFilters = filters.sharedFilters;

	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const open = Boolean(anchorEl);

	const [localStartDate, setLocalStartDate] = useState(
		sharedFilters.currentStartDate
	);
	const [localEndDate, setLocalEndDate] = useState(
		sharedFilters.currentEndDate
	);
	const [errors, setErrors] = useState<{
		startDate?: string;
		endDate?: string;
	}>({});

	// Parse a "YYYY-MM-DD" string as a local-time Date (avoid UTC shift).
	const parseLocalDate = (isoStr: string): Date | null => {
		if (!isoStr || !/^\d{4}-\d{2}-\d{2}$/.test(isoStr)) return null;
		const [y, m, d] = isoStr.split('-').map(Number);
		return new Date(y, m - 1, d);
	};

	// Restore calendar range from context when a custom range is active
	// (dateShortcut is undefined with both dates set). This runs on mount
	// so the selection survives page/tab navigation.
	const getInitialCalendarRange = (): [Date | null, Date | null] => {
		if (
			sharedFilters.dateShortcut === undefined &&
			sharedFilters.currentStartDate &&
			sharedFilters.currentEndDate &&
			!filters.productReviews.displayNew
		) {
			return [
				parseLocalDate(sharedFilters.currentStartDate),
				parseLocalDate(sharedFilters.currentEndDate)
			];
		}
		return [null, null];
	};

	const [calendarRangeStart, setCalendarRangeStart] = useState<Date | null>(
		() => getInitialCalendarRange()[0]
	);
	const [calendarRangeEnd, setCalendarRangeEnd] = useState<Date | null>(
		() => getInitialCalendarRange()[1]
	);

	useEffect(() => {
		setLocalStartDate(sharedFilters.currentStartDate);
		setLocalEndDate(sharedFilters.currentEndDate);
	}, [sharedFilters.currentStartDate, sharedFilters.currentEndDate]);

	useEffect(() => {
		if (!sharedFilters.hasChanged) {
			setCalendarRangeStart(null);
			setCalendarRangeEnd(null);
		}
	}, [sharedFilters.hasChanged]);

	const isValidDate = (date: string) => {
		if (!date) return false;
		return /^\d{4}-\d{2}-\d{2}$/.test(date);
	};

	const updateDateFilter = useCallback(
		debounce((key: 'currentStartDate' | 'currentEndDate', value: string) => {
			const nextFilters: typeof filters = {
				...filters,
				currentPage: 1,
				[filterKey]: {
					...filters[filterKey]
				},
				productReviews: {
					...filters.productReviews,
					displayNew: false
				},
				sharedFilters: {
					...filters.sharedFilters,
					[key]: value,
					dateShortcut: undefined
				}
			};
			updateFilters({
				...nextFilters,
				sharedFilters: {
					...nextFilters.sharedFilters,
					hasChanged: hasAnyFilterChanged(nextFilters)
				}
			});
		}, 1000),
		[updateFilters, filterKey, filters]
	);

	const handleDateChange =
		(key: 'currentStartDate' | 'currentEndDate') =>
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const newDate = e.target.value;

			if (key === 'currentStartDate') {
				setLocalStartDate(newDate);
			} else {
				setLocalEndDate(newDate);
			}

			if (!isValidDate(newDate)) {
				setErrors(prev => ({
					...prev,
					[key === 'currentStartDate' ? 'startDate' : 'endDate']:
						'Format attendu : JJ/MM/AAAA'
				}));
			} else {
				setErrors(prev => ({
					...prev,
					[key === 'currentStartDate' ? 'startDate' : 'endDate']: undefined
				}));
				updateDateFilter(key, newDate);
			}
		};

	const handleShortcutClick = (shortcutName: DateShortcutName) => {
		setCalendarRangeStart(null);
		setCalendarRangeEnd(null);
		const nextFilters: typeof filters = {
			...filters,
			currentPage: 1,
			[filterKey]: {
				...filters[filterKey]
			},
			productReviews: {
				...filters.productReviews,
				displayNew: false
			},
			sharedFilters: {
				...filters.sharedFilters,
				currentStartDate: '',
				currentEndDate: '',
				dateShortcut: shortcutName
			}
		};
		updateFilters({
			...nextFilters,
			sharedFilters: {
				...nextFilters.sharedFilters,
				hasChanged: hasAnyFilterChanged(nextFilters)
			}
		});

		const shortcutLabel =
			dateShortcuts.find(ds => ds.name === shortcutName)?.label || '';
		push(['trackEvent', 'Logs', `Filtre-Date-${shortcutLabel}`]);
		window._mtm?.push({
			event: 'matomo_event',
			container_type: 'backoffice',
			service_id: form?.product_id || productId || 0,
			form_id: form?.id || 0,
			template_slug: form?.form_template.slug || '',
			category: 'reviews',
			action_type: 'filter',
			action: `${shortcutLabel.split(' ')[0]}_days_filter_apply`,
			ui_source: 'quick_filter'
		});
	};

	const handleNewReviewsClick = () => {
		setCalendarRangeStart(null);
		setCalendarRangeEnd(null);
		const newValue = !filters.productReviews.displayNew;
		const today = new Date().toISOString().split('T')[0];
		const startDate = reviewLogDate
			? new Date(reviewLogDate).toISOString().split('T')[0]
			: today;

		const nextFilters: typeof filters = {
			...filters,
			currentPage: 1,
			productReviews: {
				...filters.productReviews,
				displayNew: newValue
			},
			sharedFilters: {
				...filters.sharedFilters,
				...(newValue
					? {
							currentStartDate: startDate,
							currentEndDate: today,
							dateShortcut: undefined
					  }
					: {
							currentStartDate: '',
							currentEndDate: '',
							dateShortcut: 'one-year'
					  })
			}
		};

		updateFilters({
			...nextFilters,
			sharedFilters: {
				...nextFilters.sharedFilters,
				hasChanged: hasAnyFilterChanged(nextFilters)
			}
		});

		window._mtm?.push({
			event: 'matomo_event',
			container_type: 'backoffice',
			service_id: form?.product_id || productId || 0,
			form_id: form?.id || 0,
			template_slug: form?.form_template.slug || '',
			category: 'reviews',
			action_type: 'read',
			action: 'only_new_review_apply',
			ui_source: 'quick_filter',
			value: newValue
		});
	};

	const getButtonLabel = () => {
		const startDate = sharedFilters.currentStartDate;
		const endDate = sharedFilters.currentEndDate;

		if (
			filters.productReviews.displayNew &&
			showNewReviewsOption &&
			reviewLogDate
		) {
			const today = new Date().toISOString().split('T')[0];
			return `${formatDateToFrenchString(reviewLogDate, {
				monthFormat: 'literal'
			})} - ${formatDateToFrenchString(today, {
				monthFormat: 'literal'
			})}`;
		}

		if (
			startDate &&
			endDate &&
			isValidDate(startDate) &&
			isValidDate(endDate)
		) {
			return `${formatDateToFrenchString(startDate, {
				monthFormat: 'literal'
			})} - ${formatDateToFrenchString(endDate, {
				monthFormat: 'literal'
			})}`;
		}

		if (sharedFilters.dateShortcut) {
			const { startDate: sDate, endDate: eDate } = getDatesByShortCut(
				sharedFilters.dateShortcut
			);
			return `${formatDateToFrenchString(sDate, {
				monthFormat: 'literal'
			})} - ${formatDateToFrenchString(eDate, {
				monthFormat: 'literal'
			})}`;
		}

		return 'Sélectionner une période';
	};

	return (
		<>
			<Button
				className={cx(classes.filterButton)}
				priority="tertiary"
				iconId="ri-calendar-event-fill"
				iconPosition="right"
				type="button"
				nativeButtonProps={{
					onClick: (e: React.MouseEvent<HTMLElement>) => {
						setAnchorEl(e.currentTarget);
					}
				}}
			>
				{getButtonLabel()}
			</Button>
			<Popover
				open={open}
				anchorEl={anchorEl}
				onClose={() => setAnchorEl(null)}
				disableScrollLock
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'left'
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'left'
				}}
				slotProps={{
					paper: {
						className: cx(classes.popoverPaper)
					}
				}}
			>
				<div className={cx(classes.popoverContent)}>
					<div className={cx(classes.dateInputsRow)}>
						<Input
							label="Date de début"
							nativeInputProps={{
								type: 'date',
								value: localStartDate,
								onChange: handleDateChange('currentStartDate')
							}}
							state={errors.startDate ? 'error' : 'default'}
							stateRelatedMessage={
								errors.startDate ? (
									<span role="alert">{errors.startDate}</span>
								) : null
							}
						/>
						<Input
							label="Date de fin"
							nativeInputProps={{
								type: 'date',
								value: localEndDate,
								onChange: handleDateChange('currentEndDate')
							}}
							state={errors.endDate ? 'error' : 'default'}
							stateRelatedMessage={
								errors.endDate ? (
									<span role="alert">{errors.endDate}</span>
								) : null
							}
						/>
					</div>

					<div className={cx(classes.shortcutsRow)}>
						{dateShortcuts.map(ds => (
							<button
								key={ds.name}
								type="button"
								className={cx(
									classes.shortcutButton,
									sharedFilters.dateShortcut === ds.name &&
										!filters.productReviews.displayNew
										? classes.shortcutButtonSelected
										: undefined
								)}
								onClick={() => handleShortcutClick(ds.name)}
							>
								{ds.label}
								{sharedFilters.dateShortcut === ds.name &&
									!filters.productReviews.displayNew && (
										<span
											className={cx(
												classes.selectedIcon,
												fr.cx('fr-icon-checkbox-circle-line', 'fr-icon--sm')
											)}
										/>
									)}
							</button>
						))}
						{showNewReviewsOption && reviewLogDate && (
							<button
								type="button"
								className={cx(
									classes.shortcutButton,
									filters.productReviews.displayNew
										? classes.shortcutButtonSelected
										: undefined
								)}
								onClick={handleNewReviewsClick}
								title={`Depuis votre dernière consultation (le ${formatDateToFrenchString(
									reviewLogDate,
									{ withHour: true }
								)})`}
							>
								Nouvelles réponses (du {formatDateToFrenchString(reviewLogDate)}{' '}
								à aujourd'hui)
								{filters.productReviews.displayNew && (
									<span
										className={cx(
											classes.selectedIcon,
											fr.cx('fr-icon-checkbox-circle-line', 'fr-icon--sm')
										)}
									/>
								)}
							</button>
						)}
					</div>
					<hr className={cx(classes.separator)} />
					<DateRangeCalendar
						rangeStart={calendarRangeStart}
						rangeEnd={calendarRangeEnd}
						onRangeChange={(start, end) => {
							setCalendarRangeStart(start);
							setCalendarRangeEnd(end);
						}}
						onApply={(start, end) => {
							setLocalStartDate(start);
							setLocalEndDate(end);
							const nextFilters: typeof filters = {
								...filters,
								currentPage: 1,
								[filterKey]: {
									...filters[filterKey]
								},
								productReviews: {
									...filters.productReviews,
									displayNew: false
								},
								sharedFilters: {
									...filters.sharedFilters,
									currentStartDate: start,
									currentEndDate: end,
									dateShortcut: undefined
								}
							};
							updateFilters({
								...nextFilters,
								sharedFilters: {
									...nextFilters.sharedFilters,
									hasChanged: hasAnyFilterChanged(nextFilters)
								}
							});
							setAnchorEl(null);
						}}
						onClear={() => {
							setCalendarRangeStart(null);
							setCalendarRangeEnd(null);

							const nextFilters: typeof filters = {
								...filters,
								currentPage: 1,
								[filterKey]: {
									...filters[filterKey]
								},
								productReviews: {
									...filters.productReviews,
									displayNew: false
								},
								sharedFilters: {
									...filters.sharedFilters,
									currentStartDate: '',
									currentEndDate: '',
									dateShortcut: 'one-year'
								}
							};

							updateFilters({
								...nextFilters,
								sharedFilters: {
									...nextFilters.sharedFilters,
									hasChanged: hasAnyFilterChanged(nextFilters)
								}
							});
						}}
					/>
				</div>
			</Popover>
		</>
	);
};

const useStyles = tss.create({
	filterButton: {
		border: '1px solid #DDDDDD'
	},
	popoverPaper: {
		marginTop: fr.spacing('1v'),
		borderRadius: 0,
		boxShadow: '0px 4px 12px rgba(0, 0, 18, 0.16)'
	},
	popoverContent: {
		...fr.spacing('padding', { topBottom: '3w' }),
		display: 'flex',
		flexDirection: 'column'
	},
	dateInputsRow: {
		display: 'flex',
		gap: fr.spacing('6v'),
		marginBottom: fr.spacing('4v'),
		...fr.spacing('padding', { rightLeft: '3w' }),
		'.fr-input-group': {
			marginBottom: 0,
			flex: 1
		}
	},
	separator: {
		paddingBottom: fr.spacing('4v')
	},
	shortcutsRow: {
		display: 'flex',
		flexWrap: 'wrap',
		gap: fr.spacing('2v'),
		...fr.spacing('padding', { rightLeft: '3w', bottom: '2w' })
	},
	shortcutButton: {
		position: 'relative',
		fontSize: '0.75rem !important',
		lineHeight: '1.25rem !important',
		backgroundColor:
			fr.colors.decisions.background.actionLow.blueFrance.default,
		color: fr.colors.decisions.background.actionHigh.blueFrance.default,
		border: 'none',
		borderRadius: '1rem',
		padding: `${fr.spacing('1v')} ${fr.spacing('3v')}`,
		cursor: 'pointer',
		textTransform: 'initial' as const,
		'&:hover': {
			backgroundColor: `${fr.colors.decisions.background.actionLow.blueFrance.hover}!important`
		}
	},
	shortcutButtonSelected: {
		backgroundColor:
			fr.colors.decisions.background.actionHigh.blueFrance.default,
		color: 'white',
		'&:hover': {
			backgroundColor: `${fr.colors.decisions.background.actionHigh.blueFrance.hover}!important`
		}
	},
	selectedIcon: {
		position: 'absolute',
		top: -4,
		right: -4,
		display: 'flex',
		borderRadius: '200em',
		height: '1rem',
		width: '1rem',
		backgroundColor: 'white',
		color: fr.colors.decisions.background.actionHigh.blueFrance.default
	}
});

export default DateRangePickerButton;
