import OnboardingLayout from '@/src/layouts/Onboarding/OnboardingLayout';
import { ProductWithForms } from '@/src/types/prismaTypesExtended';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Input from '@codegouvfr/react-dsfr/Input';
import { Form, RightAccessStatus } from '@prisma/client';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { tss } from 'tss-react/dsfr';
import { getServerSideProps } from '..';
import FormGenerationAnimationPanel from '@/src/components/dashboard/Form/FormGenerationAnimationPanel';

interface Props {
	product: ProductWithForms;
	ownRight: Exclude<RightAccessStatus, 'removed'>;
}

type FormValues = Omit<Form, 'id' | 'created_at' | 'updated_at'>;

const NewForm = (props: Props) => {
	const { product, ownRight } = props;
	const router = useRouter();
	const { id } = router.query;
	const { cx, classes } = useStyles();

	const [isGenerating, setIsGenerating] = useState(false);

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

	const onLocalSubmit: SubmitHandler<FormValues> = async data => {
		setIsGenerating(true);
		// if (!rootFormTemplate?.data?.id) return;
		// const savedFormResponse = await createForm.mutateAsync({
		// 	...data,
		// 	product_id: product.id,
		// 	form_template_id: rootFormTemplate?.data?.id
		// });
		// router.push(
		// 	`/administration/dashboard/product/${product.id}/forms/${savedFormResponse.data.id}`
		// );
	};

	return (
		<OnboardingLayout
			isCancelable
			title={isGenerating ? undefined : 'Générer un formulaire'}
			onConfirm={handleSubmit(onLocalSubmit)}
			noBackground={isGenerating}
		>
			{isGenerating ? (
				<FormGenerationAnimationPanel />
			) : (
				<>
					<div
						className={cx(classes.infoContainer, fr.cx('fr-my-8v', 'fr-p-6v'))}
						style={{ justifyContent: 'start' }}
					>
						<div className={classes.iconContainer}>
							<i
								className={cx(fr.cx('ri-emotion-happy-line', 'fr-icon--lg'))}
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
											!isDuplicate || 'Un formulaire avec ce nom existe déjà'
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
															Visible uniquement par vous et les autres membres
															de l’équipe
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
			)}
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
