import {
	FormConfigDisplayPartial,
	FormConfigLabelPartial
} from '@/prisma/generated/zod';
import { FormWithElements } from '@/src/types/prismaTypesExtended';
import { fr } from '@codegouvfr/react-dsfr';
import { Prisma } from '@prisma/client';
import React, { useEffect, useState } from 'react';
import { tss } from 'tss-react';
import FormStepDisplay from './FormStepDisplay';
import FormStepper from './FormStepper';

interface Props {
	form: FormWithElements;
	onChange: (config: Prisma.FormConfigUncheckedCreateInput) => void;
}

const FormConfigurator = (props: Props) => {
	const { form, onChange } = props;

	const { classes, cx } = useStyles();

	const [currentStep, setCurrentStep] = React.useState(
		form.form_template.form_template_steps[0]
	);

	const formConfig = form.form_configs[0];

	const [createConfig, setCreateConfig] =
		useState<Prisma.FormConfigUncheckedCreateInput>({
			form_id: form.id,
			form_config_displays: {
				create: formConfig ? formConfig.form_config_displays : []
			},
			form_config_labels: {
				create: formConfig ? formConfig.form_config_labels : []
			},
			status: 'published'
		});

	const onConfigChange = (config: {
		displays: FormConfigDisplayPartial[];
		labels: FormConfigLabelPartial[];
	}) => {
		const legitDisplays = config.displays.filter(
			d =>
				d.kind !== undefined &&
				d.hidden !== undefined &&
				d.parent_id !== undefined
		);

		const legitLabels = config.labels.filter(
			l => !!l.kind && !!l.label && !!l.parent_id
		);

		setCreateConfig({
			...createConfig,
			form_config_displays: {
				create: legitDisplays
			} as Prisma.FormConfigCreateArgs['data']['form_config_displays'],
			form_config_labels: {
				create: legitLabels
			} as Prisma.FormConfigCreateArgs['data']['form_config_labels']
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
		if (createConfig) {
			onChange(createConfig);
		}
	}, [createConfig]);

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
					onConfigChange={onConfigChange}
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
