import { FormWithElements } from '@/src/types/prismaTypesExtended';
import { tss } from 'tss-react';

interface Props {
	block: FormWithElements['form_template']['form_template_steps'][0]['form_template_blocks'][0];
	form: FormWithElements;
}

const Paragraph = (props: Props) => {
	const { block, form } = props;
	const { classes, cx } = useStyles();

	return (
		<p
			className={classes.blockParagraph}
			dangerouslySetInnerHTML={{
				__html: block.content?.replace('{{title}}', form.product.title) || ''
			}}
		/>
	);
};

const useStyles = tss.withName(Paragraph.name).create({
	blockParagraph: {
		marginBottom: 0
	}
});

export default Paragraph;
