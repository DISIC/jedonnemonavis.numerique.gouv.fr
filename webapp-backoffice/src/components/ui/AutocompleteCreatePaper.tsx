import { fr } from '@codegouvfr/react-dsfr';
import Paper, { PaperProps } from '@mui/material/Paper';
import React, { forwardRef, useRef, useState, type Ref } from 'react';
import { tss } from 'tss-react/dsfr';

export type AutocompleteCreatePaperProps = PaperProps & {
	/** Called when the "create" button is activated. No button if omitted. */
	onCreate?: () => void;
	createLabel?: string;
	createButtonRef?: Ref<HTMLButtonElement>;
	/** Lets the parent close the popup when focus leaves the button. */
	onCreateButtonBlur?: (e: React.FocusEvent<HTMLButtonElement>) => void;
};

/**
 * MUI Autocomplete popup (`PaperComponent`) that renders the options list
 * (`<ul role="listbox">` with `<li>` options) followed by a real "create"
 * button, instead of a fake option inside the list.
 *
 * Pass the extra props through `slotProps.paper`.
 */
const AutocompleteCreatePaper = forwardRef<
	HTMLDivElement,
	AutocompleteCreatePaperProps
>(
	(
		{
			children,
			onCreate,
			createLabel = 'Créer',
			createButtonRef,
			onCreateButtonBlur,
			...rest
		},
		ref
	) => {
		const { classes, cx } = useStyles();

		return (
			<Paper ref={ref} {...rest}>
				{children}
				{onCreate && (
					<div>
						<button
							ref={createButtonRef}
							type="button"
							className={cx(classes.button)}
							// Keep focus in the input on mouse click so the popup does not
							// close (and unmount this button) before the click fires
							onMouseDown={e => e.preventDefault()}
							onClick={onCreate}
							onBlur={onCreateButtonBlur}
						>
							<span className={fr.cx('fr-mr-2v')}>{createLabel}</span>
							<i
								className={fr.cx('fr-icon-add-circle-line')}
								aria-hidden="true"
							/>
						</button>
					</div>
				)}
			</Paper>
		);
	}
);

AutocompleteCreatePaper.displayName = 'AutocompleteCreatePaper';

/**
 * Open state for an Autocomplete using `AutocompleteCreatePaper`.
 *
 * Tabbing from the input to the create button blurs the input, which would
 * normally close the popup and remove the button: keep it open in that case,
 * and close it once focus leaves the button for anything but the input.
 *
 * Spread `autocompleteProps` on the Autocomplete.
 */
export const useAutocompleteCreateButton = ({
	onCreate,
	createLabel
}: {
	onCreate?: () => void;
	createLabel: string;
}) => {
	const [open, setOpen] = useState(false);
	const createButtonRef = useRef<HTMLButtonElement>(null);

	const paperProps: AutocompleteCreatePaperProps = {
		onCreate: onCreate
			? () => {
					setOpen(false);
					onCreate();
			  }
			: undefined,
		createLabel,
		createButtonRef,
		onCreateButtonBlur: e => {
			const next = e.relatedTarget as HTMLElement | null;
			if (next?.getAttribute('role') !== 'combobox') setOpen(false);
		}
	};

	return {
		autocompleteProps: {
			open,
			onOpen: () => setOpen(true),
			onClose: (event: React.SyntheticEvent, reason: string) => {
				const next = (event as React.FocusEvent).relatedTarget;
				if (reason === 'blur' && next && next === createButtonRef.current) {
					return;
				}
				setOpen(false);
			},
			PaperComponent: AutocompleteCreatePaper,
			slotProps: { paper: paperProps as PaperProps }
		}
	};
};

const useStyles = tss.withName({ AutocompleteCreatePaper }).create({
	// Same look as the former "Créer une nouvelle organisation" option
	button: {
		width: '100%',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		padding: fr.spacing('3v'),
		border: 'none',
		fontSize: '1rem',
		color: 'white',
		backgroundColor:
			fr.colors.decisions.background.actionHigh.blueFrance.default,
		cursor: 'pointer',
		// No hover change: keep the default look (also overrides DSFR's button hover tint)
		'&:hover': {
			backgroundColor: `${fr.colors.decisions.background.actionHigh.blueFrance.default} !important`,
			color: 'white'
		},
		'& i::before': {
			'--icon-size': '1.1rem'
		},
		// Same inset blue ring as the focused list options (see utils/mui-theme.ts)
		'&:focus-visible': {
			outline: '2px solid #0a76f6',
			outlineOffset: '-2px'
		}
	}
});

export default AutocompleteCreatePaper;
