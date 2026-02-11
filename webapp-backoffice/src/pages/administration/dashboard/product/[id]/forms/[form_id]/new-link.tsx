import FormLinkIntegrationPreview from '@/src/components/dashboard/Form/FormLinkIntegrationPreview';
import ButtonForm from '@/src/components/dashboard/ProductButton/ButtonForm';
import { ButtonCreationPayload } from '@/src/components/dashboard/ProductButton/ButtonModal';
import ButtonCopyInstructionsPanel from '@/src/components/dashboard/ProductButton/CopyInstructionPanel';
import {
	ButtonStyle,
	LinkCreationStep,
	LinkIntegrationTypes
} from '@/src/components/dashboard/ProductButton/interface';
import { Loader } from '@/src/components/ui/Loader';
import { useOnboarding } from '@/src/contexts/OnboardingContext';
import OnboardingLayout from '@/src/layouts/Onboarding/OnboardingLayout';
import {
	ButtonWithForm,
	ProductWithForms
} from '@/src/types/prismaTypesExtended';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { tss } from 'tss-react/dsfr';
import { getServerSideProps } from '..';

interface Props {
	product: ProductWithForms;
}

const NewLink = (props: Props) => {
	const { product } = props;
	const router = useRouter();
	const { form_id } = router.query;
	const { cx, classes } = useStyles();
	const { createdProduct, createdForm } = useOnboarding();

	const [selectedButtonStyle, setSelectedButtonStyle] =
		useState<ButtonStyle>('solid');
	const [createdButton, setCreatedButton] = useState<ButtonWithForm>();
	const [currentStep, setCurrentStep] = useState<LinkCreationStep>('PREVIEW');
	const [selectedIntegrationType, setSelectedIntegrationType] =
		useState<LinkIntegrationTypes>('button');

	const currentForm = useMemo(() => {
		return product?.forms.find(form => form.id === Number(form_id));
	}, [product?.forms]);

	const defaultTitle = useMemo(() => {
		const baseTitle = 'Lien d’intégration';
		if (!currentForm || currentForm.buttons.length === 0)
			return `${baseTitle} 1`;

		const existingButtons = currentForm.buttons.filter(b =>
			b.title.startsWith(baseTitle)
		);

		if (existingButtons.length === 0) return `${baseTitle} 1`;

		return `${baseTitle} ${existingButtons.length + 1}`;
	}, [currentForm]);

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors }
	} = useForm<ButtonCreationPayload>({
		defaultValues: {
			title: defaultTitle || ''
		}
	});

	const createButton = trpc.button.create.useMutation({
		onSuccess: async result => {
			setCreatedButton(result.data);
			setCurrentStep('COPY');
		}
	});

	const onSubmit: SubmitHandler<ButtonCreationPayload> = async data => {
		await createButton.mutateAsync({ ...data, form_id: Number(form_id) });
	};

	const goNextStep = () => {
		if (!createdProduct && !createdForm) {
			router.push(
				`/administration/dashboard/product/${product.id}/forms/${form_id}?tab=links&linkCreated=true`
			);
		} else if (!createdProduct && createdForm) {
			router.push(
				`/administration/dashboard/product/${product.id}/forms?formCreated=true`
			);
		} else {
			router.push(`/administration/dashboard/products?onboardingDone=true`);
		}
	};

	const currentStepValues = (() => {
		switch (currentStep) {
			case 'PREVIEW':
				return {
					content: (
						<FormLinkIntegrationPreview
							title="Choisir le type d'intégration"
							description={
								<>
									<p className={fr.cx('fr-hint-text', 'fr-text--sm')}>
										Vous pouvez modifier le type d’intégration à tout moment à
										partir de la page “Liens d’intégration” de votre formulaire.
									</p>
									<p className={fr.cx('fr-hint-text', 'fr-text--sm')}>
										Les champs marqués d&apos;un{' '}
										<span className={cx(classes.asterisk)}>*</span> sont
										obligatoires
									</p>
								</>
							}
							onConfirm={integrationType => {
								setSelectedIntegrationType(integrationType);
								setCurrentStep('CREATION');
							}}
						/>
					),
					title: "Choisir le type d'intégration"
				};
			case 'CREATION':
				return {
					content: (
						<ButtonForm
							currentForm={currentForm}
							selectedButtonStyle={selectedButtonStyle}
							setSelectedButtonStyle={setSelectedButtonStyle}
							selectedIntegrationType={selectedIntegrationType}
						/>
					),
					title: "Créer un lien d'intégration",
					onConfirm: handleSubmit(onSubmit)
				};
			case 'COPY':
				return {
					content: createdButton ? (
						<ButtonCopyInstructionsPanel
							buttonColor={selectedButtonStyle === 'solid' ? 'bleu' : 'blanc'}
							button={createdButton}
						/>
					) : (
						<Loader />
					),
					title: 'Copier le code',
					onConfirm: goNextStep
				};
		}
	})();

	console.log(
		'form',
		product.forms.find(f => f.id === Number(form_id))
	);

	return (
		<OnboardingLayout
			onCancel={
				currentStep !== 'PREVIEW'
					? () => {
							switch (currentStep) {
								case 'CREATION':
									setCurrentStep('PREVIEW');
									break;
								case 'COPY':
									setCurrentStep('CREATION');
									break;
							}
					  }
					: undefined
			}
			title={currentStepValues.title}
			onConfirm={currentStepValues.onConfirm}
			hideMainHintText={!!createdButton}
			hideBackButton={!!createdButton}
			hideActions={currentStep === 'PREVIEW'}
			hideTitle={currentStep === 'PREVIEW'}
			noBackground={currentStep === 'PREVIEW'}
			isFullScreen={currentStep === 'PREVIEW'}
		>
			{currentStepValues.content}
		</OnboardingLayout>
	);
};

export default NewLink;

const useStyles = tss.withName(NewLink.name).create(() => ({
	asterisk: {
		color: fr.colors.decisions.text.default.error.default
	},
	infoContainer: {
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
	},
	buttonStyles: {
		'.fr-radio-rich__img': {
			width: '14rem',
			img: {
				maxWidth: '85%',
				maxHeight: '85%',
				minWidth: '3.5rem',
				minHeight: '3.5rem'
			}
		}
	}
}));

export { getServerSideProps };
