import { FormWithElements } from '@/src/utils/types';
import { DynamicAnswerData, FormAnswers } from '@/src/utils/form-validation';
import { fr } from '@codegouvfr/react-dsfr';
import { Checkbox } from '@codegouvfr/react-dsfr/Checkbox';
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

export const CheckboxBlock = ({
	block,
	displayLabel,
	fieldKey,
	answers,
	setAnswers,
	form,
	isWidget
}: Props) => {
	const { classes } = useStyles();
	const checkboxAnswers = answers[fieldKey] as DynamicAnswerData[] | undefined;
	const checkboxValues = checkboxAnswers?.map(a => a.answer_item_id) || [];

	const formConfig = form.form_configs[0];
	const visibleOptions = block.options.filter(opt => {
		const isHidden = formConfig?.form_config_displays?.some(
			d => d.kind === 'blockOption' && d.parent_id === opt.id && d.hidden
		);
		return !isHidden;
	});

	return (
		<Checkbox
			small={!!isWidget}
			classes={{ legend: classes.legend }}
			legend={
				<>
					{displayLabel} {!block.isRequired && '(optionnel)'}
				</>
			}
			hintText={block.content || undefined}
			options={visibleOptions.map((opt, index) => ({
				label: opt.label || '',
				hintText: opt.hint,
				nativeInputProps: {
					value: opt.id.toString(),
					checked: checkboxValues.includes(opt.id),
					required:
						block.isRequired && checkboxValues.length === 0 && index === 0,
					'aria-invalid': false,
					onChange: e => {
						const currentAnswers =
							(answers[fieldKey] as DynamicAnswerData[]) || [];
						if (e.target.checked) {
							setAnswers(prev => ({
								...prev,
								[fieldKey]: [
									...currentAnswers,
									{
										block_id: block.id,
										answer_item_id: opt.id
									}
								]
							}));
						} else {
							setAnswers(prev => ({
								...prev,
								[fieldKey]: currentAnswers.filter(
									a => a.answer_item_id !== opt.id
								)
							}));
						}
					}
				}
			}))}
		/>
	);
};

const useStyles = tss.withName({ CheckboxBlock }).create(() => ({
	legend: {
		'&&': {
			fontSize: '1rem',
			lineHeight: '1.5rem',
			fontWeight: 500,
			marginBottom: fr.spacing('5v')
		}
	}
}));
