import { CustomModalProps, ReviewFiltersType } from '@/src/types/custom';
import { FormWithElements } from '@/src/types/prismaTypesExtended';
import {
	displayIntention,
	getStatsColor,
	getStatsIcon
} from '@/src/utils/stats/intention-helpers';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import Select from '@codegouvfr/react-dsfr/Select';
import { AnswerIntention } from '@prisma/client';
import { push } from '@socialgouv/matomo-next';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { tss } from 'tss-react/dsfr';

interface Props {
	modal: CustomModalProps;
	filters: ReviewFiltersType;
	form: FormWithElements;
	setButtonId: (buttonId: number | undefined) => void;
	submitFilters: (filters: ReviewFiltersType) => void;
}

const ReviewFiltersModal = (props: Props) => {
	const { modal, filters, submitFilters, form } = props;
	const { cx, classes } = useStyles();

	const { data: buttonResults } = trpc.button.getList.useQuery({
		page: 1,
		numberPerPage: 1000,
		form_id: form.id,
		isTest: false
	});

	const filterableBlocks = form.form_template.form_template_steps
		.flatMap(step => step.form_template_blocks)
		.filter(block =>
			['mark_input', 'smiley_input', 'select', 'radio', 'checkbox'].includes(
				block.type_bloc
			)
		);

	const hasVerbatimBlock = form.form_template.form_template_steps
		.flatMap(step => step.form_template_blocks)
		.some(block => block.field_code === 'verbatim');

	const [tmpFilters, setTmpFilters] = useState<ReviewFiltersType>(filters);

	useEffect(() => {
		setTmpFilters(filters);
	}, [filters]);

	const updateFieldFilter = (
		fieldCode: string,
		value: string,
		isSelected: boolean
	) => {
		const existingFieldIndex = tmpFilters.fields.findIndex(
			f => f.field_code === fieldCode
		);

		if (existingFieldIndex >= 0) {
			const updatedFields = [...tmpFilters.fields];
			const currentValues = updatedFields[existingFieldIndex].values;

			if (isSelected) {
				updatedFields[existingFieldIndex].values = currentValues.filter(
					v => v !== value
				);
				if (updatedFields[existingFieldIndex].values.length === 0) {
					updatedFields.splice(existingFieldIndex, 1);
				}
			} else {
				updatedFields[existingFieldIndex].values = [...currentValues, value];
			}

			setTmpFilters({
				...tmpFilters,
				fields: updatedFields
			});
		} else {
			setTmpFilters({
				...tmpFilters,
				fields: [
					...tmpFilters.fields,
					{ field_code: fieldCode, values: [value] }
				]
			});
		}
	};

	const isValueSelected = (fieldCode: string, value: string): boolean => {
		const fieldFilter = tmpFilters.fields.find(f => f.field_code === fieldCode);
		return fieldFilter?.values.includes(value) || false;
	};

	const handleReset = () => {
		const emptyFilters: ReviewFiltersType = {
			needVerbatim: false,
			needOtherDifficulties: false,
			needOtherHelp: false,
			buttonId: [],
			fields: []
		};
		setTmpFilters(emptyFilters);
		push(['trackEvent', 'Product - Avis', 'Reinit-filters']);
	};

	return (
		<modal.Component
			className={fr.cx(
				'fr-grid-row',
				'fr-grid-row--center',
				'fr-grid-row--gutters',
				'fr-my-0'
			)}
			concealingBackdrop={false}
			title={'Filtres'}
			size="large"
		>
			{filterableBlocks.map((block, index) => (
				<div key={index} className={fr.cx('fr-mt-4w')}>
					<p className={cx(classes.subtitle)}>
						{block.label || block.field_code}
					</p>

					{block.type_bloc === 'smiley_input' && (
						<div className={classes.badgeContainer}>
							{['good', 'medium', 'bad'].map(intention => {
								const fieldKey = block.field_code || '';
								const label = displayIntention(
									(intention ?? 'neutral') as AnswerIntention
								);
								const isSelected = isValueSelected(fieldKey, label);

								return (
									<Button
										onClick={() => {
											updateFieldFilter(fieldKey, label, isSelected);
											push([
												'trackEvent',
												'Product - Avis',
												`Filtre-${fieldKey}`
											]);
										}}
										priority="tertiary"
										className={cx(
											classes.badge,
											isSelected ? classes.selectedSmileyOption : undefined
										)}
										key={`${block.field_code}_${intention}`}
										style={{
											color: getStatsColor({
												intention: (intention ?? 'neutral') as AnswerIntention
											})
										}}
									>
										<Image
											alt=""
											src={`/assets/smileys/${getStatsIcon({
												intention: (intention ?? 'neutral') as AnswerIntention
											})}.svg`}
											width={15}
											height={15}
										/>
										{label}
									</Button>
								);
							})}
						</div>
					)}

					{block.type_bloc === 'mark_input' && (
						<div className={cx(classes.rating)}>
							<span>{block.downLabel || 'Minimum'}</span>
							<fieldset className={fr.cx('fr-fieldset')}>
								<ul>
									{block.options.map(option => {
										const fieldKey = block.field_code || '';
										const optionValue = option.value || '';
										const isSelected = isValueSelected(fieldKey, optionValue);

										return (
											<li key={option.id}>
												<input
													id={`radio-${block.field_code}-${option.id}`}
													className={fr.cx('fr-sr-only')}
													type="checkbox"
													checked={isSelected}
													onChange={() => {
														updateFieldFilter(
															fieldKey,
															optionValue,
															isSelected
														);
														push(['trackEvent', 'Avis', `Filtre-${fieldKey}`]);
													}}
												/>
												<label
													htmlFor={`radio-${block.field_code}-${option.id}`}
													className={
														isSelected ? classes.selectedOption : undefined
													}
												>
													{option.value}
												</label>
											</li>
										);
									})}
								</ul>
							</fieldset>
							<span>{block.upLabel || 'Maximum'}</span>
						</div>
					)}

					{['select', 'radio', 'checkbox'].includes(block.type_bloc) &&
						block.options &&
						block.options.length > 0 && (
							<fieldset
								className={cx(fr.cx('fr-fieldset'), classes.optionsFieldset)}
							>
								<ul>
									{block.options.map(option => {
										const fieldKey = block.field_code || '';
										const optionValue = option.value || option.label || '';
										const isSelected = isValueSelected(fieldKey, optionValue);

										return (
											<li key={option.id}>
												<input
													id={`option-${block.field_code}-${option.id}`}
													className={fr.cx('fr-sr-only')}
													type="checkbox"
													checked={isSelected}
													onChange={() => {
														updateFieldFilter(
															fieldKey,
															optionValue,
															isSelected
														);
														push([
															'trackEvent',
															'Product - Avis',
															`Filtre-${fieldKey}`
														]);
													}}
												/>
												<label
													htmlFor={`option-${block.field_code}-${option.id}`}
													className={
														isSelected ? classes.selectedOption : undefined
													}
												>
													{option.label}
												</label>
											</li>
										);
									})}
								</ul>
							</fieldset>
						)}
				</div>
			))}
			{(buttonResults && buttonResults.data && buttonResults.data.length > 1) ||
			hasVerbatimBlock ? (
				<div className={fr.cx('fr-mt-4w')}>
					<p className={cx(classes.subtitle)}>Filtres complémentaires</p>

					{buttonResults &&
						buttonResults.data &&
						buttonResults.data.length > 1 && (
							<Select
								label="Sélectionner une source"
								nativeSelectProps={{
									value: tmpFilters.buttonId[0],
									onChange: e => {
										setTmpFilters({
											...tmpFilters,
											buttonId:
												e.target.value !== 'undefined' ? [e.target.value] : []
										});
										push(['trackEvent', 'Avis', 'Sélection-bouton']);
									}
								}}
							>
								<option value="undefined">Toutes les sources</option>
								{buttonResults.data.map(button => (
									<option key={button.id} value={button.id}>
										{button.title}
									</option>
								))}
							</Select>
						)}

					{hasVerbatimBlock && (
						<Checkbox
							options={[
								{
									label: 'Réponse avec commentaire',
									nativeInputProps: {
										name: 'needVerbatim',
										checked: tmpFilters.needVerbatim,
										onChange: () => {
											setTmpFilters({
												...tmpFilters,
												needVerbatim: !tmpFilters.needVerbatim
											});
											push(['trackEvent', 'Avis', 'Filtre-Complémentaire']);
										}
									}
								}
							]}
							state="default"
						/>
					)}
				</div>
			) : null}

			<div className={fr.cx('fr-grid-row', 'fr-grid-row--left', 'fr-mt-4w')}>
				<ul className={cx(classes.listContainer)}>
					<li>
						<Button
							priority="secondary"
							className={fr.cx('fr-mt-1w')}
							type="button"
							onClick={() => {
								setTmpFilters(filters);
								modal.close();
								push(['trackEvent', 'Product - Avis', 'Cancel-Filters']);
							}}
						>
							Annuler
						</Button>
					</li>
					<li>
						<Button
							priority="secondary"
							className={fr.cx('fr-mt-1w')}
							iconId="fr-icon-edit-line"
							iconPosition="right"
							type="button"
							onClick={handleReset}
						>
							Réinitialiser
						</Button>
					</li>
					<li>
						<div className={cx(classes.applyWrapper)}>
							<Button
								priority="primary"
								className={fr.cx('fr-mt-1w')}
								type="button"
								onClick={() => {
									submitFilters(tmpFilters);
									push(['trackEvent', 'Product - Avis', 'Apply-Filters']);
								}}
							>
								Appliquer les filtres
							</Button>
						</div>
					</li>
				</ul>
			</div>
		</modal.Component>
	);
};

