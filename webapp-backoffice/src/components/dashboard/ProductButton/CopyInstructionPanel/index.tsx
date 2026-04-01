import Tabs from '@codegouvfr/react-dsfr/Tabs';
import React from 'react';
import { tss } from 'tss-react/dsfr';
import { fr } from '@codegouvfr/react-dsfr';
import { ButtonCopyInstructionsPanelProps } from './interface';
import ButtonInstructionTab from './ButtonInstructionTab';
import Notice from '@codegouvfr/react-dsfr/Notice';

const ButtonCopyInstructionsPanel = ({
	buttonStyle,
	button,
	formTemplateButton,
	integrationType
}: ButtonCopyInstructionsPanelProps) => {
	const { cx, classes } = useStyles();

	if (!button)
		return (
			<Notice
				title="Aucun bouton trouvé"
				severity="alert"
				description={
					<>
						Il semblerait que le bouton que vous avez créé n'ait pas été
						retrouvé. Veuillez réessayer ou contacter le support si le problème
						persiste.
					</>
				}
			/>
		);

	if (!buttonStyle) {
		return (
			<ButtonInstructionTab button={button} integrationType={integrationType} />
		);
	}

	if (integrationType === 'modal') {
		return (
			<ButtonInstructionTab
				buttonStyle={buttonStyle}
				button={button}
				formTemplateButton={formTemplateButton}
				integrationType={integrationType}
			/>
		);
	}

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
							integrationType={integrationType}
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
							integrationType={integrationType}
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
