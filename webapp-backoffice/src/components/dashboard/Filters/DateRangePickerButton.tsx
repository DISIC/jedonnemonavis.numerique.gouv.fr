import {
	hasAnyFilterChanged,
	initialFilterState,
	useFilters
} from '@/src/contexts/FiltersContext';
import {
	dateToLocalISO,
	formatDateToFrenchString,
	getDatesByShortCut,
	isValidDate,
	parseLocalDate
} from '@/src/utils/tools';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import Input from '@codegouvfr/react-dsfr/Input';
import { Popover } from '@mui/material';
import { push } from '@socialgouv/matomo-next';
import { useEffect, useState } from 'react';
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

	// Pending (local) state — committed only on "Appliquer"
	const [localShortcut, setLocalShortcut] = useState<DateShortcutName>(
		sharedFilters.dateShortcut
	);
	const [localDisplayNew, setLocalDisplayNew] = useState(
		filters.productReviews.displayNew
	);
	const [localStartDate, setLocalStartDate] = useState(
		sharedFilters.currentStartDate
	);
	const [localEndDate, setLocalEndDate] = useState(
		sharedFilters.currentEndDate
	);
	const [calendarRangeStart, setCalendarRangeStart] = useState<Date | null>(
		null
	);
	const [calendarRangeEnd, setCalendarRangeEnd] = useState<Date | null>(null);
	const [errors, setErrors] = useState<{
		startDate?: string;
		endDate?: string;
	}>({});

	// Sync local state from applied filters every time the popover opens.
	useEffect(() => {
		if (!open) return;
		setLocalShortcut(sharedFilters.dateShortcut);
		setLocalDisplayNew(filters.productReviews.displayNew);
		setLocalStartDate(sharedFilters.currentStartDate);
		setLocalEndDate(sharedFilters.currentEndDate);
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
		setLocalStartDate('');
		setLocalEndDate('');
		setCalendarRangeStart(null);
		setCalendarRangeEnd(null);
		setErrors({});
	};

	const handleShortcutClick = (name: DateShortcutName) => {
		setLocalShortcut(name);
		setLocalDisplayNew(false);
		if (name) {
			const { startDate, endDate } = getDatesByShortCut(name);
			setLocalStartDate(startDate);
			setLocalEndDate(endDate);
			setCalendarRangeStart(parseLocalDate(startDate));
			setCalendarRangeEnd(parseLocalDate(endDate));
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
			const start = dateToLocalISO(new Date(reviewLogDate));
			const end = dateToLocalISO(new Date());
			setLocalStartDate(start);
			setLocalEndDate(end);
			setCalendarRangeStart(parseLocalDate(start));
			setCalendarRangeEnd(parseLocalDate(end));
			setErrors({});
		} else {
			clearCustomDates();
		}
	};

	const handleDateChange =
		(key: 'currentStartDate' | 'currentEndDate') =>
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const newDate = e.target.value;
			setLocalShortcut(undefined);
			setLocalDisplayNew(false);

			if (key === 'currentStartDate') {
				setLocalStartDate(newDate);
				const parsed = parseLocalDate(newDate);
				setCalendarRangeStart(parsed);
				if (!parsed) setCalendarRangeEnd(null);
			} else {
				setLocalEndDate(newDate);
				setCalendarRangeEnd(parseLocalDate(newDate));
			}

			if (!isValidDate(newDate) && newDate) {
				setErrors(prev => ({
					...prev,
					[key === 'currentStartDate' ? 'startDate' : 'endDate']:
						'Date invalide'
				}));
			} else {
				setErrors(prev => ({
					...prev,
					[key === 'currentStartDate' ? 'startDate' : 'endDate']: undefined
				}));
			}
		};

	const handleApply = () => {
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
		} else if (calendarRangeStart || localStartDate) {
			const start =
				localStartDate ||
				(calendarRangeStart ? dateToLocalISO(calendarRangeStart) : '');
			const end =
				localEndDate ||
				(calendarRangeEnd ? dateToLocalISO(calendarRangeEnd) : start);
			nextFilters = {
				...nextFilters,
				productReviews: { ...filters.productReviews, displayNew: false },
				sharedFilters: {
					...filters.sharedFilters,
					currentStartDate: start,
					currentEndDate: end,
					dateShortcut: undefined
				}
			};
		} else {
			// Nothing selected — just close
			setAnchorEl(null);
			return;
		}

		updateFilters({
			...nextFilters,
			sharedFilters: {
				...nextFilters.sharedFilters,
				hasChanged: hasAnyFilterChanged(nextFilters)
			}
		});
		setAnchorEl(null);
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
		setAnchorEl(null);
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
				anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
				transformOrigin={{ vertical: 'top', horizontal: 'left' }}
				slotProps={{
					paper: { className: cx(classes.popoverPaper) }
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
									localShortcut === ds.name && !localDisplayNew
										? classes.shortcutButtonSelected
										: undefined
								)}
								onClick={() => handleShortcutClick(ds.name)}
							>
								{ds.label}
								{localShortcut === ds.name && !localDisplayNew && (
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
							setLocalStartDate(start ? dateToLocalISO(start) : '');
							setLocalEndDate(end ? dateToLocalISO(end) : '');
							setLocalShortcut(undefined);
							setLocalDisplayNew(false);
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
		...fr.spacing('padding', { rightLeft: '3w' }),
		'.fr-input-group': {
			marginBottom: 0,
			flex: 1
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
