import { FormWithElements } from '@/src/types/prismaTypesExtended';
import { sanitizeRichHtml } from '@/src/utils/sanitize';
import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react';

type Block =
	FormWithElements['form_template']['form_template_steps'][0]['form_template_blocks'][0];

interface Props {
	block: Block;
	form: FormWithElements;
}

// Ids linking the question heading (FormBlockDisplay) and the instructions to the text fields
export const getQuestionId = (block: Block) => {
	switch (block.type_bloc) {
		case 'input_text_area':
			return 'question-commentaire';
		case 'input_email':
			return 'question-email';
		case 'input_text':
			return `question-${block.id}`;
		default:
			return undefined;
	}
};

const getInstructionsId = (block: Block) =>
	block.type_bloc === 'input_email' ? 'consigne-email' : `consigne-${block.id}`;

const TextInput = (props: Props) => {
	const { block, form } = props;
	const { classes, cx } = useStyles();

	return (
		<>
			{block.upLabel && (
				<p
					dangerouslySetInnerHTML={{
						__html: sanitizeRichHtml(block.upLabel)
					}}
				></p>
			)}
			{block.content && (
				<p
					id={getInstructionsId(block)}
					className={fr.cx('fr-hint-text', 'fr-mb-2v')}
				>
					{block.content}
				</p>
			)}
			{/* Native field: react-dsfr Input overrides aria-describedby */}
			<div
				className={cx(classes.blockInput, fr.cx('fr-input-group', 'fr-mb-2v'))}
			>
				<input
					type={block.type_bloc === 'input_email' ? 'email' : 'text'}
					className={fr.cx('fr-input')}
					aria-labelledby={getQuestionId(block)}
					aria-describedby={
						block.content ? getInstructionsId(block) : undefined
					}
				/>
			</div>
			{block.downLabel && (
				<p className={cx(classes.infoText, fr.cx('fr-mt-0'))}>
					<span className={fr.cx('fr-icon-info-fill', 'fr-mr-1v')} />{' '}
					{block.downLabel}
				</p>
			)}
		</>
	);
};

const useStyles = tss.withName({ TextInput }).create({
	blockInput: {
		// Add any specific styles if needed
	},
	infoText: {
		color: fr.colors.decisions.text.default.info.default,
		fontSize: '0.8rem',
		'.fr-icon-info-fill::before': {
			'--icon-size': '1rem'
		}
	}
});

export default TextInput;
