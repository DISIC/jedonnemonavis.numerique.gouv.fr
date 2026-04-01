import { FormWithElements } from '@/src/utils/types';
import { FormAnswers, getVisibleBlocks } from '@/src/utils/form-validation';
import { fr } from '@codegouvfr/react-dsfr';
import { SetStateAction } from 'react';
import { tss } from 'tss-react/dsfr';
import { FormBlockRenderer } from './FormBlockRenderer';
import { Stepper } from '@codegouvfr/react-dsfr/Stepper';

type Step = FormWithElements['form_template']['form_template_steps'][0];

interface Props {
	step: Step;
	form: FormWithElements;
	answers: FormAnswers;
	setAnswers: (value: SetStateAction<FormAnswers>) => void;
	currentStepIndex: number;
	totalSteps: number;
	isWidget?: boolean;
}

export const FormStepRenderer = (props: Props) => {
	const {
		step,
		form,
		answers,
		setAnswers,
		currentStepIndex,
		totalSteps,
		isWidget,
	} = props;
	const { classes, cx } = useStyles({ isWidget: !!isWidget });

	const formConfig = form.form_configs[0];

	const isStepHidden = formConfig?.form_config_displays?.some(
		d => d.kind === 'step' && d.parent_id === step.id && d.hidden,
	);

	if (isStepHidden) {
		return null;
	}

	const visibleBlocks = getVisibleBlocks(step.form_template_blocks, formConfig);

	const allBlocksRequired = visibleBlocks.every(block => block.isRequired);

	return (
		<div className={cx(classes.container)}>
			{form.form_template.hasStepper && totalSteps > 1 && (
				<>
					<h1
						className={cx(
							classes.title,
							fr.cx(isWidget ? 'fr-mb-2v' : 'fr-mb-12v'),
						)}
					>
						{step.title}
					</h1>
					<Stepper
						currentStep={currentStepIndex + 1}
						stepCount={totalSteps}
						title={step.title}
						className={fr.cx('fr-mb-12v')}
					/>
				</>
			)}

			{(!form.form_template.hasStepper || totalSteps === 1) && (
				<h1 className={cx(classes.subtitle)}>{step.title}</h1>
			)}

			<p className={fr.cx('fr-hint-text', 'fr-text--sm', 'fr-mb-3v')}>
				Sauf mention contraire, tous les champs sont obligatoires.
			</p>

			{visibleBlocks.map(block => (
				<FormBlockRenderer
					key={block.id}
					block={block}
					form={form}
					answers={answers}
					setAnswers={setAnswers}
					isWidget={isWidget}
				/>
			))}
		</div>
	);
};

const useStyles = tss
	.withName(FormStepRenderer.name)
	.withParams<{ isWidget: boolean }>()
	.create(({ isWidget }) => ({
		container: {
			display: 'flex',
			flexDirection: 'column',
			gap: isWidget ? fr.spacing('1v') : fr.spacing('6v'),
			...(isWidget && { paddingTop: 0 }),
		},
		title: {
			textAlign: isWidget ? 'left' : 'center',
			color: isWidget
				? fr.colors.decisions.text.title.grey.default
				: fr.colors.decisions.background.flat.blueFrance.default,
			marginBottom: 0,
			...(isWidget && { fontSize: '1.5rem', lineHeight: '2rem' }),
			[fr.breakpoints.down('md')]: {
				display: isWidget ? 'block' : 'none',
			},
		},
		subtitle: {
			color: isWidget
				? fr.colors.decisions.text.title.grey.default
				: fr.colors.decisions.background.flat.blueFrance.default,
			marginBottom: isWidget ? 0 : fr.spacing('10v'),
			textAlign: isWidget ? 'left' : 'center',
			...(isWidget && { fontSize: '1.5rem', lineHeight: '2rem' }),
		},
		asterisk: {
			color: fr.colors.decisions.text.actionHigh.redMarianne.default,
		},
	}));
