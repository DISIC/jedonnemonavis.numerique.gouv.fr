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
		<Input
			className={cx(classes.blockTextarea)}
			label={''}
			hintText={block.content}
			textArea
		/>
	);
};

const useStyles = tss.withName(Textarea.name).create({
	blockTextarea: {
		'.fr-input': {
			minHeight: fr.spacing('28v')
		}
	}
});

export default Textarea;
