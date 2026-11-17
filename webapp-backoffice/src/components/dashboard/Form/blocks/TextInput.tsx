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

export const getQuestionId = (block: Pick<Block, 'id'>) =>
	`question-${block.id}`;

export const getInstructionsId = (block: Pick<Block, 'id'>) =>
	`consigne-${block.id}`;

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
