import { FormConfigHelper } from '@/src/pages/administration/dashboard/product/[id]/forms/[form_id]/edit';
import { FormWithElements } from '@/src/types/prismaTypesExtended';
import { fr } from '@codegouvfr/react-dsfr';
import Badge from '@codegouvfr/react-dsfr/Badge';
import Button from '@codegouvfr/react-dsfr/Button';
import { Tooltip } from '@codegouvfr/react-dsfr/Tooltip';
import { FormConfigKind } from '@prisma/client';
import { useEffect, useState } from 'react';
import { tss } from 'tss-react';
import RootScales from './custom/RootScales';
import RootYesNo from './custom/RootYesNo';
import FormBlockDisplay from './FormBlockDisplay';

type Step = FormWithElements['form_template']['form_template_steps'][0];
interface Props {
	step: Step;
	form: FormWithElements;
	configHelper: FormConfigHelper;
	hasConfigChanged: boolean;
	isExternalPublish?: boolean;
	changeStep: (to: 'previous' | 'next') => void;
	onConfigChange: (config: FormConfigHelper) => void;
	onPublish?: () => void;
	isStepModified: (stepId: number) => boolean;
}

const FormStepDisplay = (props: Props) => {
	const {
		step,
		form,
		configHelper,
		hasConfigChanged,
		isExternalPublish,
		changeStep,
		onConfigChange,
		onPublish,
		isStepModified
	} = props;

	const { classes, cx } = useStyles();

	const currentStepIndex = form.form_template.form_template_steps.findIndex(
		s => s.id === step.id
	);

	const [isHidden, setIsHidden] = useState(
		configHelper.displays.some(
			d => d.kind === 'step' && d.parent_id === step.id
		)
	);

	useEffect(() => {
		setIsHidden(
			configHelper.displays.some(
				d => d.kind === 'step' && d.parent_id === step.id
			)
		);
	}, [step, configHelper]);

	useEffect(() => {
		onConfigChange({
			displays: [
				...configHelper.displays.filter(
					d => !(d.parent_id === step.id && d.kind === 'step')
				),
				...(isHidden
					? [
							{
								hidden: true,
								parent_id: step.id,
								kind: 'step' as FormConfigKind
							}
						]
					: [])
			],
			labels: configHelper.labels
		});
	}, [isHidden]);

	return (
		<div
			className={cx(
				classes.container,
				isHidden ? classes.containerHidden : null
			)}
		>
			<div
				className={cx(classes.box, !step.isHideable && classes.nonEditableBox)}
			>
				<div className={cx(classes.header)}>
					<div className={cx(classes.headerInfo)}>
						<h2 className={fr.cx('fr-mr-2v')}>{step.title} </h2>
						{step.description && (
							<Tooltip
								className={classes.tooltip}
								kind="hover"
								title={
									<>
										<b>Pourquoi cette étape ?</b>
										<br />
										<span
											className={classes.description}
											dangerouslySetInnerHTML={{
												__html: step.description.replaceAll('\n', '<br/>')
											}}
										/>
									</>
								}
							/>
						)}

						<div className={cx(classes.badgeContainer)}>
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
						</div>
					</div>
					<div>
						{step.isHideable ? (
							<Button
								priority="secondary"
								iconId={isHidden ? 'ri-eye-line' : 'ri-eye-off-line'}
								iconPosition="right"
								onClick={() => {
									setIsHidden(!isHidden);
								}}
								disabled={!step.isHideable}
							>
								{isHidden ? "Afficher l'étape" : "Masquer l'étape"}
							</Button>
						) : (
							<Badge severity="info" noIcon>
								Étape obligatoire
							</Badge>
						)}
					</div>
				</div>
				{isHidden && (
					<>
						<hr className={fr.cx('fr-mt-8v', 'fr-mb-7v', 'fr-pb-1v')} />
						<div className={cx(classes.boxDisabled)}>
							{isHidden && (
								<p
									className={cx(
										classes.disabledAlertMessage,
										fr.cx('fr-mr-2v', 'fr-mb-0')
									)}
								>
									<span className={fr.cx('ri-alert-fill', 'fr-mr-1v')} />
								</p>
							)}
							<p className={fr.cx('fr-mb-0')}>
								{`${isHidden ? 'Cette étape est masquée sur le formulaire usager mais vous pouvez visualiser son contenu.' : "Cette étape n'est pas masquable."}`}
							</p>
						</div>
					</>
				)}
			</div>
			{step.form_template_blocks.map(block => {
				// CUSTOM DISPLAY FOR OBSERVATOIRE WEIRD CONDITIONS
				if (
					form.form_template.slug === 'root' &&
					step.position === 2 &&
					block.position > 0
				) {
					if (block.position === 1) {
						return (
							<div
								key={block.id}
								className={cx(classes.box, classes.nonEditableBox)}
							>
								<RootYesNo
									block={block}
									step={step}
									disabled={isHidden}
									configHelper={configHelper}
								/>
							</div>
						);
					}

					if (block.position === 6) {
						return (
							<div
								key={block.id}
								className={cx(classes.box, classes.nonEditableBox)}
							>
								<RootScales
									block={block}
									step={step}
									disabled={isHidden}
									configHelper={configHelper}
								/>
							</div>
						);
					}

					return;
				}
				// END CUSTOM DISPLAY

				return (
					<div
						key={block.id}
						className={cx(
							classes.box,
							!block.isUpdatable &&
								block.options.length === 0 &&
								classes.nonEditableBox
						)}
					>
						<FormBlockDisplay
							block={block}
							form={form}
							configHelper={configHelper}
							onConfigChange={onConfigChange}
							disabled={isHidden}
							step={step}
						/>
					</div>
				);
			})}
			<div className={cx(classes.buttonsContainer)}>
				{currentStepIndex > 0 ? (
					<Button
						priority="secondary"
						iconId="fr-icon-arrow-left-line"
						iconPosition="left"
						onClick={() => {
							changeStep('previous');
						}}
					>
						Étape précédente
					</Button>
				) : (
					<div />
				)}
				{currentStepIndex <
				form.form_template.form_template_steps.length - 1 ? (
					<Button
						priority="primary"
						iconId="fr-icon-arrow-right-line"
						iconPosition="right"
						onClick={() => {
							changeStep('next');
						}}
					>
						Étape suivante
					</Button>
				) : isExternalPublish ? (
					<div />
				) : (
					<Button
						priority="primary"
						iconId="fr-icon-computer-line"
						iconPosition="right"
						disabled={!hasConfigChanged}
						onClick={onPublish}
					>
						Publier
					</Button>
				)}
			</div>
		</div>
	);
};

