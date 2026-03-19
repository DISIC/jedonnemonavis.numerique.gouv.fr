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
	isWidget?: boolean;
}

export const TextAreaBlock = ({
	block,
	displayLabel,
	fieldKey,
	answers,
	setAnswers,
	isWidget,
}: Props) => {
	const { classes, cx } = useStyles();
	const textareaAnswer = answers[fieldKey] as DynamicAnswerData | undefined;
	const textareaValue = textareaAnswer?.answer_text || '';

	return (
		<div className={classes.inputContainer}>
			<label
				htmlFor={`textarea-${block.id}`}
				className={fr.cx('fr-label', 'fr-text--md', 'fr-mb-0')}
			>
				{displayLabel}{' '}
				{block.isRequired ? (
					<span className={classes.asterisk}>*</span>
				) : (
					'(optionnel)'
				)}
			</label>
			{block.content && <p className={classes.hint}>{block.content}</p>}
			<Input
				label=""
				className={fr.cx('fr-mb-0')}
				hintText={
					<>
						Pour nous aider à comprendre, vous pouvez préciser : <br /> - si
						vous êtes sur un ordinateur ou un téléphone, <br />- ce que vous
						cherchiez à faire, <br />- ce qui s’est réellement passé ou ce qui
						pourrait être amélioré. <br />
						Plus votre description est précise, plus nous pourrons agir
						efficacement.
					</>
				}
				nativeTextAreaProps={{
					id: `textarea-${block.id}`,
					value: textareaValue,
					maxLength: 15000,
					required: block.isRequired,
					onChange: e => {
						const value = e.target.value;
						setAnswers(prev => ({
							...prev,
							[fieldKey]: {
								block_id: block.id,
								answer_text: value,
							},
						}));
					},
					autoFocus: true,
				}}
				state={textareaValue.length > 15000 ? 'error' : 'default'}
				stateRelatedMessage="Maximum 15000 caractères"
				textArea
			/>
			<div className={cx(classes.textCount, fr.cx('fr-hint-text'))}>
				{textareaValue.length} / 15000
			</div>
			<Notice
				className={cx(classes.notice)}
				title="Ne partagez aucune information personnelle (exemple : nom, email, téléphone)"
			/>
		</div>
	);
};

const useStyles = tss.withName(TextAreaBlock.name).create(() => ({
	inputContainer: {
		display: 'flex',
		flexDirection: 'column',
	},
	textCount: {
		alignSelf: 'flex-end',
		marginTop: fr.spacing('1v'),
		marginBottom: 0,
		marginRight: fr.spacing('1v'),
	},
	hint: {
		fontSize: '0.9rem',
		color: fr.colors.decisions.text.mention.grey.default,
		marginBottom: fr.spacing('6v'),
		marginTop: `-${fr.spacing('2v')}`,
	},
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
	asterisk: {
		color: fr.colors.decisions.text.actionHigh.redMarianne.default,
	},
}));
