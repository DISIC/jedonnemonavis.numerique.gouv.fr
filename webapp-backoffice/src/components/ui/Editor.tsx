import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { createEditor, Descendant } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import MarkButton from './editor/MarkButton';
import Element from './editor/Element';
import Leaf from './editor/Leaf';
import { tss } from 'tss-react';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import {
	FormConfigDisplayPartial,
	FormConfigLabelPartial
} from '@/prisma/generated/zod';
import { FormWithElements } from '@/src/types/prismaTypesExtended';
import { deserialize, serialize } from '@/src/utils/slate';

interface Props {
	block: FormWithElements['form_template']['form_template_steps'][0]['form_template_blocks'][0];
	form: FormWithElements;
	initialValue: string | null;
	onConfigChange: (config: {
		displays: FormConfigDisplayPartial[];
		labels: FormConfigLabelPartial[];
	}) => void;
}

const Editor = (props: Props) => {
	const { block, form, initialValue, onConfigChange } = props;

	const formConfig = form.form_configs[0];

	const { classes, cx } = useStyles();

	const [value, setValue] = useState<Descendant[]>([]);

	const renderElement = useCallback((props: any) => <Element {...props} />, []);
	const renderLeaf = useCallback((props: any) => <Leaf {...props} />, []);
	const editor = useMemo(() => withHistory(withReact(createEditor())), []);

	const onSave = () => {
		const html = serialize({ children: value });
		onConfigChange({
			displays: formConfig?.form_config_displays || [],
			labels: [
				...(formConfig?.form_config_labels || []),
				{
					kind: 'block',
					parent_id: block.id,
					label: html
				}
			]
		});
	};

	useEffect(() => {
		if (initialValue) {
			const formConfigLabel = formConfig?.form_config_labels.find(
				fcl => fcl.parent_id === block.id
			);
			const document = new DOMParser().parseFromString(
				formConfigLabel ? formConfigLabel.label : initialValue,
				'text/html'
			);
			setValue([{ children: deserialize(document.body) as Descendant[] }]);
		}
	}, [initialValue]);

	if (!value.length) return;

	return (
		<Slate
			editor={editor}
			initialValue={value}
			onChange={value => {
				setValue(value);
			}}
		>
			<div className={classes.toolbar}>
				<MarkButton
					format="bold"
					icon="ri-bold"
					title="Appliquer le style gras"
				/>
				<MarkButton
					format="italic"
					icon="ri-italic"
					title="Appliquer le style italic"
				/>
				<MarkButton
					format="underline"
					icon="ri-underline"
					title="Appliquer le style souligner"
				/>
			</div>
			<Editable
				className={cx(classes.editor)}
				renderElement={renderElement}
				renderLeaf={renderLeaf}
				placeholder="Entrez du texte..."
			/>
			<div className={cx(classes.submit)}>
				<Button
					priority="primary"
					iconId="ri-save-3-line"
					size="small"
					onClick={onSave}
				>
					Enregistrer les modifications
				</Button>
			</div>
		</Slate>
	);
};

const useStyles = tss.withName(MarkButton.name).create({
	toolbar: {
		display: 'flex',
		gap: fr.spacing('2v'),
		marginBottom: fr.spacing('2v')
	},
	editor: {
		padding: fr.spacing('2v'),
		border: `1px solid ${fr.colors.decisions.background.alt.grey.hover}`,
		p: {
			marginBottom: 0
		}
	},
	submit: {
		marginTop: fr.spacing('4v'),
		display: 'flex',
		justifyContent: 'flex-end'
	}
});

export default Editor;
