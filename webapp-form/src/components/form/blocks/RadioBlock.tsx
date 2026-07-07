import { FormWithElements } from '@/src/utils/types';
import { DynamicAnswerData, FormAnswers } from '@/src/utils/form-validation';
import { parseBoldLabel } from '@/src/utils/tools';
import { fr } from '@codegouvfr/react-dsfr';
import { RadioButtons } from '@codegouvfr/react-dsfr/RadioButtons';
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

export const RadioBlock = ({
	block,
	displayLabel,
	fieldKey,
	answers,
	setAnswers,
	form
}: Props) => {
	const { classes } = useStyles();
	const radioAnswer = answers[fieldKey] as DynamicAnswerData | undefined;
	const radioValue = radioAnswer?.answer_item_id;

	const formConfig = form.form_configs[0];
	const visibleOptions = block.options.filter(opt => {
		const isHidden = formConfig?.form_config_displays?.some(
			d => d.kind === 'blockOption' && d.parent_id === opt.id && d.hidden
		);
		return !isHidden;
	});

	return (
		<RadioButtons
			id={`radio-${block.id}`}
			aria-labelledby={undefined}
			classes={{ legend: classes.legend }}
			legend={
				<>
					{displayLabel} {!block.isRequired && '(optionnel)'}
				</>
			}
			hintText={block.content || undefined}
			options={visibleOptions.map(opt => ({
				label: opt.label ? parseBoldLabel(opt.label) : '',
				hintText: opt.hint,
				nativeInputProps: {
					value: opt.id.toString(),
					checked: radioValue === opt.id,
					required: block.isRequired,
					'aria-invalid': false,
					onChange: () => {
						setAnswers(prev => ({
							...prev,
							[fieldKey]: {
								block_id: block.id,
								answer_item_id: opt.id
							}
						}));
					}
				}
			}))}
		/>
	);
};

const useStyles = tss.withName({ RadioBlock }).create(() => ({
	legend: {
		'&&': {
			fontSize: '1rem',
			lineHeight: '1.5rem',
			fontWeight: '400!important',
			marginBottom: fr.spacing('5v')
		}
	}
}));
