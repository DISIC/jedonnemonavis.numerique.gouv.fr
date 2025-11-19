import { useOnboarding } from '@/src/contexts/OnboardingContext';
import { fr, FrIconClassName, RiIconClassName } from '@codegouvfr/react-dsfr';
import Badge from '@codegouvfr/react-dsfr/Badge';
import Button from '@codegouvfr/react-dsfr/Button';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';
import { tss } from 'tss-react/dsfr';

type InfoContent = {
	title: string;
	iconId: FrIconClassName | RiIconClassName;
};

type StepContent = InfoContent & {
	slug: string;
	url: string;
	details: InfoContent[];
	actionsLabel: string;
	isSkippable?: boolean;
	isCompleted?: boolean;
	isSkipped?: boolean;
};

const stepContents: readonly StepContent[] = [
	{
		slug: 'product',
		title: 'Ajouter un service numérique',
		iconId: 'ri-check-line',
		url: '/administration/dashboard/product/new',
		details: [],
		actionsLabel: ''
	},
	{
		slug: 'access',
		title: 'Inviter des utilisateurs',
		iconId: 'fr-icon-user-add-line',
		url: '/administration/dashboard/product/[id]/access/new',
		details: [
			{
				title:
					'Ajoutez des membres sur votre service numérique et partagez les informations à votre équipe !',
				iconId: 'ri-group-line'
			}
		],
		actionsLabel: 'Inviter des utilisateurs',
		isSkippable: true
	},
	{
		slug: 'form',
		title: 'Générer un formulaire',
		iconId: 'ri-survey-line',
		url: '/administration/dashboard/product/[id]/forms/new',
		details: [
			{
				title:
					'Un formulaire vous permet de récolter les l’avis de vos usagers sur un service numérique.',
				iconId: 'ri-file-edit-line'
			}
		],
		actionsLabel: 'Générer un formulaire'
	},
	{
		slug: 'link',
		title: 'Intégrer le formulaire sur votre site',
		iconId: 'ri-link',
		url: '/administration/dashboard/product/[id]/forms/[form_id]/new-link',
		details: [
			{ title: 'Créez votre premier lien d’intégration', iconId: 'ri-link' },
			{
				title:
					'Copiez le code généré sur votre site pour publier le formulaire',
				iconId: 'ri-file-copy-line'
			}
		],
		actionsLabel: 'Créer un lien d’intégration'
	}
] as const;

