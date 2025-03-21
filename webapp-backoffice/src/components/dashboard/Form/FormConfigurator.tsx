import { FormWithElements } from '@/src/types/prismaTypesExtended';
import { fr } from '@codegouvfr/react-dsfr';
import React from 'react';
import FormStepper from './FormStepper';
import FormStepDisplay from './FormStepDisplay';
import { tss } from 'tss-react';

interface Props {
	form: FormWithElements;
}

const FormConfigurator = (props: Props) => {
	const { form } = props;

	const { classes, cx } = useStyles();

	const [currentStep, setCurrentStep] = React.useState(
		form.form_template.form_template_steps[0]
	);

	const changeStep = (
		step: FormWithElements['form_template']['form_template_steps'][0]
	) => {
		setCurrentStep(step);
	};

	const goToSibilingStep = (to: 'previous' | 'next') => {
		const currentStepIndex = steps.findIndex(s => s.id === currentStep.id);

		if (to === 'previous' && currentStepIndex - 1 >= 0) {
			changeStep(steps[currentStepIndex - 1]);
		}

		if (to === 'next' && currentStepIndex + 1 < steps.length) {
			changeStep(steps[currentStepIndex + 1]);
		}
	};

	const steps = form.form_template.form_template_steps;

	return (
		<div className={cx(classes.container, fr.cx('fr-grid-row'))}>
			<div className={fr.cx('fr-col-3')}>
				<FormStepper
					steps={steps}
					onClick={changeStep}
					currentStep={currentStep}
				/>
			</div>
			<div className={fr.cx('fr-col-9')}>
				<FormStepDisplay
					step={currentStep}
					form={form}
					changeStep={goToSibilingStep}
				/>
			</div>
		</div>
	);
};

const useStyles = tss.withName(FormConfigurator.name).create({
	container: {
		height: '100%'
	}
});

export default FormConfigurator;
