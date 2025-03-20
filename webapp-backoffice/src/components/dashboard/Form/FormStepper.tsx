import { FormWithElements } from '@/src/types/prismaTypesExtended';
import { fr } from '@codegouvfr/react-dsfr';
import React from 'react';
import { tss } from 'tss-react';

type Step = FormWithElements['form_template']['form_template_steps'][0];
interface Props {
	steps: Step[];
	onClick: (step: Step) => void;
	currentStep: Step;
}

const FormStepper = (props: Props) => {
	const { steps, onClick, currentStep } = props;
	const { classes, cx } = useStyles();

	return (
		<div className={cx(classes.container)}>
			{steps.map(step => {
				return (
					<button
						title={`Aller à l'étape ${step.title}`}
						disabled={step.id === currentStep.id}
						key={step.id}
						className={cx(
							classes.step,
							step.id === currentStep.id ? classes.currentStep : ''
						)}
						onClick={() => onClick(step)}
					>
						{step.title}
					</button>
				);
			})}
		</div>
	);
};

const useStyles = tss.withName(FormStepper.name).create({
	container: {
		height: '100%',
		display: 'flex',
		flexDirection: 'column',
		gap: fr.spacing('3v'),
		backgroundColor: fr.colors.decisions.background.flat.blueFrance.default,
		padding: fr.spacing('6v'),
		color: fr.colors.decisions.background.default.grey.default
	},
	step: {
		textAlign: 'left',
		fontWeight: 'bold',
		borderLeft: `4px solid ${fr.colors.decisions.border.default.blueFrance.default}`,
		padding: fr.spacing('3v'),
		'&:hover': {
			borderColor: fr.colors.decisions.background.default.grey.default,
			backgroundColor: 'transparent !important'
		},
		'&:disabled': {
			color: fr.colors.decisions.background.default.grey.default,
			cursor: 'pointer'
		}
	},
	currentStep: {
		borderLeft: `8px solid ${fr.colors.decisions.background.default.grey.default}`
	}
});

export default FormStepper;
