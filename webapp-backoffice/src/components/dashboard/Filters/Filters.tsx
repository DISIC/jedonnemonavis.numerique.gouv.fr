import { Filters, useFilters } from '@/src/contexts/FiltersContext';
import { push } from '@socialgouv/matomo-next';
import { tss } from 'tss-react/dsfr';
import { fr } from '@codegouvfr/react-dsfr';
import { useEffect, useState, useCallback } from 'react';
import { debounce } from 'lodash';
import Input from '@codegouvfr/react-dsfr/Input';
import Button from '@codegouvfr/react-dsfr/Button';
import { filtersLabel, getDatesByShortCut } from '@/src/utils/tools';
import Tag from '@codegouvfr/react-dsfr/Tag';
import { useRouter } from 'next/router';

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
};

type FormError = {
	startDate?: boolean;
	endDate?: boolean;
};

const GenericFilters = <T extends FilterSectionKey>({
	filterKey,
	sticky,
	children,
	topRight,
	renderTags
}: FiltersProps<T>) => {
	const { classes, cx } = useStyles();
	const { filters, updateFilters } = useFilters();

	const sectionFilters = filters[filterKey];
	const [localStartDate, setLocalStartDate] = useState(
		sectionFilters.currentStartDate
	);
	const [localEndDate, setLocalEndDate] = useState(
		sectionFilters.currentEndDate
	);
	const [errors, setErrors] = useState<FormError>({});
	const [actionsFilter, setActionsFilter] = useState<string[]>([]);

	const router = useRouter();

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
					...filters,
					[filterKey]: {
						...filters[filterKey],
						currentStartDate: startDate,
						currentEndDate: endDate
					}
				});
			}
		}
	}, [sectionFilters.hasChanged, sectionFilters.dateShortcut]);

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
		}, 1500),
		[updateFilters, filterKey, filters]
	);

	const handleDateChange =
		(key: 'currentStartDate' | 'currentEndDate') =>
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const newDate = e.target.value;

			if (newDate === '') {
				if (key === 'currentStartDate') {
					setLocalStartDate(new Date().toISOString().split('T')[0]);
					updateFilters({
						...filters,
						[filterKey]: {
							...filters[filterKey],
							currentStartDate: new Date().toISOString().split('T')[0]
						}
					});
				} else {
					setLocalEndDate(new Date().toISOString().split('T')[0]);
					updateFilters({
						...filters,
						[filterKey]: {
							...filters[filterKey],
							currentEndDate: new Date().toISOString().split('T')[0]
						}
					});
				}
				return;
			}

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
				updateFilters({
					...filters,
					[filterKey]: {
						...filters[filterKey],
						currentStartDate: new Date().toISOString().split('T')[0]
					}
				});
			} else {
				setErrors(prev => ({
					...prev,
					[key === 'currentStartDate' ? 'startDate' : 'endDate']: undefined
				}));
				updateDateFilter(key, newDate);
			}
		};

	return (
		<div
			className={cx(classes.filterContainer, sticky && classes.stickyContainer)}
		>
			<div className={cx(fr.cx('fr-mb-1v'), classes.titleContainer)}>
				<h4 className={fr.cx('fr-mb-2v')}>Filtres</h4>
				{topRight}
			</div>
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
						<div className={fr.cx('fr-col-12', 'fr-col-sm-6', 'fr-mb-2v')}>
							<Input
								label="Date de début"
								key={`start-date-${localStartDate}`}
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
						<div className={fr.cx('fr-col-12', 'fr-col-sm-6', 'fr-mb-2v')}>
							<Input
								label="Date de fin"
								key={`end-date-${localEndDate}`}
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

				<div className={fr.cx('fr-col-12', 'fr-col-md-6')}>{children}</div>

				{sectionFilters.hasChanged ? (
					<div
						className={cx(
							fr.cx('fr-col-12', 'fr-col-md-6'),
							classes.filterActionContainer
						)}
					>
						<Button
							priority="tertiary no outline"
							iconPosition="right"
							iconId="ri-refresh-line"
							onClick={() => {
								setErrors({});
								updateFilters({
									...filters,
									[filterKey]: {
										dateShortcut: 'one-year',
										hasChanged: false,
										...('actionType' in filters[filterKey] && {
											actionType: []
										}),
										...('buttonId' in filters[filterKey] && {
											buttonId: null
										}),
										...(filterKey === 'productReviews' && {
											filters: {
												satisfaction: [],
												comprehension: [],
												needVerbatim: false,
												needOtherDifficulties: false,
												needOtherHelp: false,
												help: [],
												buttonId: []
											}
										})
									}
								});
							}}
						>
							Réinitialiser les filtres
						</Button>
					</div>
				) : null}
				{renderTags && (
					<div
						className={fr.cx(
							'fr-col-12',
							'fr-col--bottom',
							'fr-py-0',
							'fr-mt-2v'
						)}
					>
						{renderTags()}
					</div>
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
	dateShortcuts: {
		backgroundColor: fr.colors.decisions.background.default.grey.default,
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
		alignContent: 'flex-end',
		gap: '1rem'
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
