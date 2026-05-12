import { fr } from '@codegouvfr/react-dsfr';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { fr as frLocale } from 'date-fns/locale/fr';
import { useState, useMemo } from 'react';
import { tss } from 'tss-react/dsfr';
import { addMonths, subMonths, isBefore, isAfter, isSameDay } from 'date-fns';
import Button from '@codegouvfr/react-dsfr/Button';

interface DateRangeCalendarProps {
	rangeStart: Date | null;
	rangeEnd: Date | null;
	onRangeChange: (start: Date | null, end: Date | null) => void;
}

const DateRangeCalendar = ({
	rangeStart,
	rangeEnd,
	onRangeChange
}: DateRangeCalendarProps) => {
	const { classes, cx } = useStyles();

	const today = new Date();
	const [leftMonth, setLeftMonth] = useState<Date>(subMonths(today, 1));

	const rightMonth = addMonths(leftMonth, 1);

	const handleDayClick = (date: Date | null) => {
		if (!date) return;

		if (!rangeStart || (rangeStart && rangeEnd)) {
			onRangeChange(date, null);
		} else {
			if (isBefore(date, rangeStart)) {
				onRangeChange(date, rangeStart);
			} else {
				onRangeChange(rangeStart, date);
			}
		}
	};

	const slotProps = useMemo(
		() => ({
			day: (ownerState: { day: Date }) => {
				const { day } = ownerState;
				const inRange = !!(
					rangeStart &&
					rangeEnd &&
					isAfter(day, rangeStart) &&
					isBefore(day, rangeEnd)
				);
				const edge = !!(
					(rangeStart && isSameDay(day, rangeStart)) ||
					(rangeEnd && isSameDay(day, rangeEnd))
				);

				return {
					sx: {
						fontSize: '0.75rem',
						fontWeight: 700,
						fontFamily: 'Marianne, sans-serif',
						borderRadius: 0,
						...(inRange && {
							backgroundColor: `${fr.colors.decisions.background.actionLow.blueFrance.default} !important`,
							color: `${fr.colors.decisions.background.actionHigh.blueFrance.default} !important`,
							'&:hover': {
								backgroundColor: `${fr.colors.decisions.background.actionLow.blueFrance.hover} !important`
							}
						}),
						...(edge && {
							backgroundColor: `${fr.colors.decisions.background.actionHigh.blueFrance.default} !important`,
							color: 'white !important',
							'&:hover': {
								backgroundColor: `${fr.colors.decisions.background.actionHigh.blueFrance.hover} !important`
							}
						})
					}
				};
			}
		}),
		[rangeStart, rangeEnd]
	);

	const calendarSx = {
		width: '100%',
		height: 'auto',
		'& .MuiPickersCalendarHeader-root': {
			display: 'none'
		},
		'& .MuiDayCalendar-weekDayLabel': {
			fontSize: '0.75rem',
			fontWeight: 700,
			fontFamily: 'Marianne, sans-serif',
			color: fr.colors.decisions.text.mention.grey.default
		},
		'& .MuiPickersDay-root': {
			fontSize: '0.75rem',
			fontWeight: 700,
			fontFamily: 'Marianne, sans-serif',
			borderRadius: 0,
			'&.Mui-selected': {
				backgroundColor: `${fr.colors.decisions.background.actionHigh.blueFrance.default} !important`,
				color: 'white !important'
			}
		},
		'& .MuiPickersDay-dayOutsideMonth': {
			color: fr.colors.decisions.text.disabled.grey.default,
			pointerEvents: 'none'
		},
		'& .MuiDayCalendar-slideTransition': {
			minHeight: 'auto',
			height: 'auto',
			overflow: 'visible'
		},
		'& .MuiPickersSlideTransition-root': {
			minHeight: 'auto',
			height: 'auto',
			overflow: 'visible'
		},
		'& .MuiDayCalendar-monthContainer': {
			position: 'relative'
		}
	};

	return (
		<LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={frLocale}>
			<div className={cx(classes.container)}>
				<div className={cx(classes.calendarsRow)}>
					<div className={cx(classes.calendarSection)}>
						<div className={cx(classes.monthHeader)}>
							<Button
								priority="tertiary"
								size="small"
								iconId="fr-icon-arrow-left-s-line"
								type="button"
								onClick={() => setLeftMonth(subMonths(leftMonth, 1))}
								title="Mois précédent"
							/>
							<span className={cx(classes.monthLabel)}>
								{leftMonth.toLocaleDateString('fr-FR', {
									month: 'long',
									year: 'numeric'
								})}
							</span>
							<span className={cx(classes.navPlaceholder)} />
						</div>
						<DateCalendar
							key={`left-${leftMonth.getFullYear()}-${leftMonth.getMonth()}`}
							value={null}
							onChange={handleDayClick}
							referenceDate={leftMonth}
							maxDate={today}
							showDaysOutsideCurrentMonth
							sx={calendarSx}
							views={['day']}
							slotProps={slotProps}
						/>
					</div>
					<div className={cx(classes.calendarSection)}>
						<div className={cx(classes.monthHeader)}>
							<span className={cx(classes.navPlaceholder)} />
							<span className={cx(classes.monthLabel)}>
								{rightMonth.toLocaleDateString('fr-FR', {
									month: 'long',
									year: 'numeric'
								})}
							</span>
							{rightMonth.getFullYear() < today.getFullYear() ||
							(rightMonth.getFullYear() === today.getFullYear() &&
								rightMonth.getMonth() < today.getMonth()) ? (
								<Button
									priority="tertiary"
									size="small"
									iconId="fr-icon-arrow-right-s-line"
									type="button"
									onClick={() => setLeftMonth(addMonths(leftMonth, 1))}
									title="Mois suivant"
								/>
							) : (
								<span className={cx(classes.navPlaceholder)} />
							)}
						</div>

						<DateCalendar
							key={`right-${rightMonth.getFullYear()}-${rightMonth.getMonth()}`}
							value={null}
							onChange={handleDayClick}
							referenceDate={rightMonth}
							maxDate={today}
							showDaysOutsideCurrentMonth
							sx={calendarSx}
							views={['day']}
							slotProps={slotProps}
						/>
					</div>
				</div>
			</div>
		</LocalizationProvider>
	);
};

const useStyles = tss.create({
	container: {
		display: 'flex',
		flexDirection: 'column',
		gap: fr.spacing('4v')
	},
	calendarsRow: {
		display: 'flex',
		gap: fr.spacing('10v'),
		...fr.spacing('padding', { rightLeft: '3w' })
	},
	calendarSection: {
		flex: 1,
		display: 'flex',
		flexDirection: 'column'
	},
	monthHeader: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between'
	},
	monthLabel: {
		textAlign: 'center' as const,
		flex: 1,
		textTransform: 'capitalize' as const
	},
	navPlaceholder: {
		width: 32,
		height: 32
	}
});

export default DateRangeCalendar;
