import FormLinkIntegrationPreview from '@/src/components/dashboard/Form/FormLinkIntegrationPreview';
import ButtonForm from '@/src/components/dashboard/ProductButton/ButtonForm';
import ButtonCopyInstructionsPanel from '@/src/components/dashboard/ProductButton/CopyInstructionPanel';
import { LinkCreationStep } from '@/src/components/dashboard/ProductButton/interface';
import { Loader } from '@/src/components/ui/Loader';
import { useOnboarding } from '@/src/contexts/OnboardingContext';
import OnboardingLayout from '@/src/layouts/Onboarding/OnboardingLayout';
import {
	ButtonWithElements,
	FormTemplateButtonWithVariants,
	ProductWithForms
} from '@/src/types/prismaTypesExtended';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import {
	ButtonIntegrationTypes,
	FormTemplateButtonStyle
} from '@prisma/client';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { tss } from 'tss-react/dsfr';

interface Props {
	product: ProductWithForms;
	mode: 'create' | 'edit';
}

const LinkEditorFlow = ({ product, mode }: Props) => {
	const router = useRouter();
	const { form_id, link_id } = router.query;
	const { cx, classes } = useStyles();
	const { createdProduct, createdForm } = useOnboarding();

	const [selectedButtonStyle, setSelectedButtonStyle] =
		useState<FormTemplateButtonStyle>();
	const [createdButton, setCreatedButton] = useState<ButtonWithElements>();
	const [currentStep, setCurrentStep] = useState<LinkCreationStep>('PREVIEW');
	const [selectedIntegrationType, setSelectedIntegrationType] =
		useState<ButtonIntegrationTypes>('button');
	const [selectedFormTemplateButton, setSelectedFormTemplateButton] =
		useState<FormTemplateButtonWithVariants>();
	const [title, setTitle] = useState('');
	const [titleError, setTitleError] = useState(false);

	const currentForm = useMemo(() => {
		return product?.forms.find(form => form.id === Number(form_id));
	}, [form_id, product?.forms]);

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

	const parsedLinkId = Number(link_id);
	const buttonById = trpc.button.getById.useQuery(
		{ id: parsedLinkId },
		{ enabled: mode === 'edit' && !!link_id && !isNaN(parsedLinkId) }
	);

	const formTemplate = trpc.form.getFormTemplateBySlug.useQuery(
		{ slug: currentForm?.form_template?.slug || '' },
		{ enabled: !!currentForm?.form_template?.slug }
	);

	const createButton = trpc.button.create.useMutation({
		onSuccess: result => {
			setCreatedButton(result.data);
			setCurrentStep('COPY');
			window._mtm?.push({
				event: 'matomo_event',
				container_type: 'backoffice',
				service_id: createdProduct?.id || 0,
				form_id: createdForm?.id || 0,
				template_slug: createdForm?.form_template.slug || '',
				category: 'service',
				action: 'form_link_create'
			});
		}
	});

	const updateButton = trpc.button.update.useMutation({
		onSuccess: result => {
			setCreatedButton(result.data);
			setCurrentStep('COPY');
			window._mtm?.push({
				event: 'matomo_event',
				container_type: 'backoffice',
				service_id: product.id,
				form_id: Number(form_id),
				template_slug: currentForm?.form_template.slug || '',
				category: 'service',
				action: 'form_link_update'
			});
		}
	});

	useEffect(() => {
		if (mode !== 'create') return;
		if (!title) {
			setTitle(defaultTitle || '');
		}
	}, [defaultTitle, mode, title]);

	useEffect(() => {
		if (mode !== 'edit') return;
		if (!buttonById.data?.data) return;

		setSelectedIntegrationType(
			buttonById.data.data.integration_type || 'button'
		);
		setSelectedButtonStyle(buttonById.data.data.button_style || undefined);
		setTitle(buttonById.data.data.title || '');
	}, [buttonById.data?.data, mode]);

	useEffect(() => {
		if (
			selectedIntegrationType === 'link' ||
			selectedIntegrationType === 'embed'
		) {
			setSelectedFormTemplateButton(undefined);
			setSelectedButtonStyle(undefined);
			return;
		}

		if (!formTemplate.data?.data?.form_template_buttons?.length) return;

		if (mode === 'edit' && buttonById.data?.data?.form_template_button_id) {
			const existingTemplateButton =
				formTemplate.data.data.form_template_buttons.find(
					button => button.id === buttonById.data?.data?.form_template_button_id
				);
			if (existingTemplateButton) {
				setSelectedFormTemplateButton(existingTemplateButton);
				return;
			}
		}

		setSelectedFormTemplateButton(
			formTemplate.data.data.form_template_buttons.find(
				button => button.isDefault
			)
		);
	}, [
		buttonById.data?.data?.form_template_button_id,
		formTemplate.data?.data?.form_template_buttons,
		mode,
		selectedIntegrationType
	]);

	const goNextStep = () => {
		if (mode === 'edit') {
			router.push(
				`/administration/dashboard/product/${product.id}/forms/${form_id}?tab=links&linkUpdated=true`
			);
			return;
		}

		if (!createdProduct && !createdForm) {
			router.push(
				`/administration/dashboard/product/${product.id}/forms/${form_id}?tab=links&linkCreated=true`
			);
		} else if (!createdProduct && createdForm) {
			router.push(
				`/administration/dashboard/product/${product.id}/forms?formCreated=true`
			);
		} else {
			router.push('/administration/dashboard/products?onboardingDone=true');
		}
	};

	const onSubmit = async () => {
		if (!title.trim()) {
			setTitleError(true);
			return;
		}

		setTitleError(false);

		const payload = {
			title,
			form_id: Number(form_id),
			form_template_button_id: selectedFormTemplateButton?.id || null,
			button_style: selectedButtonStyle || null,
			integration_type: selectedIntegrationType
		};

		if (mode === 'edit' && !isNaN(parsedLinkId)) {
			await updateButton.mutateAsync({
				id: parsedLinkId,
				...payload
			});
			return;
		}

		await createButton.mutateAsync(payload);
	};

	const currentStepValues = (() => {
		switch (currentStep) {
			case 'PREVIEW':
				return {
					content: !currentForm ? (
						<Loader />
					) : (
						<FormLinkIntegrationPreview
							title="Choisir le type d'intégration"
							form={currentForm}
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
							formTemplate={formTemplate.data?.data}
							preSelectedIntegrationType={
								buttonById.data?.data?.integration_type || undefined
							}
						/>
					),
					title: "Choisir le type d'intégration"
				};
			case 'CREATION':
				return {
					content: (
						<ButtonForm
							title={title}
							setTitle={setTitle}
							titleError={titleError}
							selectedButtonStyle={selectedButtonStyle}
							setSelectedButtonStyle={setSelectedButtonStyle}
							selectedIntegrationType={selectedIntegrationType}
							formTemplateButtons={
								formTemplate.data?.data?.form_template_buttons
							}
							selectedFormTemplateButton={selectedFormTemplateButton}
							setSelectedFormTemplateButton={setSelectedFormTemplateButton}
						/>
					),
					title:
						mode === 'edit'
							? "Modifier un lien d'intégration"
							: "Créer un lien d'intégration",
					onConfirm: onSubmit,
					onCancel: () => setCurrentStep('PREVIEW')
				};
			case 'COPY':
				return {
					content: createdButton ? (
						<ButtonCopyInstructionsPanel
							buttonStyle={selectedButtonStyle}
							button={createdButton}
							formTemplateButton={selectedFormTemplateButton}
							integrationType={selectedIntegrationType}
						/>
					) : (
						<Loader />
					),
					title: `Copier le ${
						selectedIntegrationType === 'link' ? 'lien' : 'code'
					}`,
					confirmText: 'Terminer',
					onConfirm: goNextStep,
					onCancel: () => setCurrentStep('CREATION')
				};
		}
	})();

	if (
		!currentForm ||
		formTemplate.isLoading ||
		(mode === 'edit' && buttonById.isLoading)
	) {
		return (
			<OnboardingLayout title="Chargement..." hideActions>
				<Loader />
			</OnboardingLayout>
		);
	}

	return (
		<OnboardingLayout
			onCancel={currentStepValues.onCancel}
			title={currentStepValues.title}
			confirmText={currentStepValues.confirmText}
			onConfirm={currentStepValues.onConfirm}
			hideMainHintText={!!createdButton}
			hideBackButton={!!createdButton && !parsedLinkId}
			hideActions={currentStep === 'PREVIEW'}
			hideTitle={currentStep === 'PREVIEW'}
			noBackground={currentStep === 'PREVIEW'}
			isFullScreen={currentStep === 'PREVIEW'}
		>
			{currentStepValues.content}
		</OnboardingLayout>
	);
};

const useStyles = tss.withName(LinkEditorFlow.name).create(() => ({
	asterisk: {
		color: fr.colors.decisions.text.default.error.default
	}
}));

export default LinkEditorFlow;
