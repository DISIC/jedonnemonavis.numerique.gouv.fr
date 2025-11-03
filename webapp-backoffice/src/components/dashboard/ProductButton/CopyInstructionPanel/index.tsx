import Tabs from '@codegouvfr/react-dsfr/Tabs';
import React from 'react';
import DefaultTab from './DefaultTab';
import DSTab from './DSTab';
import { tss } from 'tss-react/dsfr';
import { fr } from '@codegouvfr/react-dsfr';
import { ButtonCopyInstructionsPanelProps } from './interface';

const ButtonCopyInstructionsPanel = ({
	buttonColor,
	button
}: ButtonCopyInstructionsPanelProps) => {
	const { cx, classes } = useStyles();
	return (
		<Tabs
			tabs={[
				{
					label: 'Directement sur votre site',
					content: <DefaultTab buttonColor={buttonColor} button={button} />
				},
				{
					label: 'Via Démarches Simplifiées',
					content: <DSTab />
				}
			]}
			className={cx(classes.tabContainer)}
		/>
	);
};

export default ButtonCopyInstructionsPanel;

const useStyles = tss.create(() => ({
	tabContainer: {
		'&, &::before': {
			boxShadow: 'none'
		},
		'.fr-tabs__list, .fr-tabs__panel': {
			...fr.spacing('padding', { rightLeft: 0, bottom: 0 })
		},
		'.fr-tabs__tab:first-of-type': {
			marginLeft: 0
		}
	}
}));
