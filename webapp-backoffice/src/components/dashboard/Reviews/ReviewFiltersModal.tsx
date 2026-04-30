import { CustomModalProps, ReviewFiltersType } from '@/src/types/custom';
import { FormWithElements } from '@/src/types/prismaTypesExtended';
import { displayIntention } from '@/src/utils/stats/intention-helpers';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { AnswerIntention } from '@prisma/client';
import { push } from '@socialgouv/matomo-next';
import { Fragment, useEffect, useState } from 'react';
import { tss } from 'tss-react/dsfr';

interface Props {
	modal: CustomModalProps;
	filters: ReviewFiltersType;
	form: FormWithElements;
	submitFilters: (filters: ReviewFiltersType) => void;
}

const ReviewFiltersModal = (props: Props) => {
	const { modal, filters, submitFilters, form } = props;
	const { cx, classes } = useStyles();

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

	const buildSmileyOptions = (fieldCode: string) =>
		(['good', 'medium', 'bad'] as AnswerIntention[]).map(intention => {
			const label = displayIntention(intention);
			const checked = isValueSelected(fieldCode, label);
			return {
				label,
				nativeInputProps: {
					name: `${fieldCode}-${intention}`,
					checked,
					onChange: () => {
						updateFieldFilter(fieldCode, label, checked);
						push(['trackEvent', 'Product - Avis', `Filtre-${fieldCode}`]);
					}
				}
			};
		});

	const buildMarkOptions = (
		fieldCode: string,
		options: { id: string | number; value: string | null }[],
		downLabel?: string | null,
		upLabel?: string | null
	) =>
		options.map((option, index) => {
			const optionValue = option.value || '';
			const checked = isValueSelected(fieldCode, optionValue);
			let label: string = optionValue;
			if (index === 0 && downLabel) label = `${optionValue} (${downLabel})`;
			else if (index === options.length - 1 && upLabel)
				label = `${optionValue} (${upLabel})`;
			return {
				label,
				nativeInputProps: {
					name: `${fieldCode}-${option.id}`,
					checked,
					onChange: () => {
						updateFieldFilter(fieldCode, optionValue, checked);
						push(['trackEvent', 'Avis', `Filtre-${fieldCode}`]);
					}
				}
			};
		});

	const buildOptionChoices = (
		fieldCode: string,
		options: {
			id: string | number;
			value: string | null;
			label: string | null;
		}[]
	) =>
		options.map(option => {
			const optionValue = option.value || option.label || '';
			const checked = isValueSelected(fieldCode, optionValue);
			const cleanedLabel = (option.label || '').replace(/\*/g, '');
			return {
				label: cleanedLabel || optionValue,
				nativeInputProps: {
					name: `${fieldCode}-${option.id}`,
					checked,
					onChange: () => {
						updateFieldFilter(fieldCode, optionValue, checked);
						push(['trackEvent', 'Product - Avis', `Filtre-${fieldCode}`]);
					}
				}
			};
		});

	return (
		<modal.Component
			className={fr.cx(
				'fr-grid-row',
				'fr-grid-row--center',
				'fr-grid-row--gutters',
				'fr-my-0'
			)}
			concealingBackdrop={false}
			title={'Plus de filtres'}
			size="large"
		>
			{filterableBlocks.map((block, index) => {
				const fieldKey = block.field_code || '';
				let options: { label: string; nativeInputProps: any }[] | null = null;

				if (block.type_bloc === 'smiley_input') {
					options = buildSmileyOptions(fieldKey);
				} else if (block.type_bloc === 'mark_input') {
					options = buildMarkOptions(
						fieldKey,
						block.options,
						block.downLabel,
						block.upLabel
					);
				} else if (
					['select', 'radio', 'checkbox'].includes(block.type_bloc) &&
					block.options &&
					block.options.length > 0
				) {
					options = buildOptionChoices(fieldKey, block.options);
				}

				if (!options || options.length === 0) return null;

				return (
					<Fragment key={index}>
						{index > 0 && <hr className={cx(classes.separator)} />}
						<div className={cx(classes.section)}>
							<p className={cx(classes.subtitle)}>
								{block.label || block.field_code}
							</p>
							<Checkbox options={options} state="default" />
						</div>
					</Fragment>
				);
			})}

			<div className={fr.cx('fr-grid-row', 'fr-grid-row--left', 'fr-mt-4w')}>
				<ul className={cx(classes.listContainer)}>
					<li>
						<Button
							priority="tertiary"
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
									window._mtm?.push({
										event: 'matomo_event',
										container_type: 'backoffice',
										service_id: form.product_id,
										form_id: form.id,
										template_slug: form.form_template.slug,
										category: 'reviews',
										action_type: 'filter',
										action: 'filter_apply',
										ui_source: 'filter_modal'
									});
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
	section: {
		'& .fr-fieldset': {
			marginBottom: 0,
			'&  .fr-label': {
				...fr.spacing('padding', { topBottom: '2v' }),
				'&::before': {
					top: '0.5rem!important'
				}
			}
		},
		'& .fr-fieldset__element': {
			marginBottom: 0
		}
	},
	subtitle: {
		...fr.typography[19].style,
		marginBottom: fr.spacing('2w'),
		fontWeight: 'bold',
		color: fr.colors.decisions.text.label.grey.default
	},
	separator: {
		border: 'none',
		borderTop: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
		...fr.spacing('margin', { topBottom: '3w' }),
		padding: 0,
		height: 1,
		backgroundColor: 'transparent',
		':last-of-type': {
			marginBottom: fr.spacing('4w')
		}
	},
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
		justifyContent: 'end',
		[fr.breakpoints.down('md')]: {
			flexDirection: 'column-reverse',
			button: {
				width: '100%',
				justifyContent: 'center'
			}
		}
	}
}));

export default ReviewFiltersModal;
