import { Form } from '@/prisma/generated/zod';
import { CustomModalProps } from '@/src/types/custom';
import { FormWithElements } from '@/src/types/prismaTypesExtended';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Input from '@codegouvfr/react-dsfr/Input';
import React from 'react';
import DeleteButtonOrFormPanel from '../Pannels/DeleteButtonOrFormPanel';

interface Props {
	modal: CustomModalProps;
	form: FormWithElements;
	onDelete: (form: Form) => void;
}

const FormDeleteModal = ({ modal, form, onDelete }: Props) => {
	const [deleteReason, setDeleteReason] = React.useState(
		form.delete_reason || ''
	);

	const updateForm = trpc.form.update.useMutation({
		onSuccess: result => {
			onDelete(result.data);
			modal.close();
		}
	});

	const handleFormDelete = () => {
		const { form_configs, product, form_template, ...data } = form;
		updateForm.mutate({
			id: form.id,
			form: {
				...data,
				deleted_at: new Date(),
				delete_reason: deleteReason || null
			}
		});
	};

	return (
		<modal.Component
			title={'Fermer le formulaire'}
			concealingBackdrop={false}
			size="large"
			className={fr.cx(
				'fr-grid-row',
				'fr-grid-row--center',
				'fr-grid-row--gutters',
				'fr-my-0'
			)}
			buttons={[
				{
					children: 'Annuler',
					priority: 'secondary'
				},
				{
					children: 'Fermer le formulaire',
					onClick: handleFormDelete,
					doClosesModal: false
				}
			]}
		>
			<DeleteButtonOrFormPanel isForForm />
			<Input
				id="form-delete-reason"
				label={<p className={fr.cx('fr-mb-0')}>Raison de la fermeture</p>}
				nativeInputProps={{
					name: 'form-delete-reason',
					onChange: e => {
						setDeleteReason(e.target.value);
					}
				}}
			/>
		</modal.Component>
	);
};

export default FormDeleteModal;
