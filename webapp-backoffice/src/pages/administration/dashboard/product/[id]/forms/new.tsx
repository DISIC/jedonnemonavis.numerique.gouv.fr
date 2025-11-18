import FormConfigurator from '@/src/components/dashboard/Form/FormConfigurator';
import FormGenerationAnimationPanel from '@/src/components/dashboard/Form/FormGenerationAnimationPanel';
import { Loader } from '@/src/components/ui/Loader';
import OnboardingLayout from '@/src/layouts/Onboarding/OnboardingLayout';
import {
	FormWithElements,
	ProductWithForms
} from '@/src/types/prismaTypesExtended';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Input from '@codegouvfr/react-dsfr/Input';
import { Form, Prisma, RightAccessStatus } from '@prisma/client';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { tss } from 'tss-react/dsfr';
import { getServerSideProps } from '..';
import { FormConfigHelper } from './[form_id]/edit';
import {
	getHasConfigChanged,
	getHelperFromFormConfig
} from '@/src/utils/tools';
import { useOnboarding } from '@/src/contexts/OnboardingContext';

interface Props {
	product: ProductWithForms;
	ownRight: Exclude<RightAccessStatus, 'removed'>;
}

type FormValues = Omit<Form, 'id' | 'created_at' | 'updated_at'>;
type FormCreationStep = 'CREATE' | 'GENERATING' | 'READY' | 'EDIT';

