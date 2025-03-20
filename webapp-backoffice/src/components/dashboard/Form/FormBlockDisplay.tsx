import { FormWithElements } from '@/src/types/prismaTypesExtended';
import { smileys } from '@/src/utils/form';
import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react';
import Image from 'next/image';
import Paragraph from './blocks/Paragraph';
import Smiley from './blocks/Smiley';
import Mark from './blocks/Mark';

interface Props {
	block: FormWithElements['form_template']['form_template_steps'][0]['form_template_blocks'][0];
	form: FormWithElements;
}

const FormBlockDisplay = (props: Props) => {
	const { block, form } = props;

	const { classes, cx } = useStyles();

	const getBlockFromType = (block: Props['block']) => {
		switch (block.type_bloc) {
			case 'paragraph':
				return <Paragraph block={block} form={form} />;
			case 'smiley_input':
				return <Smiley block={block} />;
			case 'mark_input':
				return <Mark block={block} />;
			default:
				return <p className={fr.cx('fr-mb-0')}>Type non implémenté</p>;
		}
	};

	return (
		<div className={cx(classes.container)}>
			<div>{getBlockFromType(block)}</div>
		</div>
	);
};

const useStyles = tss.withName(FormBlockDisplay.name).create({
	container: {
		color: fr.colors.decisions.text.default.grey.default
	}
});

export default FormBlockDisplay;
