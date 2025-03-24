// Paragraph.tsx
import { FormWithElements } from '@/src/types/prismaTypesExtended';
import { tss } from 'tss-react';
import { useEffect, useState } from 'react';

interface Props {
	block: FormWithElements['form_template']['form_template_steps'][0]['form_template_blocks'][0];
	form: FormWithElements;
}

const Paragraph = (props: Props) => {
	const { block, form } = props;
	const { classes, cx } = useStyles();
	const [content, setContent] = useState<string>('');

	const formConfig = form.form_configs[0];

	useEffect(() => {
		if (block.content) {
			const formConfigLabel = formConfig?.form_config_labels?.find(
				fcl => fcl.parent_id === block.id
			);
			setContent(
				(formConfigLabel ? formConfigLabel.label : block.content).replace(
					'{{title}}',
					form.product.title
				) || ''
			);
		}
	}, [block.content, form.product.title]);

	return (
		<p
			className={classes.blockParagraph}
			dangerouslySetInnerHTML={{
				__html: content
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
