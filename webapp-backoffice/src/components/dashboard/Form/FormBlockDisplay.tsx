import { FormConfigHelper } from '@/src/pages/administration/dashboard/product/[id]/forms/[form_id]';
import { FormWithElements } from '@/src/types/prismaTypesExtended';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { tss } from 'tss-react';
import Checkboxes from './blocks/Checkboxes';
import Mark from './blocks/Mark';
import Paragraph from './blocks/Paragraph';
import Smiley from './blocks/Smiley';
import Textarea from './blocks/Textarea';
import Radios from './blocks/Radios';

const Editor = dynamic(() => import('../../ui/Editor'), { ssr: false });

interface Props {
	block: FormWithElements['form_template']['form_template_steps'][0]['form_template_blocks'][0];
	form: FormWithElements;
	configHelper: FormConfigHelper;
	disabled: boolean;
	onConfigChange: (config: FormConfigHelper) => void;
}

const NO_FIELD_BLOCKS = ['heading_1', 'heading_2', 'heading_3'];

const FormBlockDisplay = (props: Props) => {
	const { block, form, configHelper, disabled, onConfigChange } = props;

	const [isUpdating, setIsUpdating] = useState(false);

	const { classes, cx } = useStyles();

	const getBlockFromType = (block: Props['block']) => {
		switch (block.type_bloc) {
			case 'paragraph':
				return isUpdating ? (
					<Editor
						form={form}
						block={block}
						configHelper={configHelper}
						initialValue={block.content}
						onConfigChange={config => {
							onConfigChange(config);
							setIsUpdating(false);
						}}
					/>
				) : (
					<Paragraph block={block} configHelper={configHelper} form={form} />
				);

			case 'smiley_input':
				return <Smiley block={block} />;
			case 'mark_input':
				return <Mark block={block} />;
			case 'checkbox':
				return (
					<Checkboxes
						block={block}
						configHelper={configHelper}
						onConfigChange={onConfigChange}
						disabled={disabled}
					/>
				);
			case 'input_text_area':
				return <Textarea block={block} form={form} />;
			case 'radio':
				return <Radios block={block} />;
			default:
				return <p className={fr.cx('fr-mb-0')}>Type non implémenté</p>;
		}
	};

	return (
		<>
			<div className={cx(classes.header, fr.cx('fr-grid-row'))}>
				<div
					className={
						block.isUpdatable
							? fr.cx('fr-col-12', 'fr-col-md-8')
							: fr.cx('fr-col-12')
					}
				>
					<h3>{block.label}</h3>
				</div>
				{!disabled && block.isUpdatable && (
					<div className={fr.cx('fr-col-12', 'fr-col-md-4')}>
						<Button
							priority="secondary"
							iconId={isUpdating ? 'ri-close-line' : 'ri-pencil-line'}
							iconPosition="right"
							onClick={() => setIsUpdating(!isUpdating)}
						>
							{isUpdating ? 'Annuler' : 'Éditer'}
						</Button>
					</div>
				)}
			</div>
			{!NO_FIELD_BLOCKS.includes(block.type_bloc) && (
				<>
					<hr className={fr.cx('fr-mb-5v', 'fr-mt-6v', 'fr-pb-1v')} />
					<div className={cx(classes.container)}>
						<div>{getBlockFromType(block)}</div>
					</div>
				</>
			)}
		</>
	);
};

const useStyles = tss.withName(FormBlockDisplay.name).create({
	container: {
		color: fr.colors.decisions.text.default.grey.default
	},
	header: {
		'& > div:nth-child(2)': {
			textAlign: 'right'
		}
	}
});

export default FormBlockDisplay;