const NewForm = (props: Props) => {
	const { product, ownRight } = props;
	const router = useRouter();
	const { id } = router.query;
	const { cx, classes } = useStyles();
	const { createdProduct, createdForm, updateCreatedForm } = useOnboarding();

	const [formStep, setFormStep] = useState<FormCreationStep>('CREATE');
	const [formTitle, setFormTitle] = useState<string>('');
	const [tmpConfigHelper, setTmpConfigHelper] = useState<FormConfigHelper>();
	const [hasConfigChanged, setHasConfigChanged] = useState(false);
	const [createConfig, setCreateConfig] =
		useState<Prisma.FormConfigUncheckedCreateInput>({
			form_id: createdForm?.id || 0,
			status: 'published'
		});

	const shouldShowStepper = useMemo(
		() => Boolean(createdProduct) && Boolean(createdForm),
		[createdProduct, createdForm]
	);

	const { data: rootFormTemplate } = trpc.form.getFormTemplateBySlug.useQuery({
		slug: 'root'
	});

	const defaultTitle = useMemo(() => {
		if (!product.forms || product.forms.length === 0)
			return rootFormTemplate?.data?.title || '';

		const existingTemplateForms = product.forms.filter(
			f =>
				rootFormTemplate?.data?.title &&
				f.form_template.title === rootFormTemplate.data.title
		);

		if (existingTemplateForms.length === 0)
			return rootFormTemplate?.data?.title || '';

		return `${rootFormTemplate?.data?.title} ${existingTemplateForms.length + 1}`;
	}, [product.forms, rootFormTemplate]);

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors }
	} = useForm<FormValues>({
		defaultValues: {
			title: defaultTitle || rootFormTemplate?.data?.title || ''
		}
	});

	const createFormConfig = trpc.formConfig.create.useMutation();

	useEffect(() => {
		reset({
			title: defaultTitle || rootFormTemplate?.data?.title || ''
		});
	}, [defaultTitle]);

	const utils = trpc.useUtils();

	const createForm = trpc.form.create.useMutation({
		onSuccess: () => {
			utils.adminEntityRight.getUserList.invalidate();
		}
	});

	const onSubmitCreateForm: SubmitHandler<FormValues> = async data => {
		if (!rootFormTemplate?.data?.id) return;
		const savedFormResponse = await createForm.mutateAsync({
			...data,
			product_id: product.id,
			form_template_id: rootFormTemplate?.data?.id
		});
		setFormStep('GENERATING');
		setFormTitle(data.title || rootFormTemplate?.data?.title || '');
		updateCreatedForm(savedFormResponse.data);
	};

	const onChangeConfig = (configHelper: FormConfigHelper) => {
		setTmpConfigHelper(configHelper);

		const rootConfigHelper = getHelperFromFormConfig(undefined);
		setHasConfigChanged(getHasConfigChanged(configHelper, rootConfigHelper));

		setCreateConfig({
			...createConfig,
			form_config_displays: { create: configHelper.displays },
			form_config_labels: { create: configHelper.labels }
		});
	};

	const saveEditedFormAndFinishCreation = () => {
		if (!createdForm)
			return router.push(
				`/administration/dashboard/product/${product.id}/forms`
			);

		if (hasConfigChanged) {
			createFormConfig.mutate({
				...createConfig,
				form_id: createdForm.id,
				version: 0
			});
		}

		if (!createdProduct) {
			return router.push(
				`/administration/dashboard/product/${product.id}/forms/${createdForm.id}`
			);
		}
	};

	const currentStepValues = (() => {
		switch (formStep) {
			case 'CREATE':
				return {
					content: (
						<>
							<div
								className={cx(
									classes.infoContainer,
									fr.cx('fr-mb-8v', 'fr-p-6v')
								)}
								style={{ justifyContent: 'start' }}
							>
								<div className={classes.iconContainer}>
									<i
										className={cx(
											fr.cx('ri-emotion-happy-line', 'fr-icon--lg')
										)}
									/>
								</div>
								<p className={fr.cx('fr-mb-0', 'fr-ml-6v', 'fr-col--middle')}>
									JDMA vous propose un formulaire pour évaluer la satisfaction
									globale de vos usagers.
								</p>
							</div>
							<form id="form-creation-form">
								<div className={fr.cx('fr-input-group')}>
									<Controller
										control={control}
										name="title"
										rules={{
											required: 'Ce champ est obligatoire',
											validate: value => {
												const trimmedValue = value?.trim();
												if (!trimmedValue) return 'Ce champ est obligatoire';
												const isDuplicate = product.forms.some(
													form =>
														(
															form?.title ||
															rootFormTemplate?.data?.title ||
															''
														).trim() === trimmedValue
												);
												return (
													!isDuplicate ||
													'Un formulaire avec ce nom existe déjà'
												);
											}
										}}
										render={({ field: { onChange, value, name, ref } }) => {
											return (
												<div
													ref={ref}
													className={fr.cx(
														'fr-input-group',
														errors[name] ? 'fr-input-group--error' : undefined
													)}
												>
													<Input
														label={
															<p className={fr.cx('fr-mb-0')}>
																Nom du formulaire{' '}
																<span className={cx(classes.asterisk)}>*</span>
															</p>
														}
														nativeInputProps={{
															onChange,
															value: value || '',
															name,
															required: true
														}}
														hintText={
															<>
																<span className={fr.cx('fr-hint-text')}>
																	Visible uniquement par vous et les autres
																	membres de l’équipe
																</span>
															</>
														}
														state="info"
														stateRelatedMessage={
															'Vous pouvez modifier ce nom par défaut'
														}
													/>
													{errors[name] && (
														<p className={fr.cx('fr-error-text')}>
															{errors[name]?.message}
														</p>
													)}
												</div>
											);
										}}
									/>
								</div>
							</form>
						</>
					),
					title: 'Générer un formulaire',
					confirmAction: handleSubmit(onSubmitCreateForm)
				};
			case 'READY':
			case 'GENERATING':
				return {
					content: (
						<FormGenerationAnimationPanel
							title={formTitle}
							onFinish={() => setFormStep('READY')}
						/>
					),
					confirmAction: () => setFormStep('EDIT'),
					noBackground: true
				};
			case 'EDIT':
				return {
					title: formTitle,
					content: (
						<div className={fr.cx('fr-col-12')}>
							{createdForm ? (
								<FormConfigurator
									form={createdForm}
									onChange={onChangeConfig}
									hasConfigChanged={hasConfigChanged}
									isExternalPublish={true}
								/>
							) : (
								<Loader />
							)}
						</div>
					),
					confirmAction: saveEditedFormAndFinishCreation,
					confirmText: 'Enregistrer les modifications',
					customHintText: (
						<p className={fr.cx('fr-text--sm', 'fr-mb-3v')}>
							Prévisualisez le formulaire puis masquez des étapes ou des options
							si nécessaire
						</p>
					),
					headerActions: (
						<Link
							className={fr.cx('fr-btn', 'fr-btn--secondary')}
							href={`${process.env.NEXT_PUBLIC_FORM_APP_URL}/Demarches/${product.id}?iframe=true&formConfig=${encodeURIComponent(JSON.stringify(tmpConfigHelper))}`}
							target={'_blank'}
						>
							Prévisualiser
						</Link>
					)
				};
		}
	})();

	return (
		<OnboardingLayout
			isCancelable={formStep === 'CREATE'}
			title={currentStepValues.title}
			onConfirm={currentStepValues.confirmAction}
			noBackground={currentStepValues.noBackground}
			isConfirmDisabled={formStep === 'GENERATING'}
			confirmText={currentStepValues.confirmText}
			customHintText={currentStepValues.customHintText}
			isLarge={formStep === 'EDIT'}
			shouldDisplayLine={formStep === 'EDIT'}
			headerActions={currentStepValues.headerActions}
			isStepperLayout={shouldShowStepper}
		>
			{currentStepValues.content}
		</OnboardingLayout>
	);
};

export default NewForm;

const useStyles = tss.withName(NewForm.name).create(() => ({
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
	}
}));

export { getServerSideProps };
