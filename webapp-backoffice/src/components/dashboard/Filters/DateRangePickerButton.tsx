import { useFilters } from '@/src/contexts/FiltersContext';
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

const dateShortcuts = [
	{ label: '365 derniers jours', name: 'one-year' as const },
	{ label: '30 derniers jours', name: 'one-month' as const },
	{ label: '7 derniers jours', name: 'one-week' as const }
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

	useEffect(() => {
		setLocalStartDate(sharedFilters.currentStartDate);
		setLocalEndDate(sharedFilters.currentEndDate);
	}, [sharedFilters.currentStartDate, sharedFilters.currentEndDate]);

	const isValidDate = (date: string) => {
		if (!date) return false;
		return /^\d{4}-\d{2}-\d{2}$/.test(date);
	};

	const updateDateFilter = useCallback(
		debounce((key: 'currentStartDate' | 'currentEndDate', value: string) => {
			updateFilters({
				...filters,
				currentPage: 1,
				[filterKey]: {
					...filters[filterKey]
				},
				sharedFilters: {
					...filters.sharedFilters,
					[key]: value,
					hasChanged: true,
					dateShortcut: undefined
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
		updateFilters({
			...filters,
			currentPage: 1,
			[filterKey]: {
				...filters[filterKey]
			},
			sharedFilters: {
				...filters.sharedFilters,
				hasChanged: true,
				dateShortcut: shortcutName
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
		const newValue = !filters.productReviews.displayNew;
		updateFilters({
			...filters,
			productReviews: {
				...filters.productReviews,
				displayNew: newValue
			},
			sharedFilters: {
				...filters.sharedFilters,
				hasChanged: true
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

		if (filters.productReviews.displayNew && showNewReviewsOption) {
			return 'Nouvelles réponses';
		}

		if (startDate && endDate && isValidDate(startDate) && isValidDate(endDate)) {
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
								title={`Depuis votre dernière consultation (le ${formatDateToFrenchString(reviewLogDate, { withHour: true })})`}
							>
								Nouvelles réponses
							</button>
						)}
					</div>
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
		padding: fr.spacing('3w'),
		display: 'flex',
		flexDirection: 'column',
		gap: fr.spacing('3v')
	},
	shortcutsRow: {
		display: 'flex',
		flexWrap: 'wrap',
		gap: fr.spacing('2v')
	},
	shortcutButton: {
		...fr.typography[17].style,
		backgroundColor:
			fr.colors.decisions.background.actionLow.blueFrance.default,
		color: fr.colors.decisions.background.actionHigh.blueFrance.default,
		border: 'none',
		borderRadius: '1rem',
		padding: `${fr.spacing('1v')} ${fr.spacing('3v')}`,
		cursor: 'pointer',
		textTransform: 'initial' as const,
		'&:hover': {
			backgroundColor:
				fr.colors.decisions.background.actionLow.blueFrance.hover
		}
	},
	shortcutButtonSelected: {
		backgroundColor: fr.colors.decisions.background.actionLow.blueFrance.hover
	},
	dateInputsRow: {
		display: 'flex',
		gap: fr.spacing('2v'),
		'.fr-input-group': {
			marginBottom: 0
		}
	}
});

export default DateRangePickerButton;
