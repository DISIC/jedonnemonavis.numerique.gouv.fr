import { CustomModalProps } from '@/src/types/custom';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Input from '@codegouvfr/react-dsfr/Input';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import { Form } from '@prisma/client';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { tss } from 'tss-react/dsfr';
import { Toast } from '../../ui/Toast';

interface Props {
	modal: CustomModalProps;
	form?: Form;
	productId: number;
	defaultTitle?: string;
}

type FormValues = Omit<Form, 'id' | 'created_at' | 'updated_at'>;

const FormCreationModal = ({ modal, form, productId, defaultTitle }: Props) => {
	const router = useRouter();
	const { cx, classes } = useStyles();
	const modalOpen = useIsModalOpen(modal);
	const [displayToast, setDisplayToast] = React.useState(false);

	const { data: rootFormTemplate } = trpc.form.getFormTemplateBySlug.useQuery(
		{ slug: 'root' },
		{
			enabled: modalOpen
		}
	);

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors }
	} = useForm<FormValues>({
		defaultValues: {
			title: form?.title || defaultTitle || rootFormTemplate?.data?.title || ''
		}
	});

	useEffect(() => {
		reset({
			title: form?.title || defaultTitle || rootFormTemplate?.data?.title || ''
		});
	}, [defaultTitle]);

	const utils = trpc.useUtils();

	const saveFormTmp = trpc.form.create.useMutation({
		onSuccess: () => {
			utils.adminEntityRight.getUserList.invalidate();
		}
	});
	const updateForm = trpc.form.update.useMutation({
		onSuccess: () => {
			utils.adminEntityRight.getUserList.invalidate();
		}
	});

	const onLocalSubmit: SubmitHandler<FormValues> = async data => {
		let formId;

		if (form && form.id) {
			await updateForm.mutateAsync({
				id: form.id,
				form: {
					...data,
					product_id: productId
				}
			});
			router.reload();
		} else {
			if (!rootFormTemplate?.data?.id) return setDisplayToast(true);
			const savedFormResponse = await saveFormTmp.mutateAsync({
				...data,
				product_id: productId,
				form_template_id: rootFormTemplate?.data?.id
			});
			formId = savedFormResponse.data.id;
			router.push(`/administration/dashboard/product/${productId}/forms`);
		}

		modal.close();
	};

	return (
		<>
			<Toast
				isOpen={displayToast}
				setIsOpen={setDisplayToast}
				autoHideDuration={4000}
				severity="error"
				message="Aucun modèle de formulaire n'a été trouvé."
				placement={{ vertical: 'bottom', horizontal: 'center' }}
			/>
			<modal.Component
				className={fr.cx(
					'fr-grid-row',
					'fr-grid-row--center',
					'fr-grid-row--gutters',
					'fr-my-0'
				)}
				concealingBackdrop={false}
				title={
					form
						? 'Modifier le formulaire existant'
						: 'Créer un nouveau formulaire'
				}
				size="large"
				buttons={[
					{
						children: 'Annuler'
					},
					{
						doClosesModal: false,
						onClick: handleSubmit(onLocalSubmit),
						children: form ? 'Modifier' : 'Créer'
					}
				]}
			>
				<form id="form-creation-form">
					<div className={fr.cx('fr-input-group')}>
						<Controller
							control={control}
							name="title"
							rules={{ required: 'Ce champ est obligatoire' }}
							render={({ field: { onChange, value, name } }) => {
								return (
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
										state={errors[name] ? 'error' : 'default'}
										stateRelatedMessage={errors[name]?.message}
									/>
								);
							}}
						/>
					</div>
				</form>
			</modal.Component>
		</>
	);
};

const useStyles = tss.withName(FormCreationModal.name).create(() => ({
	asterisk: {
		color: fr.colors.decisions.text.default.error.default
	}
}));

export default FormCreationModal;
