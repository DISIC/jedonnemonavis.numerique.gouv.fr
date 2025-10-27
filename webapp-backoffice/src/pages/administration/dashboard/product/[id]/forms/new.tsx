import OnboardingLayout from '@/src/layouts/Onboarding/OnboardingLayout';
import { ProductWithForms } from '@/src/types/prismaTypesExtended';
import { Form, RightAccessStatus } from '@prisma/client';
import { useRouter } from 'next/router';
import React, { useMemo } from 'react';
import { getServerSideProps } from '..';
import { tss } from 'tss-react/dsfr';
import { fr } from '@codegouvfr/react-dsfr';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import Input from '@codegouvfr/react-dsfr/Input';
import { trpc } from '@/src/utils/trpc';

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

	const rootFormTemplate = useMemo(() => {
		return product.forms.find(f => f.form_template.slug === 'root')
			?.form_template;
	}, [product.forms]);

	const defaultTitle = useMemo(() => {
		if (!product.forms || product.forms.length === 0)
			return rootFormTemplate?.title || '';

		const existingTemplateForms = product.forms.filter(
			f =>
				rootFormTemplate?.title &&
				f.form_template.title === rootFormTemplate.title
		);

		if (existingTemplateForms.length === 0)
			return rootFormTemplate?.title || '';

		return `${rootFormTemplate?.title} ${existingTemplateForms.length + 1}`;
	}, [product.forms]);

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors }
	} = useForm<FormValues>({
		defaultValues: {
			title: defaultTitle || rootFormTemplate?.title || ''
		}
	});

	const utils = trpc.useUtils();

	const saveFormTmp = trpc.form.create.useMutation({
		onSuccess: () => {
			utils.adminEntityRight.getUserList.invalidate();
		}
	});

	const onLocalSubmit: SubmitHandler<FormValues> = async data => {
		let formId;

		if (!rootFormTemplate?.id) return;
		const savedFormResponse = await saveFormTmp.mutateAsync({
			...data,
			product_id: product.id,
			form_template_id: rootFormTemplate?.id
		});
		formId = savedFormResponse.data.id;
		router.push(`/administration/dashboard/product/${product.id}/forms`);
	};

	return (
		<OnboardingLayout
			isCancelable
			title="Générer un formulaire"
			onCancel={() =>
				router.push(`/administration/dashboard/product/${id}/forms`)
			}
			onConfirm={handleSubmit(onLocalSubmit)}
		>
			<div
				className={cx(classes.infoContainer, fr.cx('fr-my-8v', 'fr-p-6v'))}
				style={{ justifyContent: 'start' }}
			>
				<div className={classes.iconContainer}>
					<i className={cx(fr.cx('ri-emotion-happy-line', 'fr-icon--lg'))} />
				</div>
				<p className={fr.cx('fr-mb-0', 'fr-ml-6v', 'fr-col--middle')}>
					JDMA vous propose un formulaire pour évaluer la satisfaction globale
					de vos usagers.
				</p>
			</div>
			<form id="form-creation-form">
				<div className={fr.cx('fr-input-group')}>
					<Controller
						control={control}
						name="title"
						rules={{ required: 'Ce champ est obligatoire' }}
						render={({ field: { onChange, value, name } }) => {
							return (
								<>
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
											required: true,
											onKeyDown: e => {
												if (e.key === 'Enter') {
													e.preventDefault();
													handleSubmit(onLocalSubmit)();
												}
											}
										}}
										hintText={
											<>
												<span className={fr.cx('fr-hint-text')}>
													Visible uniquement par vous et les autres membres de
													l’équipe
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
								</>
							);
						}}
					/>
				</div>
			</form>
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
