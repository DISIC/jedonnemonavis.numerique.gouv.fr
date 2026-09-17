import {
	hasAnyFilterChanged,
	initialFilterState,
	useFilters
} from '@/src/contexts/FiltersContext';
import {
	DateRangeErrors,
	dateToLocalISO,
	formatDateToFrenchString,
	getDateRangeErrors,
	getDatesByShortCut,
	INVALID_DATE_ERROR,
	isValidDate,
	parseLocalDate,
	startOfLocalDay
} from '@/src/utils/tools';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { Popover } from '@mui/material';
import { DateField } from '@mui/x-date-pickers/DateField';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { fr as frLocale } from 'date-fns/locale/fr';
import { push } from '@socialgouv/matomo-next';
import { useEffect, useRef, useState } from 'react';
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
	const today = new Date();

	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const open = Boolean(anchorEl);
	const triggerRef = useRef<HTMLButtonElement | null>(null);

	const handleClose = () => {
		setAnchorEl(null);
	};

	// Pending (local) state — committed only on "Appliquer"
	const [localShortcut, setLocalShortcut] = useState<DateShortcutName>(
		sharedFilters.dateShortcut
	);
	const [localDisplayNew, setLocalDisplayNew] = useState(
		filters.productReviews.displayNew
	);
	const [localStartDate, setLocalStartDate] = useState<Date | null>(
		parseLocalDate(sharedFilters.currentStartDate)
	);
	const [localEndDate, setLocalEndDate] = useState<Date | null>(
		parseLocalDate(sharedFilters.currentEndDate)
	);
	const [calendarRangeStart, setCalendarRangeStart] = useState<Date | null>(
		null
	);
	const [calendarRangeEnd, setCalendarRangeEnd] = useState<Date | null>(null);
	const [errors, setErrors] = useState<DateRangeErrors>({});

	// Sync local state from applied filters every time the popover opens.
	useEffect(() => {
		if (!open) return;
		setLocalShortcut(sharedFilters.dateShortcut);
		setLocalDisplayNew(filters.productReviews.displayNew);
		setLocalStartDate(parseLocalDate(sharedFilters.currentStartDate));
		setLocalEndDate(parseLocalDate(sharedFilters.currentEndDate));
		if (
			sharedFilters.currentStartDate &&
			sharedFilters.currentEndDate &&
			!filters.productReviews.displayNew &&
			sharedFilters.dateShortcut !==
				initialFilterState.sharedFilters.dateShortcut
		) {
			setCalendarRangeStart(parseLocalDate(sharedFilters.currentStartDate));
			setCalendarRangeEnd(parseLocalDate(sharedFilters.currentEndDate));
		} else {
			setCalendarRangeStart(null);
			setCalendarRangeEnd(null);
		}
		setErrors({});
	}, [open]); // eslint-disable-line react-hooks/exhaustive-deps

	const clearCustomDates = () => {
		setLocalStartDate(null);
		setLocalEndDate(null);
		setCalendarRangeStart(null);
		setCalendarRangeEnd(null);
		setErrors({});
	};

	const handleShortcutClick = (name: DateShortcutName) => {
		setLocalShortcut(name);
		setLocalDisplayNew(false);
		if (name) {
			const { startDate, endDate } = getDatesByShortCut(name);
			const start = parseLocalDate(startDate);
			const end = parseLocalDate(endDate);
			setLocalStartDate(start);
			setLocalEndDate(end);
			setCalendarRangeStart(start);
			setCalendarRangeEnd(end);
			setErrors({});
		} else {
			clearCustomDates();
		}
	};

	const handleNewReviewsClick = () => {
		const next = !localDisplayNew;
		setLocalDisplayNew(next);
		setLocalShortcut(undefined);
		if (next && reviewLogDate) {
			const start = startOfLocalDay(new Date(reviewLogDate));
			const end = startOfLocalDay(new Date());
			setLocalStartDate(start);
			setLocalEndDate(end);
			setCalendarRangeStart(start);
			setCalendarRangeEnd(end);
			setErrors({});
		} else {
			clearCustomDates();
		}
	};

	const handleDateFieldChange =
		(key: 'currentStartDate' | 'currentEndDate') => (value: Date | null) => {
			const errorKey = key === 'currentStartDate' ? 'startDate' : 'endDate';
			const otherErrorKey = errorKey === 'startDate' ? 'endDate' : 'startDate';

			if (value !== null && isNaN(value.getTime())) {
				setErrors(prev => ({ ...prev, [errorKey]: INVALID_DATE_ERROR }));
				return;
			}

			setLocalShortcut(undefined);
			setLocalDisplayNew(false);

			if (key === 'currentStartDate') {
				setLocalStartDate(value);
				setCalendarRangeStart(value);
			} else {
				setLocalEndDate(value);
				setCalendarRangeEnd(value);
			}

			setErrors(prev => ({
				[errorKey]: undefined,
				[otherErrorKey]:
					prev[otherErrorKey] === INVALID_DATE_ERROR
						? INVALID_DATE_ERROR
						: undefined
			}));
		};

	const handleApply = () => {
		if (
			errors.startDate === INVALID_DATE_ERROR ||
			errors.endDate === INVALID_DATE_ERROR
		) {
			return;
		}

		let nextFilters: typeof filters = {
			...filters,
			currentPage: 1,
			[filterKey]: { ...filters[filterKey] }
		};

		if (localDisplayNew && showNewReviewsOption && reviewLogDate) {
			const today = dateToLocalISO(new Date());
			const startDate = dateToLocalISO(new Date(reviewLogDate));
			nextFilters = {
				...nextFilters,
				productReviews: { ...filters.productReviews, displayNew: true },
				sharedFilters: {
					...filters.sharedFilters,
					currentStartDate: startDate,
					currentEndDate: today,
					dateShortcut: undefined
				}
			};
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
				value: true
			});
		} else if (localShortcut) {
			const { startDate: shortcutStart, endDate: shortcutEnd } =
				getDatesByShortCut(localShortcut);
			nextFilters = {
				...nextFilters,
				productReviews: { ...filters.productReviews, displayNew: false },
				sharedFilters: {
					...filters.sharedFilters,
					currentStartDate: shortcutStart,
					currentEndDate: shortcutEnd,
					dateShortcut: localShortcut
				}
			};
			const shortcutLabel =
				dateShortcuts.find(ds => ds.name === localShortcut)?.label || '';
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
		} else if (calendarRangeStart || localStartDate || localEndDate) {
			const start = localStartDate ?? calendarRangeStart;
			const end = localEndDate ?? calendarRangeEnd ?? start;

			const rangeErrors = getDateRangeErrors(start, end, new Date());
			if (!start || !end || rangeErrors.startDate || rangeErrors.endDate) {
				setErrors(rangeErrors);
				return;
			}

			nextFilters = {
				...nextFilters,
				productReviews: { ...filters.productReviews, displayNew: false },
				sharedFilters: {
					...filters.sharedFilters,
					currentStartDate: dateToLocalISO(start),
					currentEndDate: dateToLocalISO(end),
					dateShortcut: undefined
				}
			};
		} else {
			// Nothing selected — just close
			handleClose();
			return;
		}

		updateFilters({
			...nextFilters,
			sharedFilters: {
				...nextFilters.sharedFilters,
				hasChanged: hasAnyFilterChanged(nextFilters)
			}
		});
		handleClose();
	};

	const handleClear = () => {
		const nextFilters: typeof filters = {
			...filters,
			currentPage: 1,
			[filterKey]: { ...filters[filterKey] },
			productReviews: { ...filters.productReviews, displayNew: false },
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
		handleClose();
	};

	const getButtonLabel = () => {
		const startDate = sharedFilters.currentStartDate;
		const endDate = sharedFilters.currentEndDate;

		if (
			filters.productReviews.displayNew &&
			showNewReviewsOption &&
			reviewLogDate
		) {
			const today = dateToLocalISO(new Date());
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
				className={cx(classes.filterButton, open && classes.filterButtonActive)}
				priority="tertiary"
				iconId="ri-calendar-event-fill"
				iconPosition="right"
				type="button"
				nativeButtonProps={{
					ref: triggerRef,
					onClick: (e: React.MouseEvent<HTMLElement>) => {
						setAnchorEl(e.currentTarget);
					},
					'aria-haspopup': 'dialog',
					'aria-expanded': open ? 'true' : 'false',
					'aria-controls': open ? 'date-range-dialog' : undefined
				}}
			>
				{getButtonLabel()}
			</Button>
			<Popover
				open={open}
				anchorEl={anchorEl}
				onClose={handleClose}
				disableScrollLock
				disableRestoreFocus
				anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
				transformOrigin={{ vertical: 'top', horizontal: 'left' }}
				TransitionProps={{
					onEntered: () => {
						const firstInput = document.querySelector<HTMLElement>(
							'#date-range-dialog input'
						);
						firstInput?.focus();
					},
					onExited: () => triggerRef.current?.focus()
				}}
				slotProps={{
					paper: { className: cx(classes.popoverPaper) }
				}}
			>
				<div
					id="date-range-dialog"
					role="dialog"
					aria-modal="true"
					aria-label="Sélectionner une période"
					className={cx(classes.popoverContent)}
				>
					<LocalizationProvider
						dateAdapter={AdapterDateFns}
						adapterLocale={frLocale}
					>
						<div className={cx(classes.dateInputsRow)}>
							<div
								className={cx(
									fr.cx(
										'fr-input-group',
										errors.startDate ? 'fr-input-group--error' : undefined
									),
									classes.dateFieldGroup
								)}
							>
								<label id="date-debut-label" className={fr.cx('fr-label')}>
									Date de début
								</label>
								<DateField
									aria-labelledby="date-debut-label"
									aria-describedby={
										errors.startDate ? 'date-debut-error' : undefined
									}
									value={localStartDate}
									onChange={handleDateFieldChange('currentStartDate')}
									maxDate={today}
									format="dd / MM / yyyy"
									className={fr.cx('fr-input')}
									sx={{ width: '100%' }}
									slotProps={{
										textField: {
											InputProps: { className: fr.cx('fr-input') },
											sx: {
												'& .MuiFormLabel-root': { display: 'none' },
												'& fieldset': { display: 'none' }
											}
										}
									}}
								/>
								{errors.startDate && (
									<p id="date-debut-error" className={fr.cx('fr-error-text')}>
										{errors.startDate}
									</p>
								)}
							</div>
							<div
								className={cx(
									fr.cx(
										'fr-input-group',
										errors.endDate ? 'fr-input-group--error' : undefined
									),
									classes.dateFieldGroup
								)}
							>
								<label id="date-fin-label" className={fr.cx('fr-label')}>
									Date de fin
								</label>
								<DateField
									aria-labelledby="date-fin-label"
									aria-describedby={
										errors.endDate ? 'date-fin-error' : undefined
									}
									value={localEndDate}
									onChange={handleDateFieldChange('currentEndDate')}
									maxDate={today}
									format="dd / MM / yyyy"
									className={fr.cx('fr-input')}
									sx={{ width: '100%' }}
									slotProps={{
										textField: {
											variant: 'outlined',
											InputProps: { className: fr.cx('fr-input') },
											sx: {
												'& .MuiFormLabel-root': { display: 'none' },
												'& fieldset': { display: 'none' }
											}
										}
									}}
								/>
								{errors.endDate && (
									<p id="date-fin-error" className={fr.cx('fr-error-text')}>
										{errors.endDate}
									</p>
								)}
							</div>
						</div>
					</LocalizationProvider>

					<div className={cx(classes.shortcutsRow)}>
						{dateShortcuts.map(ds => {
							const isSelected = localShortcut === ds.name && !localDisplayNew;
							return (
								<button
									key={ds.name}
									type="button"
									aria-pressed={isSelected}
									className={cx(
										classes.shortcutButton,
										isSelected ? classes.shortcutButtonSelected : undefined
									)}
									onClick={() => handleShortcutClick(ds.name)}
								>
									{ds.label}
									{isSelected && (
										<span
											aria-hidden="true"
											className={cx(
												classes.selectedIcon,
												fr.cx('fr-icon-checkbox-circle-line', 'fr-icon--sm')
											)}
										/>
									)}
								</button>
							);
						})}
						{showNewReviewsOption && reviewLogDate && (
							<button
								type="button"
								aria-pressed={localDisplayNew}
								className={cx(
									classes.shortcutButton,
									localDisplayNew ? classes.shortcutButtonSelected : undefined
								)}
								onClick={handleNewReviewsClick}
								title={`Depuis votre dernière consultation (le ${formatDateToFrenchString(
									reviewLogDate,
									{ withHour: true }
								)})`}
							>
								Nouvelles réponses (du {formatDateToFrenchString(reviewLogDate)}{' '}
								à aujourd'hui)
								{localDisplayNew && (
									<span
										aria-hidden="true"
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
							setLocalStartDate(start);
							setLocalEndDate(end);
							setLocalShortcut(undefined);
							setLocalDisplayNew(false);
							setErrors({});
						}}
					/>
					<div className={cx(classes.actionsRow)}>
						<Button
							priority="tertiary"
							size="small"
							type="button"
							onClick={handleClear}
						>
							Effacer
						</Button>
						<Button
							priority="primary"
							size="small"
							type="button"
							onClick={handleApply}
						>
							Appliquer
						</Button>
					</div>
				</div>
			</Popover>
		</>
	);
};

const useStyles = tss.create({
	filterButton: {
		border: `1px solid ${fr.colors.decisions.border.default.grey.default}`
	},
	filterButtonActive: {
		backgroundColor: `${fr.colors.decisions.background.actionLow.blueFrance.default} !important`
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
		...fr.spacing('padding', { rightLeft: '3w' })
	},
	dateFieldGroup: {
		flex: 1,
		marginBottom: '0!important',
		// DSFR fr-input:focus doesn't fire on a div — replicate it via Mui-focused
		'& .fr-input.Mui-focused': {
			outlineWidth: '2px',
			outlineStyle: 'solid',
			outlineColor: fr.colors.decisions.border.active.blueFrance.default,
			outlineOffset: '2px'
		},
		// Restore flex display overridden by fr-input's display:block
		'& .fr-input.MuiInputBase-root': {
			display: 'flex',
			alignItems: 'center',
			borderRadius: '0.25rem 0.25rem 0 0',
			input: {
				padding: 0,
				paddingLeft: fr.spacing('1v')
			}
		}
	},
	separator: {
		paddingBottom: fr.spacing('4v'),
		...fr.spacing('margin', { rightLeft: '6v' })
	},
	shortcutsRow: {
		display: 'flex',
		flexWrap: 'wrap',
		gap: fr.spacing('2v'),
		...fr.spacing('padding', { rightLeft: '3w', bottom: '2w' })
	},
	actionsRow: {
		display: 'flex',
		justifyContent: 'flex-end',
		gap: fr.spacing('4v'),
		...fr.spacing('padding', { rightLeft: '3w', top: '3w' })
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
