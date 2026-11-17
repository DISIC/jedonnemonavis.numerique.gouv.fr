import { FormConfigHelper } from '@/src/pages/administration/dashboard/product/[id]/forms/[form_id]/edit';
import { FormWithElements } from '@/src/types/prismaTypesExtended';
import { fr } from '@codegouvfr/react-dsfr';
import Badge from '@codegouvfr/react-dsfr/Badge';
import { useId } from 'react';
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
	const { steps, configHelper, onClick, currentStep, isStepModified } = props;
	const { classes, cx } = useStyles();

	const collapseId = useId();

	return (
		<div className={cx(classes.container)}>
			<nav
				className={cx(fr.cx('fr-sidemenu'), classes.sideMenu)}
				aria-label="Étapes du formulaire"
			>
				<div className={fr.cx('fr-sidemenu__inner')}>
					<button
						type="button"
						hidden
						aria-expanded="false"
						aria-controls={collapseId}
						className={fr.cx('fr-sidemenu__btn')}
					>
						Étapes du formulaire
					</button>
					<div className={fr.cx('fr-collapse')} id={collapseId}>
						<ul className={fr.cx('fr-sidemenu__list')}>
							{steps.map(step => {
								const isHidden = configHelper.displays.some(
									d => d.kind === 'step' && d.parent_id === step.id && d.hidden
								);
								const isCurrent = step.id === currentStep.id;

								return (
									<li key={step.id} className={fr.cx('fr-sidemenu__item')}>
										<button
											type="button"
											className={fr.cx('fr-sidemenu__link')}
											aria-current={isCurrent ? 'step' : undefined}
											onClick={() => {
												if (!isCurrent) onClick(step);
											}}
										>
											<span className={cx(classes.itemContent)}>
												{step.title}
												{isHidden && (
													<Badge
														as="span"
														className={cx(classes.hiddenBadge)}
														small
													>
														<span
															className={fr.cx('ri-eye-off-line', 'fr-mr-1v')}
															aria-hidden="true"
														/>
														étape masquée
													</Badge>
												)}
												{!isHidden && isStepModified(step.id) && (
													<Badge
														as="span"
														className={cx(classes.modifiedBadge)}
														small
													>
														étape modifiée
													</Badge>
												)}
											</span>
										</button>
									</li>
								);
							})}
						</ul>
					</div>
				</div>
			</nav>
		</div>
	);
};

const useStyles = tss.withName({ FormStepper }).create({
	container: {
		height: '100%',
		width: '100%',
		backgroundColor: fr.colors.decisions.background.flat.blueFrance.default,
		padding: fr.spacing('6v'),
		color: fr.colors.decisions.background.default.grey.default,
	},
	sideMenu: {
		'&&': {
			marginLeft: 0,
			marginRight: 0
		},
		// Light text and active bar on the dark blue background
		'.fr-sidemenu__inner': {
			boxShadow: 'none'
		},
		'.fr-sidemenu__list': {
			display: 'flex',
			flexDirection: 'column',
			gap: '12px'
		},
		'.fr-sidemenu__link, .fr-sidemenu__btn': {
			color: `${fr.colors.decisions.background.default.grey.default} !important`,
			paddingLeft: '20px',
			'&:hover': {
				backgroundColor: 'transparent !important',
				textDecoration: 'underline'
			}
		},
		'.fr-sidemenu__link[aria-current]:not([aria-current=false])::before': {
			backgroundColor: fr.colors.decisions.background.default.grey.default,
			width: '8px',
			top: 0,
			bottom: 0
		}
	},
	itemContent: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'flex-start',
		gap: fr.spacing('1v'),
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
