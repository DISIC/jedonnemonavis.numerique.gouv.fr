import { FormWithElements } from '@/src/types/prismaTypesExtended';
import { fr } from '@codegouvfr/react-dsfr';
import Input from '@codegouvfr/react-dsfr/Input';
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
					dangerouslySetInnerHTML={{
						__html: block.upLabel
					}}
				></p>
			)}
			<Input
				className={cx(classes.blockTextarea, fr.cx('fr-mb-2v'))}
				label={''}
				textArea
				nativeTextAreaProps={{ 'aria-label': 'Champs de texte de test' }}
			/>
			{block.downLabel && (
				<p className={cx(classes.infoText, fr.cx('fr-mt-0'))}>
					<span className={fr.cx('fr-icon-info-fill', 'fr-mr-1v')} />{' '}
					{block.downLabel}
				</p>
			)}
		</>
	);
};

const useStyles = tss.withName(Textarea.name).create({
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
