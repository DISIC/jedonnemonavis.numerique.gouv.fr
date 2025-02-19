import { Filters, useFilters } from '@/src/contexts/FiltersContext';
import { push } from '@socialgouv/matomo-next';
import { tss } from 'tss-react/dsfr';
import { fr } from '@codegouvfr/react-dsfr';
import { useEffect, useState, useCallback } from 'react';
import { debounce } from 'lodash';
import Input from '@codegouvfr/react-dsfr/Input';
import { TypeAction } from '@prisma/client';
import Button from '@codegouvfr/react-dsfr/Button';
import { Autocomplete } from '@mui/material';
import { filtersLabel, getDatesByShortCut } from '@/src/utils/tools';
import Tag from '@codegouvfr/react-dsfr/Tag';
import { trpc } from '@/src/utils/trpc';
import { useRouter } from 'next/router';
import Select from '@codegouvfr/react-dsfr/Select';

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

// Type qui extrait les valeurs de `name`
export type DateShortcutName =
	| (typeof dateShortcuts)[number]['name']
	| undefined;

// Définition des clés valides
export type FilterSectionKey = keyof Pick<
	Filters,
	'productActivityLogs' | 'productReviews' | 'productStats'
>;

// Définition des props du composant
type FiltersProps<T extends FilterSectionKey> = {
	filterKey: T;
};

type FormError = {
	startDate?: boolean;
	endDate?: boolean;
};

const defaultErrors = {
	startDate: false,
	endDate: false
};

