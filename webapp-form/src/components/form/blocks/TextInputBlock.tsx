import {
	DynamicAnswerData,
	FormAnswers,
	getTextInputErrorKind,
	MAX_TEXT_INPUT_LENGTH
} from '@/src/utils/form-validation';
import { FormWithElements } from '@/src/utils/types';
import { fr } from '@codegouvfr/react-dsfr';
import { Input } from '@codegouvfr/react-dsfr/Input';
import { SetStateAction, useState } from 'react';

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
	showValidationErrors?: boolean;
}

export const TextInputBlock = ({
	block,
	displayLabel,
	fieldKey,
	answers,
	setAnswers,
	showValidationErrors
}: Props) => {
	const [touched, setTouched] = useState(false);
	const inputAnswer = answers[fieldKey] as DynamicAnswerData | undefined;
	const inputValue = inputAnswer?.answer_text || '';
	const isEmail = block.type_bloc === 'input_email';

	const errorKind = getTextInputErrorKind(
		inputValue,
		isEmail,
		touched || !!showValidationErrors
	);
	const hasError = errorKind !== null;
	const errorMessage =
		errorKind === 'invalid_email'
			? 'Veuillez saisir une adresse électronique valide.'
			: 'Maximum 250 caractères';

	return (
		<div>
			<label
				htmlFor={`input-${block.id}`}
				className={fr.cx('fr-label', 'fr-text--md', 'fr-mb-0')}
			>
				{displayLabel} {!block.isRequired && '(optionnel)'}
			</label>
			{(block.content || isEmail) && (
				<p className={fr.cx('fr-hint-text', 'fr-my-1v')}>
					{[block.content, isEmail && 'Exemple : nom@domaine.fr']
						.filter(Boolean)
						.join(' ')}
				</p>
			)}
			<Input
				label=""
				className={fr.cx('fr-mb-2v')}
				nativeInputProps={{
					id: `input-${block.id}`,
					type: isEmail ? 'email' : 'text',
					value: inputValue,
					maxLength: MAX_TEXT_INPUT_LENGTH,
					required: block.isRequired,
					'aria-invalid': hasError,
					onBlur: () => setTouched(true),
					onChange: e => {
						setAnswers(prev => ({
							...prev,
							[fieldKey]: {
								block_id: block.id,
								answer_text: e.target.value
							}
						}));
					}
				}}
				state={hasError ? 'error' : 'default'}
				stateRelatedMessage={errorMessage}
			/>
		</div>
	);
};
