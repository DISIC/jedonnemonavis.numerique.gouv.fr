import { fr, FrIconClassName, RiIconClassName } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { Editor } from 'slate';
import { useSlate } from 'slate-react';
import { tss } from 'tss-react';

const isMarkActive = (editor: Editor, format: string) => {
	const marks = Editor.marks(editor) as any;
	return marks ? marks[format] === true : false;
};

const toggleMark = (editor: Editor, format: string) => {
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

	return (
		<Button
			className={cx(classes.button)}
			priority={isMarkActive(editor, format) ? 'primary' : 'secondary'}
			title={title}
			nativeButtonProps={{
				onMouseDown: event => {
					event.preventDefault();
					toggleMark(editor, format);
				}
			}}
		>
			<span className={fr.cx(icon)} />
		</Button>
	);
};

const useStyles = tss.withName(MarkButton.name).create({
	button: {
		width: fr.spacing('6v'),
		height: fr.spacing('6v'),
		justifyContent: 'center',
		minHeight: 0,
		padding: 0,
		'& > span::before': {
			'--icon-size': fr.spacing('4v')
		}
	}
});

export default MarkButton;
