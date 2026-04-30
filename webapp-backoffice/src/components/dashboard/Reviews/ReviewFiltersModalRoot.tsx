import { CustomModalProps, ReviewFiltersType } from '@/src/types/custom';
import { displayIntention } from '@/src/utils/stats/intention-helpers';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { AnswerIntention } from '@prisma/client';
import { push } from '@socialgouv/matomo-next';
import { useEffect, useState } from 'react';
import { tss } from 'tss-react/dsfr';

interface Props {
	modal: CustomModalProps;
	filters: ReviewFiltersType;
	form_id: number;
	submitFilters: (filters: ReviewFiltersType) => void;
}

const ReviewFiltersModalRoot = (props: Props) => {
	const { modal, filters, submitFilters, form_id } = props;
	const { cx, classes } = useStyles();

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

	const satisfactionOptions = (
		['good', 'medium', 'bad'] as AnswerIntention[]
	).map(intention => {
		const label = displayIntention(intention);
		const checked = isValueSelected('satisfaction', label);
		return {
			label,
			nativeInputProps: {
				name: `satisfaction-${intention}`,
				checked,
				onChange: () => {
					updateFieldFilter('satisfaction', label, checked);
					push(['trackEvent', 'Product - Avis', 'Filtre-Satisfaction']);
				}
			}
		};
	});

	const comprehensionOptions = ['1', '2', '3', '4', '5'].map(rating => {
		const checked = isValueSelected('comprehension', rating);
		const label =
			rating === '1'
				? '1 (pas clair du tout)'
				: rating === '5'
				? '5 (très clair)'
				: rating;
		return {
			label,
			nativeInputProps: {
				name: `comprehension-${rating}`,
				checked,
				onChange: () => {
					updateFieldFilter('comprehension', rating, checked);
					push(['trackEvent', 'Avis', 'Filtre-Notation']);
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
			<div className={cx(classes.section)}>
				<p className={cx(classes.subtitle)}>Satisfaction globale</p>
				<Checkbox options={satisfactionOptions} state="default" />
			</div>

			<hr className={cx(classes.separator)} />

			<div className={cx(classes.section)}>
				<p className={cx(classes.subtitle)}>
					Note donnée à la clarté des informations
				</p>
				<Checkbox options={comprehensionOptions} state="default" />
			</div>

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
							onClick={() => {
								setTmpFilters({
									needVerbatim: false,
									needOtherDifficulties: false,
									needOtherHelp: false,
									buttonId: [],
									fields: []
								});
								push(['trackEvent', 'Product - Avis', 'Reinit-filters']);
							}}
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

const useStyles = tss.withName(ReviewFiltersModalRoot.name).create(() => ({
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

export default ReviewFiltersModalRoot;