const useStyles = tss.withName(ReviewFiltersModal.name).create(() => ({
	applyWrapper: {
		display: 'flex',
		justifyContent: 'end'
	},
	listContainer: {
		display: 'flex',
		width: '100%',
		gap: '1rem',
		padding: 0,
		margin: 0,
		listStyle: 'none',
		justifyContent: 'space-between',
		[fr.breakpoints.down('md')]: {
			flexDirection: 'column-reverse',
			button: {
				width: '100%',
				justifyContent: 'center'
			}
		}
	},
	subtitle: {
		...fr.typography[19].style,
		marginBottom: 10,
		fontWeight: 'bold'
	},
	badgeContainer: {
		display: 'flex',
		gap: 10,
		flexWrap: 'wrap',
		[fr.breakpoints.down('md')]: {
			justifyContent: 'space-between'
		}
	},
	badge: {
		justifyContent: 'center',
		cursor: 'pointer',
		gap: '0.25rem',
		border: `1px solid ${fr.colors.decisions.background.alt.grey.hover}`,
		['&:hover']: {
			borderColor: fr.colors.decisions.background.alt.grey.active,
			fontWeight: 'bold'
		},
		[fr.breakpoints.down('md')]: {
			flex: '1 1 auto'
		}
	},
	selectedSmileyOption: {
		backgroundColor: fr.colors.decisions.background.alt.grey.hover,
		color: 'white'
	},
	selectedOption: {
		backgroundColor: fr.colors.decisions.background.flat.blueFrance.default,
		color: 'white',
		fontWeight: 'bold',
		borderColor: fr.colors.decisions.background.flat.blueFrance.default
	},
	rating: {
		display: 'flex',
		alignItems: 'center',
		[fr.breakpoints.down('md')]: {
			flexDirection: 'column'
		},
		'& > span': {
			...fr.typography[18].style,
			marginBottom: 0
		},
		fieldset: {
			margin: 0,
			[fr.breakpoints.down('md')]: {
				width: '100%'
			},
			ul: {
				listStyleType: 'none',
				columns: 5,
				gap: 10,
				margin: '0 1rem',
				padding: 0,
				overflow: 'hidden',
				[fr.breakpoints.down('md')]: {
					columns: 'auto',
					width: '100%',
					margin: 0
				},
				li: {
					label: {
						width: '3.5rem',
						justifyContent: 'center',
						border: `1px solid ${fr.colors.decisions.background.alt.grey.hover}`,
						padding: `${fr.spacing('1v')} ${fr.spacing('3v')}`,
						display: 'flex',
						alignItems: 'center',
						cursor: 'pointer',
						['&:hover']: {
							borderColor: fr.colors.decisions.background.alt.grey.active,
							fontWeight: 'bold'
						},
						[fr.breakpoints.down('md')]: {
							width: '100%'
						}
					}
				}
			}
		}
	},
	optionsFieldset: {
		margin: 0,
		padding: 0,
		ul: {
			listStyleType: 'none',
			display: 'flex',
			flexWrap: 'wrap',
			gap: 10,
			padding: 0,
			margin: 0,
			li: {
				label: {
					minWidth: '80px',
					justifyContent: 'center',
					border: `1px solid ${fr.colors.decisions.background.alt.grey.hover}`,
					padding: `${fr.spacing('1v')} ${fr.spacing('3v')}`,
					display: 'flex',
					alignItems: 'center',
					cursor: 'pointer',
					['&:hover']: {
						borderColor: fr.colors.decisions.background.alt.grey.active,
						fontWeight: 'bold'
					}
				}
			}
		}
	}
}));

export default ReviewFiltersModal;
