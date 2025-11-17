import { useOnboarding } from '@/src/contexts/OnboardingContext';
import { fr, FrIconClassName, RiIconClassName } from '@codegouvfr/react-dsfr';
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
		title: 'Ajouter des membres',
		iconId: 'fr-icon-user-add-line',
		url: '/administration/dashboard/product/[id]/access/new',
		details: [
			{
				title:
					'Ajoutez des membres sur votre service numérique et partagez les informations à votre équipe !',
				iconId: 'ri-group-line'
			}
		],
		actionsLabel: 'Ajouter des membres',
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
		title: 'Créer un lien d’intégration',
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
	const { createdProduct } = useOnboarding();
	const [steps, setSteps] = useState(stepContents);

	const getCompletedValue = (stepSlug: string) => {
		switch (stepSlug) {
			case 'product':
				return Boolean(createdProduct);
			case 'access':
				return false;
			default:
				return false;
		}
	};

	useEffect(() => {
		setSteps(
			stepContents.map(step => ({
				...step,
				isCompleted: getCompletedValue(step.slug)
			}))
		);
	}, [createdProduct]);

	return (
		<div className={classes.stepperContainer}>
			{steps.map((step, index) => {
				const isActiveStep =
					index === 0 ||
					(steps[index - 1].isCompleted === true && step.isCompleted !== true);
				return (
					<div
						key={step.url}
						className={cx(
							classes.stepContainer,
							fr.cx('fr-px-6v', 'fr-py-4v', 'fr-mb-4v')
						)}
					>
						<div className={classes.iconContainer}>
							<i
								className={cx(step.iconId, fr.cx('fr-icon--lg'))}
								aria-hidden="true"
							/>
						</div>
						<h3 className={fr.cx('fr-h5', 'fr-mt-2w')}>{step.title}</h3>
						{/* Additional step details and actions can be rendered here */}
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
		justifyContent: 'center',
		width: '100%',
		backgroundColor: fr.colors.options.blueEcume._950_100.default
	},
	iconContainer: {
		width: fr.spacing('12v'),
		height: fr.spacing('12v'),
		backgroundColor: 'white',
		color: fr.colors.decisions.background.flat.blueFrance.default,
		borderRadius: '50%',
		flexShrink: 0,
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center'
	}
}));