const OnboardingStepper = () => {
	const router = useRouter();
	const { cx, classes } = useStyles();
	const { createdProduct, createdUserAccesses, createdForm } = useOnboarding();
	const [steps, setSteps] = useState(stepContents);

	const getSlugValues = (
		stepSlug: string
	): { isCompleted: boolean; url: string; isSkipped?: boolean } => {
		switch (stepSlug) {
			case 'product':
				return {
					isCompleted: Boolean(createdProduct),
					url: '/administration/dashboard/product/new'
				};
			case 'access':
				return {
					isCompleted: Boolean(
						createdUserAccesses && createdUserAccesses.length > 0
					),
					isSkipped: getSlugValues('form').isCompleted || false,
					url: `/administration/dashboard/product/${createdProduct?.id}/access/new`
				};
			case 'form':
				return {
					isCompleted: Boolean(createdForm),
					url: `/administration/dashboard/product/${createdProduct?.id}/forms/new`
				};
			case 'link':
				return {
					isCompleted: false,
					url: `/administration/dashboard/product/${createdProduct?.id}/forms/${createdForm?.id}/new-link`
				};
			default:
				return {
					isCompleted: false,
					url: '/administration/dashboard/product/new'
				};
		}
	};

	useEffect(() => {
		setSteps(
			stepContents.map(step => ({
				...step,
				isCompleted: getSlugValues(step.slug).isCompleted,
				url: getSlugValues(step.slug).url,
				isSkipped: getSlugValues(step.slug).isSkipped
			}))
		);
	}, [createdProduct, createdUserAccesses, createdForm]);

	return (
		<div className={classes.stepperContainer}>
			{steps.map((step, index) => {
				const isActiveStep =
					index === 0 ||
					((steps[index - 1].isCompleted || steps[index - 1].isSkipped) &&
						step.isCompleted !== true &&
						!step.isSkipped);

				const stepIconId =
					step.isCompleted || step.isSkipped ? 'ri-check-line' : step.iconId;

				return (
					<div
						key={step.url}
						className={cx(classes.stepContainer, fr.cx('fr-px-6v', 'fr-py-4v'))}
						style={{
							backgroundColor:
								step.isCompleted || step.isSkipped
									? fr.colors.decisions.background.default.grey.hover
									: undefined
						}}
					>
						<div className={classes.mainStepContent}>
							<div className={classes.titleContainer}>
								<div
									className={cx(
										classes.iconContainer,
										step.isCompleted || step.isSkipped
											? classes.greyIcon
											: undefined
									)}
								>
									<i
										className={cx(stepIconId, fr.cx('fr-icon--lg'))}
										aria-hidden="true"
									/>
								</div>
								<div className={classes.titleWithBadge}>
									<h3 className={fr.cx('fr-h5', 'fr-m-0')}>{step.title}</h3>
									{(step.isCompleted || step.isSkipped) && (
										<Badge
											severity={step.isSkipped ? 'info' : 'success'}
											noIcon
											small
										>
											{step.isCompleted ? 'Complété' : 'Ignoré'}
										</Badge>
									)}
								</div>
							</div>
							{(step.isCompleted || step.isSkipped) && (
								<Button
									iconId="fr-icon-edit-line"
									priority="tertiary"
									iconPosition="right"
									size="small"
									onClick={() => {
										if (step.isSkipped) {
											setSteps(prevSteps =>
												prevSteps.map(s =>
													s.slug === step.slug ? { ...s, isSkipped: false } : s
												)
											);
											return;
										}
										router.push(step.url);
									}}
								>
									Modifier
								</Button>
							)}
						</div>
						{step.details.length > 0 && isActiveStep && (
							<div className={classes.detailsContainer}>
								<div className={classes.detailsList}>
									{step.details.map(detail => (
										<div key={detail.title} className={classes.detailLine}>
											<div
												className={classes.iconContainer}
												style={{
													backgroundColor:
														fr.colors.decisions.background.alt.blueFrance
															.default
												}}
											>
												<i
													className={cx(detail.iconId, fr.cx('fr-icon--lg'))}
													aria-hidden="true"
												/>
											</div>
											<span className={fr.cx('fr-text--lg', 'fr-m-0')}>
												{detail.title}
											</span>
										</div>
									))}
								</div>
								<div className={classes.detailsActions}>
									{step.isSkippable && (
										<Button
											priority="secondary"
											size="large"
											iconPosition="right"
											iconId="fr-icon-arrow-right-s-line"
											onClick={() => {
												setSteps(prevSteps =>
													prevSteps.map(s =>
														s.slug === step.slug ? { ...s, isSkipped: true } : s
													)
												);
											}}
										>
											Passer cette étape
										</Button>
									)}
									<Button
										size="large"
										iconPosition="right"
										iconId="fr-icon-arrow-right-s-line"
										linkProps={{ href: step.url }}
									>
										{step.actionsLabel}
									</Button>
								</div>
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
};

export default OnboardingStepper;

const useStyles = tss.withName(OnboardingStepper.name).create(() => ({
	stepperContainer: {
		display: 'flex',
		flexDirection: 'column',
		width: '100%',
		gap: fr.spacing('4v')
	},
	stepContainer: {
		display: 'flex',
		flexDirection: 'column',
		width: '100%',
		gap: fr.spacing('4v'),
		backgroundColor: fr.colors.decisions.background.alt.blueFrance.default,
		borderRadius: fr.spacing('2v')
	},
	iconContainer: {
		width: fr.spacing('12v'),
		height: fr.spacing('12v'),
		marginRight: fr.spacing('4v'),
		backgroundColor: 'white',
		color: fr.colors.decisions.background.flat.blueFrance.default,
		borderRadius: '50%',
		flexShrink: 0,
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center'
	},
	greyIcon: {
		backgroundColor: fr.colors.decisions.background.default.grey.active,
		color: fr.colors.decisions.text.default.grey.default
	},
	mainStepContent: {
		display: 'flex',
		alignItems: 'center',
		gap: fr.spacing('4v')
	},
	titleContainer: {
		display: 'flex',
		alignItems: 'center'
	},
	titleWithBadge: {
		display: 'flex',
		alignItems: 'center',
		gap: fr.spacing('2v')
	},
	detailsContainer: {
		display: 'flex',
		flexDirection: 'column',
		background: 'white',
		gap: fr.spacing('4v'),
		...fr.spacing('padding', { topBottom: '8v', rightLeft: '10v' })
	},
	detailLine: { display: 'flex', alignItems: 'center', gap: fr.spacing('4v') },
	detailsList: {
		display: 'flex',
		flexDirection: 'column',
		gap: fr.spacing('3v')
	},
	detailsActions: {
		display: 'flex',
		justifyContent: 'center',
		gap: fr.spacing('6v')
	}
}));