const useStyles = tss.withName(FormStepDisplay.name).create({
	container: {
		height: '100%',
		display: 'flex',
		flexDirection: 'column',
		gap: fr.spacing('6v'),
		padding: fr.spacing('6v'),
		backgroundColor: fr.colors.decisions.background.contrast.blueFrance.default,
		h3: {
			...fr.typography[1].style,
			color: fr.colors.decisions.background.flat.blueFrance.default,
			marginBottom: 0
		}
	},
	containerHidden: {
		'h2, h3, h4, h5': {
			color: `${fr.colors.decisions.text.mention.grey.default} !important`
		}
	},
	box: {
		padding: fr.spacing('6v'),
		backgroundColor: fr.colors.decisions.background.default.grey.default,
		color: fr.colors.decisions.background.flat.blueFrance.default,
		['h2, h3, h4, h5, h6']: {
			color: fr.colors.decisions.background.flat.blueFrance.default,
			marginBottom: 0
		}
	},
	boxDisabled: {
		padding: fr.spacing('4v'),
		backgroundColor: fr.colors.decisions.background.default.grey.hover,
		color: fr.colors.decisions.text.actionHigh.grey.default,
		display: 'flex',
		alignItems: 'center'
	},
	nonEditableBox: {
		backgroundColor: fr.colors.decisions.background.alt.blueFrance.default,
		color: fr.colors.decisions.text.title.grey.default,
		['h3, h4, h5, h6']: {
			color: fr.colors.decisions.text.title.grey.default
		}
	},
	disabledAlertMessage: {
		color: fr.colors.decisions.background.flat.blueFrance.default
	},
	header: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center'
	},
	headerInfo: {
		display: 'flex',
		alignItems: 'center',
		'& ::before, & ::after': {
			'--icon-size': '1.5rem'
		}
	},
	buttonsContainer: {
		display: 'flex',
		justifyContent: 'space-between'
	},
	badgeContainer: {
		display: 'flex',
		alignItems: 'center'
	},
	hiddenBadge: {
		backgroundColor: fr.colors.decisions.background.default.grey.active,
		marginLeft: fr.spacing('4v'),
		'.ri-eye-off-line::before': {
			'--icon-size': '1rem'
		}
	},
	modifiedBadge: {
		backgroundColor:
			fr.colors.decisions.background.contrast.yellowTournesol.default,
		marginLeft: fr.spacing('4v')
	},
	tooltip: {
		...fr.typography[18].style
	},
	description: {
		fontWeight: 'normal'
	}
});

export default FormStepDisplay;
