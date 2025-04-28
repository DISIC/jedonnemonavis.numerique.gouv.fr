import { FormConfigHelper } from '@/src/pages/administration/dashboard/product/[id]/forms/[form_id]';
import { FormWithElements } from '@/src/types/prismaTypesExtended';
import { fr } from '@codegouvfr/react-dsfr';
import React, { useEffect, useState } from 'react';
import { tss } from 'tss-react';
import FormStepDisplay from './FormStepDisplay';
import FormStepper from './FormStepper';
import { getHelperFromFormConfig } from '@/src/utils/tools';
import useModifiedSteps from '../../../hooks/dashboard/form/useModifiedSteps';

interface Props {
	form: FormWithElements;
	hasConfigChanged: boolean;
	onChange: (configHelper: FormConfigHelper) => void;
	onPublish: () => void;
}

const FormConfigurator = (props: Props) => {
	const { form, hasConfigChanged, onChange, onPublish } = props;
	const formConfig = form.form_configs[0];

	const { classes, cx } = useStyles();

	const [currentStep, setCurrentStep] = React.useState(
		form.form_template.form_template_steps[0]
	);
	const [tmpConfigHelper, setTmpConfigHelper] = useState<FormConfigHelper>(
		getHelperFromFormConfig(formConfig)
	);
	const { isStepModified, modifiedSteps, recalculateModifiedSteps } =
		useModifiedSteps(
			form.form_template.form_template_steps,
			tmpConfigHelper,
			form
		);

	const onConfigChange = (config: FormConfigHelper) => {
		const legitDisplays = config.displays.filter(
			d =>
				d.kind !== undefined &&
				d.hidden !== undefined &&
				d.parent_id !== undefined
		);

		const legitLabels = config.labels.filter(
			l => !!l.kind && !!l.label && !!l.parent_id
		);

		setTmpConfigHelper({
			displays: legitDisplays,
			labels: legitLabels
		});
	};

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

	useEffect(() => {
		if (tmpConfigHelper) {
			onChange(tmpConfigHelper);
		}
	}, [tmpConfigHelper]);

	const steps = form.form_template.form_template_steps;

	return (
		<div className={cx(classes.container, fr.cx('fr-grid-row'))}>
			<div className={fr.cx('fr-col-3')}>
				<FormStepper
					steps={steps}
					onClick={changeStep}
					currentStep={currentStep}
					configHelper={tmpConfigHelper}
					form={form}
					isStepModified={isStepModified}
				/>
			</div>
			<div className={fr.cx('fr-col-9')}>
				<FormStepDisplay
					step={currentStep}
					form={form}
					configHelper={tmpConfigHelper}
					hasConfigChanged={hasConfigChanged}
					changeStep={goToSibilingStep}
					onConfigChange={onConfigChange}
					onPublish={onPublish}
					isStepModified={isStepModified}
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
