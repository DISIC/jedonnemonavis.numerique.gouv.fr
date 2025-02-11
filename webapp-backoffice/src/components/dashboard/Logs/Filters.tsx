import { Filters, useFilters } from '@/src/contexts/FiltersContext';
import { filtersLabel, getDatesByShortCut } from '@/src/utils/tools';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import Input from '@codegouvfr/react-dsfr/Input';
import Select from '@codegouvfr/react-dsfr/Select';
import Tag from '@codegouvfr/react-dsfr/Tag';
import { Autocomplete } from '@mui/material';
import { TypeAction } from '@prisma/client';
import { push } from '@socialgouv/matomo-next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { tss } from 'tss-react/dsfr';

type FiltersProps = {
	onChange: (startDate: string, endDate: string, buttonId?: number) => void;
	currentStartDate: string;
	currentEndDate: string;
	updateFilters: (filters: Filters) => void;
	filters: Filters;
};

type FormErrors = {
	startDate: boolean;
	endDate: boolean;
};

const defaultErrors = {
	startDate: false,
	endDate: false
};

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
];

const ActivityFilters = ({
	onChange,
	currentStartDate,
	currentEndDate,
	updateFilters,
	filters
}: FiltersProps) => {
	const { classes, cx } = useStyles();

	const [startDate, setStartDate] = useState<string>(currentStartDate);
	const [errors, setErrors] = useState<FormErrors>(defaultErrors);
	const [endDate, setEndDate] = useState<string>(currentEndDate);
	const [buttonId, setButtonId] = useState<number | undefined>();
	const [shortcutDateSelected, setShortcutDateSelected] = useState<
		(typeof dateShortcuts)[number]['name'] | undefined
	>('one-year');
	const [inputValue, setInputValue] = useState<string | undefined>(
		filters.filterAction ? filters.filterAction : undefined
	);
	const [actionsFilter, setActionsFilter] = useState<string[]>([]);
	const [filterHasChanged, setFilterHasChanged] = useState(false);
	const [filtersApplied, setFiltersApplied] = useState(false);

	useEffect(() => {
		if (shortcutDateSelected) {
			const dates = getDatesByShortCut(shortcutDateSelected);

			if (dates.startDate !== startDate) {
				setStartDate(dates.startDate);
			}
			if (dates.endDate !== endDate) {
				setEndDate(dates.endDate);
			}

			if (
				dates.startDate !== currentStartDate ||
				dates.endDate !== currentEndDate
			)
				onChange(dates.startDate, dates.endDate, buttonId);
		}
	}, [shortcutDateSelected]);

	const validateDateFormat = (date: string) => {
		const regex = /^\d{4}-\d{2}-\d{2}$/;
		return regex.test(date);
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

		if (inputValue) {
			updateFilters({
				...filters,
				filterAction: inputValue as TypeAction
			});
		}

		if (startDateValid && endDateValid) {
			if (startDate !== currentStartDate || endDate !== currentEndDate) {
				onChange(startDate, endDate, buttonId);
			}
		}

		setFiltersApplied(true);
	};

	return (
		<div
			className={cx(
				fr.cx('fr-grid-row', 'fr-grid-row--gutters'),
				classes.dateShortcuts
			)}
		>
			<div className={fr.cx('fr-col', 'fr-col-6')}>
				<fieldset id="date-filters" className={fr.cx('fr-fieldset')}>
					<legend className={fr.cx('fr-label')}>Filtres rapides</legend>
					<ul>
						{dateShortcuts.map(ds => (
							<li key={ds.name}>
								<input
									id={`radio-${ds.name}`}
									type="radio"
									name={ds.name}
									checked={shortcutDateSelected === ds.name}
									onChange={() => {
										setShortcutDateSelected(ds.name);
										setFilterHasChanged(true);
										push(['trackEvent', 'Logs', 'Filtre-Date']);
									}}
								/>
								<label
									className={cx(
										fr.cx('fr-tag', 'fr-mt-2v'),

										classes.dateShortcutTag,
										shortcutDateSelected === ds.name
											? classes.dateShortcutTagSelected
											: undefined
									)}
									htmlFor={`radio-${ds.name}`}
									tabIndex={0}
									onKeyDown={e => {
										if (e.key === 'Enter' || e.key === ' ') {
											setShortcutDateSelected(ds.name);
											setFilterHasChanged(true);
											push(['trackEvent', 'Logs', 'Filtre-Date']);
										}
									}}
								>
									{ds.label}
								</label>
							</li>
						))}
					</ul>
				</fieldset>
			</div>
			<div className={fr.cx('fr-col', 'fr-col-6')}>
				<form
					className={cx(fr.cx('fr-grid-row'), classes.formContainer)}
					onSubmit={e => {
						e.preventDefault();
						submit();
						push(['trackEvent', 'Logs', 'Filtre-Date']);
					}}
				>
					<div className={fr.cx('fr-col', 'fr-col-5')}>
						<Input
							label="Date de début"
							nativeInputProps={{
								type: 'date',
								value: startDate,
								onChange: e => {
									setShortcutDateSelected(undefined);
									setStartDate(e.target.value);
									setFilterHasChanged(true);
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
					<div className={fr.cx('fr-col', 'fr-col-5')}>
						<Input
							label="Date de fin"
							nativeInputProps={{
								type: 'date',
								value: endDate,
								onChange: e => {
									setShortcutDateSelected(undefined);
									setEndDate(e.target.value);
									setFilterHasChanged(true);
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
					<div className={fr.cx('fr-col', 'fr-col-2')}>
						<div className={cx(classes.applyContainer)}>
							<Button
								type="submit"
								iconId="ri-search-2-line"
								title="Appliquer le changement de dates"
							>
								<span className={fr.cx('fr-sr-only')}>
									Appliquer le changement de dates
								</span>
							</Button>
						</div>
					</div>
				</form>
			</div>
			<div className={fr.cx('fr-col-12', 'fr-col-md-6', 'fr-mb-4v')}>
				<Autocomplete
					id="filter-action"
					disablePortal
					sx={{ width: '100%' }}
					options={filtersLabel}
					onChange={(_, option) => {
						if (option) {
							setInputValue(option.value as TypeAction);
							setFilterHasChanged(true);
							setActionsFilter([...actionsFilter, option.value]);
						}
					}}
					inputValue={inputValue}
					value={
						inputValue
							? {
									label: filtersLabel.find(f => f.value === inputValue)?.label,
									value: inputValue
								}
							: undefined
					}
					onInputChange={(_, newInputValue) => {
						setInputValue(newInputValue);
					}}
					renderInput={params => (
						<div ref={params.InputProps.ref}>
							<label htmlFor="filter-action" className="fr-label">
								Filtrer par action
							</label>
							<input
								{...params.inputProps}
								className={params.inputProps.className + ' fr-input'}
								placeholder="Toutes les actions"
								type="search"
							/>
						</div>
					)}
				/>
			</div>
			{filterHasChanged ? (
				<div
					className={cx(
						fr.cx('fr-col-12', 'fr-col-md-6', 'fr-mt-8v'),
						classes.filterActionContainer
					)}
				>
					<Button
						priority="tertiary no outline"
						iconPosition="right"
						iconId="ri-refresh-line"
						onClick={() => {
							setShortcutDateSelected('one-year');
							setStartDate(currentStartDate);
							setEndDate(currentEndDate);
							setInputValue(undefined);
							updateFilters({
								...filters,
								filterAction: undefined
							});
							setFiltersApplied(false);
						}}
					>
						Réinitialiser les filtres
					</Button>
					<Button priority="primary" disabled={filtersApplied} onClick={submit}>
						{filtersApplied ? 'Filtres appliqués' : 'Appliquer les filtres'}
					</Button>
				</div>
			) : null}
			{actionsFilter.length > 0 && (
				<ul
					className={cx(
						fr.cx('fr-col-12', 'fr-col-md-12', 'fr-my-1w'),
						classes.tagContainer
					)}
				>
					{actionsFilter.map((action, index) => (
						<li key={index}>
							<Tag
								dismissible
								className={cx(classes.tagFilter)}
								title={`Retirer ${filtersLabel.find(f => f.value === action)?.label}`}
								nativeButtonProps={{
									onClick: () => {
										setActionsFilter(actionsFilter.filter(e => e !== action));
										setInputValue('');
									}
								}}
							>
								<p>{filtersLabel.find(f => f.value === action)?.label}</p>
							</Tag>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

const useStyles = tss.create({
	dateShortcuts: {
		position: 'sticky',
		top: -1,
		backgroundColor: fr.colors.decisions.background.default.grey.default,
		zIndex: 99,
		padding: `1rem 0`,
		fieldset: {
			width: '100%',
			margin: 0,
			ul: {
				listStyle: 'none',
				...fr.spacing('margin', { topBottom: 0, rightLeft: 0 }),
				paddingLeft: 0,
				width: '100%',
				li: {
					display: 'inline',
					marginRight: fr.spacing('2v'),
					input: {
						display: 'none'
					}
				}
			}
		}
	},
	dateShortcutTag: {
		...fr.typography[17].style,
		backgroundColor:
			fr.colors.decisions.background.actionLow.blueFrance.default,
		color: fr.colors.decisions.background.actionHigh.blueFrance.default,
		textTransform: 'initial',
		'&:hover': {
			backgroundColor: fr.colors.decisions.background.actionLow.blueFrance.hover
		}
	},
	dateShortcutTagSelected: {
		backgroundColor: fr.colors.decisions.background.actionLow.blueFrance.hover
	},
	applyContainer: {
		paddingTop: fr.spacing('8v'),
		".fr-btn--icon-left[class*=' ri-']::before": {
			'--icon-size': '1.5rem',
			marginRight: 0
		}
	},
	formContainer: {
		marginLeft: '-0.4rem',
		marginRight: '-0.4rem',
		'& > div': {
			paddingLeft: '0.4rem',
			paddingRight: '0.4rem'
		}
	},
	filterActionContainer: {
		display: 'flex',
		justifyContent: 'flex-end',
		gap: '1rem',
		height: '40px'
	},
	tagFilter: {
		marginRight: '0.5rem',
		marginBottom: '0.5rem'
	},
	tagContainer: {
		display: 'flex',
		flexWrap: 'wrap',
		width: '100%',
		gap: '0.5rem',
		padding: 0,
		margin: 0,
		listStyle: 'none',
		justifyContent: 'flex-start'
	}
});

export default ActivityFilters;
