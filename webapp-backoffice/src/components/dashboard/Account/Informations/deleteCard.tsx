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
import { Controller, useForm } from 'react-hook-form';
import Input from '@codegouvfr/react-dsfr/Input';
import { router } from '@/src/server/trpc';
import { useRouter } from 'next/router';
import { push } from '@socialgouv/matomo-next';

interface Props {
	user: User;
	isOwn?: Boolean;
}

interface FormValues {
	word: string;
}

const onConfirmModal = createModal({
	id: 'user-delete-account-modal',
	isOpenedByDefault: false
});

const DeleteCard = (props: Props) => {
	const { user, isOwn } = props;
	const { cx, classes } = useStyles();
	const [validateDelete, setValidateDelete] = React.useState(false);
	const router = useRouter();

	const deleteUser = trpc.user.delete.useMutation({
		onSuccess: () => {
			if (isOwn) {
				signOut();
			} else {
				console.log('ok pushing new route');
				router.push('/administration/dashboard/users');
			}
		}
	});

	const handleDeletion = () => {
		onConfirmModal.open();
		push(['trackEvent', 'BO - Account', `Open-Modal-Delete-Account`]);
	};

	const {
		control,
		register,
		setError,
		clearErrors,
		formState: { errors }
	} = useForm<FormValues>({
		defaultValues: {
			word: ''
		}
	});

	const verifyProductName = (e: React.ChangeEvent<HTMLInputElement>) => {
		const normalizedInput = e.target.value.trim().toLowerCase();
		const normalizedWord = 'supprimer';
		if (normalizedInput !== normalizedWord) {
			setError('word', {
				message: 'Mot de confirmation incorrect'
			});
		} else {
			clearErrors('word');
			setValidateDelete(true);
		}
	};

	return (
		<>
			<OnConfirmModal
				modal={onConfirmModal}
				title={`Suppresion de compte`}
				kind="danger"
				handleOnConfirm={() => {
					if (validateDelete) {
						deleteUser.mutate({ id: user?.id as number });
						push(['trackEvent', 'BO - Account', `Validate-Delete-Account`]);
						onConfirmModal.close();
					}
				}}
				disableAction={!validateDelete}
			>
				<>
					<p>Êtes-vous sûr de vouloir supprimer le compte ?</p>
					<form id="delete-product-form">
						<div className={fr.cx('fr-input-group')}>
							<Controller
								control={control}
								name="word"
								rules={{ required: 'Ce champ est obligatoire' }}
								render={({ field: { value, onChange, name } }) => (
									<Input
										label={
											<p className={fr.cx('fr-mb-0')}>
												Veuillez taper le mot "supprimer" pour confirmer la
												suppression
												<span className={cx(classes.asterisk)}>*</span>
											</p>
										}
										nativeInputProps={{
											onChange: e => {
												onChange(e);
												verifyProductName(e);
											},
											defaultValue: value,
											value,
											name,
											required: true
										}}
										state={errors[name] ? 'error' : 'default'}
										stateRelatedMessage={errors[name]?.message}
									/>
								)}
							/>
						</div>
					</form>
				</>
			</OnConfirmModal>
			<GenericCardInfos
				title={'Suppression du compte'}
				hint={'Cette action est irréversible.'}
				modifiable={false}
				smallScreenShowHr={false}
				viewModeContent={
					<>
						<Button
							priority="tertiary"
							iconId="fr-icon-delete-bin-line"
							className={cx(fr.cx('fr-mr-5v'), classes.deleteButton)}
							onClick={() => handleDeletion()}
							nativeButtonProps={{
								'aria-label': 'Supprimer le compte',
								title: 'Supprimer le compte'
							}}
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
	deleteButton: {
		color: fr.colors.decisions.text.default.error.default,
		[fr.breakpoints.down('md')]: {
			justifyContent: 'center',
			width: '100%'
		}
	},
	asterisk: {
		color: fr.colors.decisions.text.default.error.default
	}
}));

export default DeleteCard;
