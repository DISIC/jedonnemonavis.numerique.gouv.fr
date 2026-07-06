import { FormWithElements } from './types';

export type DynamicAnswerData = {
	block_id: number;
	answer_item_id?: number;
	answer_text?: string;
};

export type FormAnswers = Record<
	string,
	DynamicAnswerData | DynamicAnswerData[]
>;

type FormConfig = FormWithElements['form_configs'][0];

type Block =
	FormWithElements['form_template']['form_template_steps'][0]['form_template_blocks'][0];

const DECORATIVE_BLOCK_TYPES = [
	'paragraph',
	'heading_1',
	'heading_2',
	'heading_3',
	'divider'
];

export function isBlockHidden(block: Block, formConfig?: FormConfig): boolean {
	const display = formConfig?.form_config_displays?.find(
		d => d.kind === 'block' && d.parent_id === block.id
	);
	return display ? display.hidden : block.isHiddenByDefault;
}

export function getVisibleBlocks(
	blocks: Block[],
	formConfig?: FormConfig
): Block[] {
	return blocks.filter(block => !isBlockHidden(block, formConfig));
}

export function hasBlockAnswer(
	answer: FormAnswers[string] | undefined
): boolean {
	if (!answer) return false;
	if (Array.isArray(answer)) return answer.length > 0;
	return !!(answer.answer_item_id || answer.answer_text);
}

export function isAnswerableBlock(block: Block): boolean {
	return !DECORATIVE_BLOCK_TYPES.includes(block.type_bloc);
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MAX_TEXT_INPUT_LENGTH = 250;

export type TextInputErrorKind = 'too_long' | 'invalid_email';

export function isValidEmail(value: string): boolean {
	return EMAIL_REGEX.test(value.trim());
}

export function getTextInputErrorKind(
	value: string,
	isEmail: boolean,
	revealEmailError: boolean
): TextInputErrorKind | null {
	if (value.length > MAX_TEXT_INPUT_LENGTH) return 'too_long';
	if (
		isEmail &&
		revealEmailError &&
		value.trim() !== '' &&
		!isValidEmail(value)
	)
		return 'invalid_email';
	return null;
}

export function getInvalidEmailBlocks(
	blocks: Block[],
	answers: FormAnswers,
	formConfig?: FormConfig
): Block[] {
	return getVisibleBlocks(blocks, formConfig).filter(block => {
		if (block.type_bloc !== 'input_email') return false;
		const answer = answers[`block_${block.id}`];
		if (!answer || Array.isArray(answer)) return false;
		const text = answer.answer_text?.trim();
		return !!text && !isValidEmail(text);
	});
}

export function hasAllRequiredBlockAnswers(
	blocks: Block[],
	answers: FormAnswers,
	formConfig?: FormConfig
): boolean {
	return getVisibleBlocks(blocks, formConfig)
		.filter(block => block.isRequired && isAnswerableBlock(block))
		.every(block => hasBlockAnswer(answers[`block_${block.id}`]));
}
