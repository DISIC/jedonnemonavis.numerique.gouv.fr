import Tabs from '@codegouvfr/react-dsfr/Tabs';
import React from 'react';
import { tss } from 'tss-react/dsfr';
import { fr } from '@codegouvfr/react-dsfr';
import { ButtonCopyInstructionsPanelProps } from './interface';
import ButtonInstructionTab from './ButtonInstructionTab';

const ButtonCopyInstructionsPanel = ({
	buttonStyle,
	button,
	formTemplateButton
}: ButtonCopyInstructionsPanelProps) => {
	const { cx, classes } = useStyles();
	return (
		<Tabs
			tabs={[
				{
					label: 'Directement sur votre site',
					content: (
						<ButtonInstructionTab
							buttonStyle={buttonStyle}
							button={button}
							formTemplateButton={formTemplateButton}
						/>
					)
				},
				{
					label: 'Via Démarches Simplifiées',
					content: (
						<ButtonInstructionTab
							buttonStyle={buttonStyle}
							button={button}
							formTemplateButton={formTemplateButton}
							isForDemarchesSimplifiees
						/>
					)
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
