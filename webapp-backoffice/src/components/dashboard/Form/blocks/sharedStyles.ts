import { fr } from '@codegouvfr/react-dsfr';

/**
 * Keeps readable contrast on labels of disabled inputs used as previews
 * (DSFR greys them out). `input` is the selector of the disabled inputs.
 */
export const keepDisabledContrast = (input = '.fr-fieldset input') => ({
	[`& ${input}:disabled + label`]: {
		color: fr.colors.decisions.text.label.grey.default
	},
	[`& ${input}:disabled + label .fr-hint-text`]: {
		color: fr.colors.decisions.text.mention.grey.default
	}
});

/** "Option masquée" badge placed under the option label on mobile. */
export const hiddenBadgeMobile = {
	[fr.breakpoints.down('md')]: {
		display: 'flex',
		width: 'fit-content',
		marginLeft: '0 !important',
		marginTop: fr.spacing('1v')
	}
};
