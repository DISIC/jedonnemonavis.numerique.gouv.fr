import { FormConfigHelper } from '@/src/pages/administration/dashboard/product/[id]/forms/[form_id]/edit';
import { FormWithElements } from '@/src/types/prismaTypesExtended';
import { fr } from '@codegouvfr/react-dsfr';
import Badge from '@codegouvfr/react-dsfr/Badge';
import { tss } from 'tss-react';

type Step = FormWithElements['form_template']['form_template_steps'][0];
interface Props {
	steps: Step[];
	configHelper: FormConfigHelper;
	onClick: (step: Step) => void;
	currentStep: Step;
	form: FormWithElements;
	isStepModified: (stepId: number) => boolean;
}

const FormStepper = (props: Props) => {
	const { steps, configHelper, onClick, currentStep, form, isStepModified } =
		props;
	const { classes, cx } = useStyles();

	return (
		<div className={cx(classes.container)}>
			{steps.map(step => {
				const isHidden = configHelper.displays.some(
					d => d.kind === 'step' && d.parent_id === step.id && d.hidden
				);

				return (
					<button
						title={`Aller à l'étape ${step.title}`}
						disabled={step.id === currentStep.id}
						key={step.id}
						className={cx(
							classes.step,
							step.id === currentStep.id ? classes.currentStep : null,
							isHidden ? classes.hiddenStep : null
						)}
						onClick={() => onClick(step)}
					>
						{step.title}
						<br />
						{isHidden && (
							<Badge className={cx(classes.hiddenBadge)} small>
								<span className={fr.cx('ri-eye-off-line', 'fr-mr-1v')} />
								étape masquée
							</Badge>
						)}
						{!isHidden && isStepModified(step.id) && (
							<Badge className={cx(classes.modifiedBadge)} small>
								étape modifiée
							</Badge>
						)}
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
		borderLeft: `8px solid ${fr.colors.decisions.background.default.grey.default}`,
		borderColor: `${fr.colors.decisions.background.default.grey.default} !important`
	},
	hiddenStep: {
		color: `${fr.colors.decisions.background.actionLow.blueFrance.hover} !important`,
		paddingTop: fr.spacing('1v'),
		paddingBottom: fr.spacing('1v'),
		borderLeft: `4px dotted ${fr.colors.decisions.border.default.blueFrance.default}`,
		'.ri-eye-off-line::before': {
			'--icon-size': '1rem'
		}
	},
	hiddenBadge: {
		backgroundColor: fr.colors.decisions.background.alt.grey.active
	},
	modifiedBadge: {
		backgroundColor:
			fr.colors.decisions.background.contrast.yellowTournesol.default
	}
});

export default FormStepper;
