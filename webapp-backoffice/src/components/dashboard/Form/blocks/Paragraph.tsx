import { FormConfigHelper } from '@/src/pages/administration/dashboard/product/[id]/forms/[form_id]';
import { FormWithElements } from '@/src/types/prismaTypesExtended';
import { fr } from '@codegouvfr/react-dsfr';
import { useEffect, useState } from 'react';
import { tss } from 'tss-react';

interface Props {
	block: FormWithElements['form_template']['form_template_steps'][0]['form_template_blocks'][0];
	configHelper: FormConfigHelper;
	form: FormWithElements;
}

const Paragraph = (props: Props) => {
	const { block, configHelper, form } = props;
	const { classes, cx } = useStyles();
	const [content, setContent] = useState<string>('');

	useEffect(() => {
		if (block.content) {
			const formConfigLabel = configHelper.labels.find(
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
		<div
			className={classes.blockParagraph}
			dangerouslySetInnerHTML={{
				__html: content
			}}
		/>
	);
};

const useStyles = tss.withName(Paragraph.name).create({
	blockParagraph: {
		p: {
			marginBottom: 0,
			minHeight: fr.spacing('6v')
		}
	}
});

export default Paragraph;