const GenericFilters = <T extends FilterSectionKey>({
	filterKey
}: FiltersProps<T>) => {
	const { classes, cx } = useStyles();
	// Récupère le contexte global
	const { filters, updateFilters } = useFilters();
	const [shortcutDateSelected, setShortcutDateSelected] = useState<
		(typeof dateShortcuts)[number]['name'] | undefined
	>('one-year');
	const [filterHasChanged, setFilterHasChanged] = useState(false);

	// Récupère la section spécifique en fonction de filterKey
	const sectionFilters = filters[filterKey];
	const [localStartDate, setLocalStartDate] = useState(
		sectionFilters.currentStartDate
	);
	const [localEndDate, setLocalEndDate] = useState(
		sectionFilters.currentEndDate
	);
	const [errors, setErrors] = useState<FormError>({});
	const [inputValue, setInputValue] = useState<string | undefined>();
	const [filtersApplied, setFiltersApplied] = useState(false);
	const [actionsFilter, setActionsFilter] = useState<string[]>([]);
	const [buttonId, setButtonId] = useState<number | undefined>();

	const router = useRouter();
	const productId = router.query.id;

	const { data: buttonResults, isLoading: isLoadingButtons } =
		trpc.button.getList.useQuery(
			{
				page: 1,
				numberPerPage: 1000,
				product_id: parseInt(productId as string),
				isTest: true
			},
			{
				enabled: !!productId && !isNaN(parseInt(productId as string))
			}
		);

	useEffect(() => {
		if (sectionFilters.dateShortcut) {
			const { startDate, endDate } = getDatesByShortCut(
				sectionFilters.dateShortcut
			);

			if (
				startDate !== sectionFilters.currentStartDate ||
				endDate !== sectionFilters.currentEndDate
			) {
				setLocalStartDate(startDate);
				setLocalEndDate(endDate);

				updateFilters({
					[filterKey]: {
						...sectionFilters,
						currentStartDate: startDate,
						currentEndDate: endDate
					}
				});
			}
		}
	}, [sectionFilters.dateShortcut]);

	const isValidDate = (date: string) => {
		if (!date) return false;
		return /^\d{4}-\d{2}-\d{2}$/.test(date);
	};

	const updateDateFilter = useCallback(
		debounce((key: 'currentStartDate' | 'currentEndDate', value: string) => {
			updateFilters({
				[filterKey]: {
					...filters[filterKey],
					[key]: value,
					hasChanged: true,
					dateShortcut: undefined
				}
			});
		}, 500),
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

	useEffect(() => {
		console.log('sectionFilters : ', sectionFilters);
	}, [sectionFilters]);

	return (
		<div className={cx(classes.filterContainer)}>
			<h4 className={fr.cx('fr-mb-2v')}>Filtres</h4>
			<div
				className={cx(
					fr.cx('fr-grid-row', 'fr-grid-row--gutters'),
					classes.dateShortcuts
				)}
			>
				<div className={fr.cx('fr-col-12', 'fr-col-md-6')}>
					<fieldset id="date-filters" className={fr.cx('fr-fieldset')}>
						<legend className={fr.cx('fr-label')}>Filtres rapides</legend>
						<ul>
							{dateShortcuts.map(ds => (
								<li key={ds.name}>
									<input
										id={`radio-${ds.name}`}
										type="radio"
										name={ds.name}
										checked={sectionFilters.dateShortcut === ds.name}
										onChange={() => {
											updateFilters({
												...filters,
												[filterKey]: {
													...filters[filterKey],
													hasChanged: true,
													dateShortcut: ds.name
												}
											});
											push(['trackEvent', 'Logs', 'Filtre-Date']);
										}}
									/>
									<label
										className={cx(
											fr.cx('fr-tag', 'fr-mt-2v'),

											classes.dateShortcutTag,
											sectionFilters.dateShortcut === ds.name
												? classes.dateShortcutTagSelected
												: undefined
										)}
										htmlFor={`radio-${ds.name}`}
										tabIndex={0}
										onKeyDown={e => {
											if (e.key === 'Enter' || e.key === ' ') {
												updateFilters({
													...filters,
													[filterKey]: {
														...filters[filterKey],
														hasChanged: true,
														dateShortcut: ds.name
													}
												});
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
				<div className={fr.cx('fr-col-12', 'fr-col-lg-6')}>
					<form className={cx(fr.cx('fr-grid-row'), classes.formContainer)}>
						<div className={fr.cx('fr-col', 'fr-col-6')}>
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
						</div>
						<div className={fr.cx('fr-col', 'fr-col-6')}>
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
					</form>
				</div>
				{filterKey === 'productStats' &&
					buttonResults?.data &&
					buttonResults.data.length > 1 && (
						<div className={fr.cx('fr-col', 'fr-col-6')}>
							<Select
								label="Sélectionner une source"
								nativeSelectProps={{
									value:
										'buttonId' in filters[filterKey]
											? filters[filterKey].buttonId
											: undefined,
									onChange: e => {
										setButtonId(
											e.target.value !== 'undefined'
												? parseInt(e.target.value)
												: undefined
										);
										if ('buttonId' in filters[filterKey])
											updateFilters({
												...filters,
												[filterKey]: {
													...filters[filterKey],
													buttonId: parseInt(e.target.value)
												}
											});
										push(['trackEvent', 'Stats', 'Sélection-bouton']);
									}
								}}
							>
								<option value="undefined">Toutes les sources</option>
								{buttonResults?.data?.map(button => {
									return (
										<option key={button.id} value={button.id}>
											{button.title}
										</option>
									);
								})}
							</Select>
						</div>
					)}
				{'actionType' in sectionFilters && (
					<div className={fr.cx('fr-col-12', 'fr-col-lg-6', 'fr-mb-4v')}>
						<Autocomplete
							id="filter-action"
							disablePortal
							sx={{ width: '100%' }}
							options={filtersLabel}
							onChange={(_, option) => {
								if (option) {
									setFilterHasChanged(true);
									setActionsFilter([...actionsFilter, option.value]);
									if ('actionType' in filters[filterKey])
										updateFilters({
											...filters,
											[filterKey]: {
												...filters[filterKey],
												hasChanged: true,
												actionType: [
													...filters[filterKey].actionType,
													option.value
												]
											}
										});
								}
							}}
							inputValue={inputValue}
							value={filtersLabel.find(f => f.value === inputValue) || null}
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
				)}
				{sectionFilters.hasChanged ? (
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
								setErrors({});
								setInputValue(undefined);
								updateFilters({
									...filters,
									[filterKey]: {
										dateShortcut: 'one-year',
										hasChanged: false,
										...('actionType' in filters[filterKey] && {
											actionType: []
										})
									}
								});
								setFiltersApplied(false);
							}}
						>
							Réinitialiser les filtres
						</Button>
					</div>
				) : null}
				{'actionType' in sectionFilters &&
					sectionFilters.actionType.length > 0 && (
						<ul
							className={cx(
								fr.cx('fr-col-12', 'fr-col-md-12', 'fr-my-1w'),
								classes.tagContainer
							)}
						>
							{sectionFilters.actionType.map((action, index) => (
								<li key={index}>
									<Tag
										dismissible
										className={cx(classes.tagFilter)}
										title={`Retirer ${filtersLabel.find(f => f.value === action)?.label}`}
										nativeButtonProps={{
											onClick: () => {
												setActionsFilter(
													actionsFilter.filter(e => e !== action)
												);
												setInputValue('');
												if ('actionType' in filters[filterKey])
													updateFilters({
														...filters,
														[filterKey]: {
															actionType: filters[filterKey].actionType.filter(
																e => e !== action
															)
														}
													});
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
		</div>
	);
};

const useStyles = tss.create({
	filterContainer: {
		display: 'flex',
		flexDirection: 'column',
		gap: '0.5rem',
		border: '1px solid #e0e0e0',
		padding: '1rem'
	},
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

export default GenericFilters;
