import { CustomModalProps } from '@/src/types/custom';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Input from '@codegouvfr/react-dsfr/Input';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import { Form } from '@prisma/client';
import { useRouter } from 'next/router';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { tss } from 'tss-react/dsfr';

interface Props {
	modal: CustomModalProps;
	form: Form;
	productId: number;
}

type FormValues = Omit<Form, 'id' | 'created_at' | 'updated_at'>;

const FormEditModal = ({ modal, form, productId }: Props) => {
	const router = useRouter();
	const { cx, classes } = useStyles();
	const modalOpen = useIsModalOpen(modal);

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
			title: form?.title || rootFormTemplate?.data?.title || ''
		}
	});

	const utils = trpc.useUtils();

	const updateForm = trpc.form.update.useMutation({
		onSuccess: () => {
			utils.adminEntityRight.getUserList.invalidate();
		}
	});

	const onLocalSubmit: SubmitHandler<FormValues> = async data => {
		await updateForm.mutateAsync({
			id: form.id,
			form: {
				...data,
				product_id: productId
			}
		});
		modal.close();
		router.push(router.asPath);
	};

	return (
		<>
			<modal.Component
				className={fr.cx(
					'fr-grid-row',
					'fr-grid-row--center',
					'fr-grid-row--gutters',
					'fr-my-0'
				)}
				concealingBackdrop={false}
				title={'Renommer le formulaire existant'}
				size="large"
				buttons={[
					{
						children: 'Annuler'
					},
					{
						doClosesModal: false,
						onClick: handleSubmit(onLocalSubmit),
						children: 'Renommer'
					}
				]}
			>
				<form id="form-edit-form">
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

const useStyles = tss.withName(FormEditModal.name).create(() => ({
	asterisk: {
		color: fr.colors.decisions.text.default.error.default
	}
}));

export default FormEditModal;
