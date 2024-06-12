import { tss } from 'tss-react/dsfr';
import { getDatesByShortCut } from '@/src/utils/tools';
import { useEffect, useState } from 'react';
import { fr } from '@codegouvfr/react-dsfr';
import Input from '@codegouvfr/react-dsfr/Input';

type FiltersProps = {
	onChange: (startDate: string, endDate: string) => void;
	currentStartDate: string;
	currentEndDate: string;
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

const Filters = ({
	onChange,
	currentStartDate,
	currentEndDate
}: FiltersProps) => {
	const { classes, cx } = useStyles();

	const [startDate, setStartDate] = useState<string>(currentStartDate);
	const [endDate, setEndDate] = useState<string>(currentEndDate);
	const [shortcutDateSelected, setShortcutDateSelected] = useState<
		(typeof dateShortcuts)[number]['name'] | undefined
	>('one-year');

	useEffect(() => {
		if (shortcutDateSelected) {
			const dates = getDatesByShortCut(shortcutDateSelected);

			if (dates.startDate !== startDate) {
				setStartDate(dates.startDate);
			}
			if (dates.endDate !== endDate) {
				setEndDate(dates.endDate);
			}
		}
	}, [shortcutDateSelected]);

	useEffect(() => {
		if (startDate !== currentStartDate || endDate !== currentEndDate)
			onChange(startDate, endDate);
	}, [startDate, endDate]);

	return (
		<div
			className={cx(
				fr.cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-mt-8v'),
				classes.dateShortcuts
			)}
		>
			<div className={fr.cx('fr-col', 'fr-col-6')}>
				<fieldset id="date-filters" className={fr.cx('fr-fieldset')}>
					<legend className={fr.cx('fr-label')}>Filtres</legend>
					<ul>
						{dateShortcuts.map(ds => (
							<li key={ds.name}>
								<input
									id={`radio-${ds.name}`}
									type="radio"
									name={ds.name}
									checked={shortcutDateSelected === ds.name}
									onClick={() => {
										setShortcutDateSelected(ds.name);
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
								>
									{ds.label}
								</label>
							</li>
						))}
					</ul>
				</fieldset>
			</div>
			<div className={fr.cx('fr-col', 'fr-col-3')}>
				<Input
					label="Date de début"
					nativeInputProps={{
						type: 'date',
						value: startDate,
						onChange: e => {
							setShortcutDateSelected(undefined);
							setStartDate(e.target.value);
						}
					}}
				/>
			</div>
			<div className={fr.cx('fr-col', 'fr-col-3')}>
				<Input
					label="Date de fin"
					nativeInputProps={{
						type: 'date',
						value: endDate,
						onChange: e => {
							setShortcutDateSelected(undefined);
							setEndDate(e.target.value);
						}
					}}
				/>
			</div>
		</div>
	);
};

const useStyles = tss.create({
	dateShortcuts: {
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
	}
});

export default Filters;
