import { fr, FrIconClassName, RiIconClassName } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { Editor, Transforms } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import { tss } from 'tss-react';

const isMarkActive = (editor: Editor, format: string) => {
	const marks = Editor.marks(editor) as any;
	return marks ? marks[format] === true : false;
};

export const toggleMark = (editor: Editor, format: string) => {
	const isActive = isMarkActive(editor, format);
	if (isActive) {
		Editor.removeMark(editor, format);
	} else {
		Editor.addMark(editor, format, true);
	}
};

const MarkButton = ({
	format,
	icon,
	title
}: {
	format: string;
	icon: FrIconClassName | RiIconClassName;
	title: string;
}) => {
	const editor = useSlate();

	const { classes, cx } = useStyles();
	const isActive = isMarkActive(editor, format);

	return (
		<Button
			className={cx(classes.button)}
			priority={isActive ? 'primary' : 'secondary'}
			title={title}
			type="button"
			nativeButtonProps={{
				'aria-pressed': isActive,
				onMouseDown: event => event.preventDefault(),
				onClick: () => {
					if (!editor.selection) {
						Transforms.select(editor, Editor.end(editor, []));
					}
					toggleMark(editor, format);
					ReactEditor.focus(editor as ReactEditor);
				}
			}}
		>
			<span className={fr.cx(icon)} aria-hidden="true" />
		</Button>
	);
};

const useStyles = tss.withName({ MarkButton }).create({
	button: {
		width: fr.spacing('10v'),
		height: fr.spacing('10v'),
		justifyContent: 'center',
		minHeight: 0,
		padding: 0,
		'& > span::before': {
			'--icon-size': fr.spacing('4v')
		}
	}
});

export default MarkButton;
