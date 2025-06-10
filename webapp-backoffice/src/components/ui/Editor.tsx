import { FormConfigHelper } from '@/src/pages/administration/dashboard/product/[id]/forms/[form_id]';
import { FormWithElements } from '@/src/types/prismaTypesExtended';
import { deserialize, serialize } from '@/src/utils/slate';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BaseEditor, createEditor, Descendant, Node, Text } from 'slate';
import { withHistory } from 'slate-history';
import { Editable, Slate, withReact } from 'slate-react';
import { tss } from 'tss-react';
import Element from './editor/Element';
import Leaf from './editor/Leaf';
import MarkButton from './editor/MarkButton';

interface Props {
	form: FormWithElements;
	block: FormWithElements['form_template']['form_template_steps'][0]['form_template_blocks'][0];
	initialValue: string | null;
	configHelper: FormConfigHelper;
	onConfigChange: (config: FormConfigHelper) => void;
	onCancel?: () => void;
}

const MAX_LENGTH = 250;
const getTextLength = (editor: BaseEditor) => {
	let length = 0;

	for (const [node] of Array.from(Node.nodes(editor))) {
		if (Text.isText(node)) {
			length += node.text.length;
		}
	}

	return length;
};

const Editor = (props: Props) => {
	const { form, block, configHelper, initialValue, onConfigChange, onCancel } = props;

	const { classes, cx } = useStyles();

	const [value, setValue] = useState<Descendant[]>([]);
	const [hasConfig, setHasConfig] = useState(false);
	const [textLength, setTextLength] = useState(0);

	const renderElement = useCallback((props: any) => <Element {...props} />, []);
	const renderLeaf = useCallback((props: any) => <Leaf {...props} />, []);
	const editor = useMemo(() => withHistory(withReact(createEditor())), []);

	const onSave = () => {
		const html = serialize({ children: value });
		onConfigChange({
			displays: configHelper.displays,
			labels: [
				...configHelper.labels.filter(l => l.parent_id !== block.id),
				{
					label: html,
					parent_id: block.id,
					kind: 'block'
				}
			]
		});
	};

	const onReset = () => {
		onConfigChange({
			displays: configHelper.displays,
			labels: [...configHelper.labels.filter(l => l.parent_id !== block.id)]
		});
	};

	useEffect(() => {
		if (value.length > 0) {
			const length = getTextLength(editor);
			setTextLength(length);
		}
	}, [value, editor, getTextLength]);

	useEffect(() => {
		if (initialValue) {
			const finalValue = initialValue.replace('{{title}}', form.product.title);
			const formConfigLabel = configHelper.labels.find(
				fcl => fcl.parent_id === block.id
			);
			setHasConfig(!!formConfigLabel);
			const document = new DOMParser().parseFromString(
				formConfigLabel ? formConfigLabel.label : finalValue,
				'text/html'
			);
			const parsedValue = [
				{ children: deserialize(document.body) as Descendant[] }
			];
			setValue(parsedValue);

			editor.children = parsedValue;
			const length = getTextLength(editor);
			setTextLength(length);
		}
	}, [initialValue]);

	if (!value.length) return;

	const hasReachedMaxLength = textLength > MAX_LENGTH;

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
			</div>
			<p className={fr.cx('fr-hint-text', 'fr-mb-2v')}>
				Maximum {MAX_LENGTH} caractères
			</p>
			<Editable
				className={cx(classes.editor)}
				renderElement={renderElement}
				maxLength={250}
				renderLeaf={renderLeaf}
				placeholder="Entrez du texte..."
			/>
			{hasReachedMaxLength ? (
				<div className={fr.cx('fr-error-text')}>
					Limite de caractères dépassée ({getTextLength(editor)} / {MAX_LENGTH})
				</div>
			) : (
				<div className={cx(classes.nbCharsHint, fr.cx('fr-hint-text'))}>
					{getTextLength(editor)} / {MAX_LENGTH}
				</div>
			)}
			<div className={cx(classes.submit)}>
				<div>
					<Button
						priority="secondary"
						onClick={onCancel}
					>
						Annuler
					</Button>
				</div>
				<div className={classes.rightButtonsWrapper}>
					{hasConfig && (
						<Button
							priority="secondary"
							iconId="ri-arrow-go-back-line"
							iconPosition="right"
							onClick={onReset}
						>
							Réinitialiser
						</Button>
					)}
					<Button
						disabled={hasReachedMaxLength || !textLength}
						priority="primary"
						onClick={onSave}
					>
						Valider
					</Button>
				</div>
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
		borderRadius: '0.25rem 0.25rem 0 0',
		backgroundColor: fr.colors.decisions.background.contrast.grey.default,
		minHeight: `${fr.spacing('28v')} !important`,
		'--idle': 'transparent',
		'--hover': fr.colors.decisions.background.contrast.grey.hover,
		'--active': fr.colors.decisions.background.contrast.grey.active,
		boxShadow: `inset 0 -2px 0 0 ${fr.colors.decisions.border.plain.grey.default}`,
		p: {
			marginBottom: 0
		},
		'[data-slate-placeholder="true"]': {
			top: `${fr.spacing('2v')} !important`
		}
	},
	submit: {
		marginTop: fr.spacing('4v'),
		display: 'flex',
		justifyContent: 'space-between'
	},
	rightButtonsWrapper: {
		display: 'flex',
		gap: fr.spacing('4v'),
	},
	nbCharsHint: {
		textAlign: 'right',
		marginTop: fr.spacing('1v')
	}
});

export default Editor;
