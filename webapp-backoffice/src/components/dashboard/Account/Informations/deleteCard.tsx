import { fr } from '@codegouvfr/react-dsfr';
import React from 'react';
import { tss } from 'tss-react/dsfr';
import { User } from '@/prisma/generated/zod';
import Button from '@codegouvfr/react-dsfr/Button';
import GenericCardInfos from './genericCardAccount';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import OnConfirmModal from '@/src/components/ui/modal/OnConfirm';
import { trpc } from '@/src/utils/trpc';
import { signOut } from 'next-auth/react';

interface Props {
	user: User;
}

const onConfirmModal = createModal({
	id: 'user-delete-account-modal',
	isOpenedByDefault: false
});

const DeleteCard = (props: Props) => {
	const { user } = props;
	const { cx, classes } = useStyles();

	const deleteUser = trpc.user.delete.useMutation({
		onSuccess: () => {
			signOut();
		}
	});

	const handleDeletion = () => {
		onConfirmModal.open();
	};

	return (
		<>
			<OnConfirmModal
				modal={onConfirmModal}
				title={`Suppresion de compte`}
				handleOnConfirm={() => {
					deleteUser.mutate({ id: user?.id as number });
					onConfirmModal.close();
				}}
			>
				<>
					<>Êtes-vous sûr de vouloir supprimer votre compte ?</>
				</>
			</OnConfirmModal>
			<GenericCardInfos
				title={'Suppression du compte'}
				hint={'Cette action est irréversible.'}
				modifiable={false}
				viewModeContent={
					<>
						<Button
							priority="tertiary"
							iconId="fr-icon-delete-bin-line"
							iconPosition="right"
							className={cx(fr.cx('fr-mr-5v'), classes.iconError)}
							onClick={() => handleDeletion()}
						>
							Supprimer le compte
						</Button>
					</>
				}
			/>
		</>
	);
};

const useStyles = tss.withName(DeleteCard.name).create(() => ({
	iconError: {
		color: fr.colors.decisions.text.default.error.default
	}
}));

export default DeleteCard;
