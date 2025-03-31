import { FormConfigHelper } from '@/src/pages/administration/dashboard/product/[id]/forms/[form_id]';
import { FormWithElements } from '@/src/types/prismaTypesExtended';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { Tooltip } from '@codegouvfr/react-dsfr/Tooltip';
import { tss } from 'tss-react';
import FormBlockDisplay from './FormBlockDisplay';
import { useEffect, useState } from 'react';
import { FormConfigKind } from '@prisma/client';
import Badge from '@codegouvfr/react-dsfr/Badge';

type Step = FormWithElements['form_template']['form_template_steps'][0];
interface Props {
	step: Step;
	form: FormWithElements;
	configHelper: FormConfigHelper;
	changeStep: (to: 'previous' | 'next') => void;
	onConfigChange: (config: FormConfigHelper) => void;
}

const FormStepDisplay = (props: Props) => {
	const { step, form, configHelper, changeStep, onConfigChange } = props;

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
	}, [step]);

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
			<div className={cx(classes.box)}>
				<div className={cx(classes.header)}>
					<h2>
						{step.title}{' '}
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
					</h2>
					<div>
						{isHidden && (
							<Badge className={cx(classes.hiddenBadge)} small>
								<span className={fr.cx('ri-eye-off-line', 'fr-mr-1v')} />
								Masqué
							</Badge>
						)}
						{step.isHideable && (
							<Button
								priority="secondary"
								iconId={isHidden ? 'ri-eye-line' : 'ri-eye-off-line'}
								iconPosition="right"
								onClick={() => {
									setIsHidden(!isHidden);
								}}
							>
								{isHidden ? "Afficher l'étape" : "Masquer l'étape"}
							</Button>
						)}
					</div>
				</div>
				{isHidden && (
					<>
						<hr className={fr.cx('fr-mt-8v', 'fr-mb-7v', 'fr-pb-1v')} />
						<div className={cx(classes.boxDisabled)}>
							<p
								className={cx(classes.disabledAlertMessage, fr.cx('fr-mb-2v'))}
							>
								<span className={fr.cx('ri-alert-fill', 'fr-mr-1v')} /> Étape
								masquée
							</p>
							<p className={fr.cx('fr-mb-0')}>
								Cette étape est masquée sur le formulaire usagers mais vous
								pouvez visualiser son contenu.
							</p>
						</div>
					</>
				)}
			</div>
			{step.form_template_blocks.map(block => {
				return (
					<div key={block.id} className={cx(classes.box)}>
						<FormBlockDisplay
							block={block}
							form={form}
							configHelper={configHelper}
							onConfigChange={onConfigChange}
							disabled={isHidden}
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
				) : (
					<Button
						priority="primary"
						iconId="fr-icon-computer-line"
						iconPosition="right"
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
		color: fr.colors.decisions.text.actionHigh.grey.default
	},
	disabledAlertMessage: {
		fontWeight: 'bold',
		color: fr.colors.decisions.background.flat.warning.default
	},
	header: {
		display: 'flex',
		justifyContent: 'space-between'
	},
	buttonsContainer: {
		display: 'flex',
		justifyContent: 'space-between'
	},
	hiddenBadge: {
		backgroundColor: fr.colors.decisions.background.default.grey.active,
		marginRight: fr.spacing('4v'),
		'.ri-eye-off-line::before': {
			'--icon-size': '1rem'
		}
	},
	tooltip: {
		...fr.typography[18].style
	},
	description: {
		fontWeight: 'normal'
	}
});

export default FormStepDisplay;
