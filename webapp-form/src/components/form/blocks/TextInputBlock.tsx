import { FormWithElements } from '@/src/utils/types';
import { DynamicAnswerData, FormAnswers } from '@/src/utils/form-validation';
import { fr } from '@codegouvfr/react-dsfr';
import { Input } from '@codegouvfr/react-dsfr/Input';
import Notice from '@codegouvfr/react-dsfr/Notice';
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

export const TextInputBlock = ({
	block,
	displayLabel,
	fieldKey,
	answers,
	setAnswers,
	isWidget,
}: Props) => {
	const { cx, classes } = useStyles();
	const inputAnswer = answers[fieldKey] as DynamicAnswerData | undefined;
	const inputValue = inputAnswer?.answer_text || '';
	const isEmail = block.type_bloc === 'input_email';

	return (
		<div>
			<label
				htmlFor={`input-${block.id}`}
				className={fr.cx('fr-label', 'fr-text--md', 'fr-mb-0')}
			>
				{displayLabel} {!block.isRequired && '(optionnel)'}
			</label>
			{block.content && (
				<p className={fr.cx('fr-hint-text', 'fr-my-1v')}>{block.content}</p>
			)}
			<Input
				label=""
				className={fr.cx('fr-mb-2v')}
				nativeInputProps={{
					id: `input-${block.id}`,
					type: isEmail ? 'email' : 'text',
					value: inputValue,
					maxLength: 250,
					required: block.isRequired,
					onChange: e => {
						setAnswers(prev => ({
							...prev,
							[fieldKey]: {
								block_id: block.id,
								answer_text: e.target.value,
							},
						}));
					},
				}}
				state={inputValue.length > 250 ? 'error' : 'default'}
				stateRelatedMessage="Maximum 250 caractères"
			/>
		</div>
	);
};

const useStyles = tss.withName(TextInputBlock.name).create(() => ({
	notice: {
		background: 'none',
		padding: 0,
		marginBottom: fr.spacing('4v'),
		'.fr-container': {
			padding: 0,
			'.fr-notice__title': {
				fontWeight: 'normal',
				fontSize: '0.75rem',
				'&::before': {
					'--icon-size': '1rem',
					marginRight: fr.spacing('1v'),
				},
			},
		},
	},
}));
