import { FormConfigHelper } from '@/src/pages/administration/dashboard/product/[id]/forms/[form_id]/edit';
import { FormWithElements } from '@/src/types/prismaTypesExtended';
import { getHelperFromFormConfig } from '@/src/utils/tools';
import { fr } from '@codegouvfr/react-dsfr';
import React, { useEffect, useRef, useState } from 'react';
import { tss } from 'tss-react';
import useModifiedSteps from '../../../hooks/dashboard/form/useModifiedSteps';
import FormStepDisplay from './FormStepDisplay';
import FormStepper, { FormStepperHandle } from './FormStepper';

type Step = FormWithElements['form_template']['form_template_steps'][0];

interface Props {
	form: FormWithElements;
	hasConfigChanged: boolean;
	onChange: (configHelper: FormConfigHelper) => void;
	onPublish?: () => void;
	onStepChange?: (step: Step) => void;
	isExternalPublish?: boolean;
}

const FormConfigurator = (props: Props) => {
	const {
		form,
		hasConfigChanged,
		isExternalPublish,
		onChange,
		onPublish,
		onStepChange
	} = props;
	const formConfig = form.form_configs[0];

	const { classes, cx } = useStyles();
	const stepperRef = useRef<FormStepperHandle>(null);

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

	const changeStep = (step: Step) => {
		setCurrentStep(step);
	};

	const goToSibilingStep = (to: 'previous' | 'next') => {
		const currentStepIndex = steps.findIndex(s => s.id === currentStep.id);
		const targetStep =
			steps[to === 'previous' ? currentStepIndex - 1 : currentStepIndex + 1];

		if (!targetStep) return;

		changeStep(targetStep);
		stepperRef.current?.focusStep(targetStep.id);
	};

	useEffect(() => {
		onStepChange?.(currentStep);
	}, [currentStep]);

	useEffect(() => {
		if (tmpConfigHelper) {
			onChange(tmpConfigHelper);
		}
	}, [tmpConfigHelper]);

	const steps = form.form_template.form_template_steps;

	return (
		<div className={cx(classes.container, fr.cx('fr-grid-row'))}>
			<div className={fr.cx('fr-col-12', 'fr-col-md-3')}>
				<FormStepper
					ref={stepperRef}
					steps={steps}
					onClick={changeStep}
					currentStep={currentStep}
					configHelper={tmpConfigHelper}
					form={form}
					isStepModified={isStepModified}
				/>
			</div>
			<div className={fr.cx('fr-col-12', 'fr-col-md-9')}>
				<FormStepDisplay
					step={currentStep}
					form={form}
					configHelper={tmpConfigHelper}
					hasConfigChanged={hasConfigChanged}
					changeStep={goToSibilingStep}
					onConfigChange={onConfigChange}
					onPublish={onPublish}
					isStepModified={isStepModified}
					isExternalPublish={isExternalPublish}
				/>
			</div>
		</div>
	);
};

const useStyles = tss.withName({ FormConfigurator }).create({
	container: {
		height: '100%',
		[fr.breakpoints.down('md')]: {
			flexDirection: 'column',
			flexWrap: 'nowrap',
			'& > [class*="fr-col"]': {
				flex: '0 0 auto'
			}
		}
	}
});

export default FormConfigurator;
