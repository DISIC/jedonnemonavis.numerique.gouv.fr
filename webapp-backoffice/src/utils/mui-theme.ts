import { createMuiDsfrThemeProvider } from '@codegouvfr/react-dsfr/mui';
import { createTheme } from '@mui/material/styles';

// DSFR focus ring, used instead of a blue background for focused list items
const listItemFocus = {
	backgroundColor: 'transparent !important',
	outline: '2px solid #0a76f6',
	outlineOffset: '-2px'
};

/** DSFR MUI theme provider, with app-specific overrides on top. */
export const { MuiDsfrThemeProvider } = createMuiDsfrThemeProvider({
	augmentMuiTheme: ({ nonAugmentedMuiTheme }) =>
		createTheme(nonAugmentedMuiTheme, {
			components: {
				MuiAutocomplete: {
					styleOverrides: {
						option: {
							'&.Mui-focused': listItemFocus,
							'&.Mui-focusVisible': listItemFocus
						}
					}
				},
				MuiMenuItem: {
					styleOverrides: {
						root: {
							'&.Mui-focusVisible': listItemFocus
						}
					}
				}
			}
		})
});
