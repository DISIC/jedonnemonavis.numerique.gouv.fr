import { FormWithElements } from '@/src/types/prismaTypesExtended';
import { sanitizeRichHtml } from '@/src/utils/sanitize';
import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react';

interface Props {
	block: FormWithElements['form_template']['form_template_steps'][0]['form_template_blocks'][0];
	form: FormWithElements;
}

const Textarea = (props: Props) => {
	const { block, form } = props;
	const { classes, cx } = useStyles();

	return (
		<>
			{block.upLabel && (
				<p
					id="consigne-commentaire"
					dangerouslySetInnerHTML={{
						__html: sanitizeRichHtml(block.upLabel)
					}}
				></p>
			)}
			{/* Native field: react-dsfr Input overrides aria-describedby */}
			<div
				className={cx(
					classes.blockTextarea,
					fr.cx('fr-input-group', 'fr-mb-2v')
				)}
			>
				<textarea
					className={fr.cx('fr-input')}
					aria-labelledby="question-commentaire"
					aria-describedby={block.upLabel ? 'consigne-commentaire' : undefined}
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

const useStyles = tss.withName({ Textarea }).create({
	blockTextarea: {
		'.fr-input': {
			minHeight: fr.spacing('28v')
		}
	},
	infoText: {
		color: fr.colors.decisions.text.default.info.default,
		fontSize: '0.8rem',
		'.fr-icon-info-fill::before': {
			'--icon-size': '1rem'
		}
	}
});

export default Textarea;
