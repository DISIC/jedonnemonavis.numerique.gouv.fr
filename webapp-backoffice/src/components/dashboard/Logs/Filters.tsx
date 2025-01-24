import { getDatesByShortCut } from '@/src/utils/tools';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import Input from '@codegouvfr/react-dsfr/Input';
import Select from '@codegouvfr/react-dsfr/Select';
import { push } from '@socialgouv/matomo-next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { tss } from 'tss-react/dsfr';

type FiltersProps = {
	onChange: (startDate: string, endDate: string, buttonId?: number) => void;
	currentStartDate: string;
	currentEndDate: string;
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

const Filters = ({
	onChange,
	currentStartDate,
	currentEndDate
}: FiltersProps) => {
	const { classes, cx } = useStyles();

	const [startDate, setStartDate] = useState<string>(currentStartDate);
	const [errors, setErrors] = useState<FormErrors>(defaultErrors);
	const [endDate, setEndDate] = useState<string>(currentEndDate);
	const [buttonId, setButtonId] = useState<number | undefined>();
	const [shortcutDateSelected, setShortcutDateSelected] = useState<
		(typeof dateShortcuts)[number]['name'] | undefined
	>('one-year');

	const router = useRouter();
	const productId = router.query.id;

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

		if (startDateValid && endDateValid) {
			if (startDate !== currentStartDate || endDate !== currentEndDate) {
				onChange(startDate, endDate, buttonId);
			}
		}
	};

	return (
		<div
			className={cx(
				fr.cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-mt-4v'),
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
	}
});

export default Filters;
