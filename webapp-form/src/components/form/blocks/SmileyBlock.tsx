import { FormWithElements } from '@/src/utils/types';
import { DynamicAnswerData, FormAnswers } from '@/src/utils/form-validation';
import { SetStateAction } from 'react';
import { SmileyInput } from '../elements/SmileyInput';

type Block =
	FormWithElements['form_template']['form_template_steps'][0]['form_template_blocks'][0];

interface Props {
	block: Block;
	displayLabel: string;
	fieldKey: string;
	answers: FormAnswers;
	setAnswers: (value: SetStateAction<FormAnswers>) => void;
	isWidget?: boolean;
}

export const SmileyBlock = ({
	block,
	displayLabel,
	fieldKey,
	answers,
	setAnswers,
	isWidget,
}: Props) => {
	const smileyAnswer = answers[fieldKey] as DynamicAnswerData | undefined;
	const smileyValue = smileyAnswer?.answer_item_id;

	return (
		<SmileyInput
			label={displayLabel}
			name={fieldKey}
			hint={block.content || undefined}
			value={smileyValue}
			isWidget={isWidget}
			onChange={feeling => {
				const smileyItemId =
					feeling === 'bad' ? 1 : feeling === 'medium' ? 2 : 3;
				setAnswers(prev => ({
					...prev,
					[fieldKey]: {
						block_id: block.id,
						answer_item_id: smileyItemId,
					},
				}));
			}}
		/>
	);
};
