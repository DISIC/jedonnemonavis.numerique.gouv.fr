import { FormWithElements } from '@/src/utils/types';
import { DynamicAnswerData, FormAnswers } from '@/src/utils/form-validation';
import { fr } from '@codegouvfr/react-dsfr';
import { SetStateAction } from 'react';
import { tss } from 'tss-react/dsfr';

type Block =
	FormWithElements['form_template']['form_template_steps'][0]['form_template_blocks'][0];

interface Props {
	block: Block;
	displayLabel: string;
	fieldKey: string;
	answers: FormAnswers;
	setAnswers: (value: SetStateAction<FormAnswers>) => void;
	form: FormWithElements;
	isWidget?: boolean;
}

export const MarkInputBlock = ({
	block,
	displayLabel,
	fieldKey,
	answers,
	setAnswers,
	form,
	isWidget
}: Props) => {
	const { classes, cx } = useStyles();
	const markAnswer = answers[fieldKey] as DynamicAnswerData | undefined;
	const markValue = markAnswer?.answer_item_id;

	const formConfig = form.form_configs[0];
	const visibleOptions = block.options.filter(opt => {
		const isHidden = formConfig?.form_config_displays?.some(
			d => d.kind === 'blockOption' && d.parent_id === opt.id && d.hidden
		);
		return !isHidden;
	});

	const firstRating = ['1', '2', '3', '4', '5'].find(rating =>
		visibleOptions.some(opt => opt.value === rating)
	);

	return (
		<fieldset className={cx(classes.markFieldset, fr.cx('fr-fieldset'))}>
			<legend className={cx(classes.legend)}>
				<span
					className={fr.cx(
						'fr-label',
						isWidget ? 'fr-text--sm' : 'fr-text--md'
					)}
				>
					{displayLabel} {!block.isRequired && '(optionnel)'}
				</span>
				{block.content && (
					<span className={fr.cx('fr-hint-text')}>{block.content}</span>
				)}
			</legend>
			<div className={cx(classes.rating)}>
				<span>{block.downLabel || 'Minimum'}</span>
				<ul>
					{['1', '2', '3', '4', '5'].map(rating => {
						const ratingOption = visibleOptions.find(
							opt => opt.value === rating
						);
						if (!ratingOption) return null;

						return (
							<li key={rating}>
								<input
									id={`mark-${block.id}-${rating}`}
									className={fr.cx('fr-sr-only')}
									type="radio"
									name={fieldKey}
									value={ratingOption.id.toString()}
									aria-label={
										rating === firstRating
											? `${displayLabel}, ${
													block.downLabel || 'Minimum'
											  }, ${rating}`
											: undefined
									}
									checked={markValue === ratingOption.id}
									required={block.isRequired}
									onChange={() => {
										setAnswers(prev => ({
											...prev,
											[fieldKey]: {
												block_id: block.id,
												answer_item_id: ratingOption.id
											}
										}));
									}}
								/>
								<label
									htmlFor={`mark-${block.id}-${rating}`}
									className={
										markValue === ratingOption.id
											? classes.selectedOption
											: undefined
									}
								>
									{rating}
								</label>
							</li>
						);
					})}
				</ul>
				<span>{block.upLabel || 'Maximum'}</span>
			</div>
		</fieldset>
	);
};

const useStyles = tss.withName({ MarkInputBlock }).create(() => ({
	markFieldset: {
		border: 0,
		margin: 0,
		padding: 0,
		minWidth: 0,
		width: '100%'
	},
	legend: {
		float: 'none',
		width: '100%',
		padding: 0,
		marginBottom: fr.spacing('4v')
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
	},
	selectedOption: {
		backgroundColor: fr.colors.decisions.background.flat.blueFrance.default,
		color: 'white',
		fontWeight: 'bold',
		borderColor: fr.colors.decisions.background.flat.blueFrance.default
	}
}));
