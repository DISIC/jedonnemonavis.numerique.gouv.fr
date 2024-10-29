import { fr } from '@codegouvfr/react-dsfr';
import React, { ReactElement } from 'react';
import { tss } from 'tss-react/dsfr';
import { User } from '@/prisma/generated/zod';
import Button from '@codegouvfr/react-dsfr/Button';
import GenericCardInfos from './genericCardAccount';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { signOut, useSession } from 'next-auth/react';
import Input from '@codegouvfr/react-dsfr/Input';
import { trpc } from '@/src/utils/trpc';
import OnConfirmModal from '@/src/components/ui/modal/OnConfirm';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { Toast } from '@/src/components/ui/Toast';

interface Props {
	user: User;
}

const onConfirmModal = createModal({
	id: 'user-reset-pwd-modal',
	isOpenedByDefault: false
});

type FormValues = Omit<User, 'id' | 'created_at' | 'updated_at'> & {
	emailConfirmation: string;
};

const CredentialsCard = (props: Props) => {
	const { user } = props;
	const { cx, classes } = useStyles();
	const utils = trpc.useUtils();
	const { data: session, update: refetchSession } = useSession();
	const [displayToast, setDisplayToast] = React.useState<boolean>(false);
	const [displayErrorToast, setDisplayErrorToast] =
		React.useState<boolean>(false);

	const {
		control,
		handleSubmit,
		setError,
		formState: { errors },
		watch
	} = useForm<FormValues>({
		defaultValues: { ...user }
	});

	const editUser = trpc.user.update.useMutation({
		onSuccess: async () => {
			utils.user.getById.invalidate({});
			await refetchSession();
		},
		onError: error => {
			switch (error.data?.httpStatus) {
				case 409:
					setError('email', {
						type: 'manual',
						message: 'Cette adresse mail existe déjà'
					});
					break;
				case 401:
					setError('email', {
						type: 'manual',
						message:
							'Cette adresse mail ne fait pas partie des domaines autorisés. Veuillez contacter le support si vous souhaitez utiliser cette adresse.'
					});
					break;
			}
		}
	});

	const onFormSubmit = (): Promise<boolean> => {
		return new Promise(resolve => {
			handleSubmit(async data => {
				const result = await onLocalSubmit(data);
				resolve(result as boolean);
			})();
		});
	};

	const onLocalSubmit: SubmitHandler<FormValues> = async (
		data
	): Promise<boolean> => {
		const { emailConfirmation, ...updateUser } = data;
		try {
			await editUser.mutateAsync({
				id: user.id,
				user: { ...updateUser }
			});
			return true;
		} catch (error) {
			return false;
		}
	};

	const emailValue = watch('email');

	const initResetPwd = trpc.user.initResetPwd.useMutation({});

	return (
		<>
			<Toast
				isOpen={displayToast}
				setIsOpen={setDisplayToast}
				autoHideDuration={4000}
				severity="success"
				message="Email envoyé avec succès"
			/>
			<Toast
				isOpen={displayErrorToast}
				setIsOpen={setDisplayErrorToast}
				autoHideDuration={4000}
				severity="error"
				message="Cette adresse mail existe déjà"
			/>
			<OnConfirmModal
				modal={onConfirmModal}
				title={`Réinitialiser le mot de passe`}
				handleOnConfirm={() => {
					initResetPwd.mutate({
						email: session?.user.email || ''
					});
					setDisplayToast(true);
					onConfirmModal.close();
				}}
			>
				<>
					<>
						Nous enverrons un lien pour réinitialiser votre mot de passe à
						l'adresse suivante : {session?.user.email}
					</>
				</>
			</OnConfirmModal>
			<GenericCardInfos
				title={'Identifiants de connexion'}
				modifiable={true}
				onSubmit={onFormSubmit}
				viewModeContent={
					<>
						<div
							className={fr.cx(
								'fr-grid-row',
								'fr-grid-row--gutters',
								'fr-grid-row--middle'
							)}
						>
							<div className={fr.cx('fr-col-md-12', 'fr-text--bold')}>
								Adresse e-mail
							</div>
							<div className={fr.cx('fr-col-md-12', 'fr-pt-0', 'fr-mb-4v')}>
								{user.email}
							</div>
						</div>
						<div
							className={fr.cx(
								'fr-grid-row',
								'fr-grid-row--gutters',
								'fr-grid-row--middle'
							)}
						>
							<div className={fr.cx('fr-col-md-12', 'fr-text--bold')}>
								Mot de passe
							</div>
							<div className={fr.cx('fr-col-md-12', 'fr-pt-0')}>
								*****************
							</div>
						</div>
					</>
				}
				editModeContent={
					<div
						className={fr.cx(
							'fr-grid-row',
							'fr-grid-row--gutters',
							'fr-grid-row--middle'
						)}
					>
						<div className={fr.cx('fr-col-md-6')}>
							<form id="credentials-form">
								<div className={fr.cx('fr-input-group')}>
									<Controller
										control={control}
										name="email"
										rules={{
											required: 'Ce champ est obligatoire',
											pattern: {
												value:
													/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
												message: "Format d'adresse e-mail invalide"
											}
										}}
										render={({ field: { onChange, value, name } }) => (
											<Input
												label={
													<p className={fr.cx('fr-mb-0', 'fr-text--bold')}>
														Adresse e-mail
													</p>
												}
												nativeInputProps={{
													onChange,
													value: value || '',
													name,
													required: true
												}}
												state={errors[name] ? 'error' : 'default'}
												stateRelatedMessage={errors[name]?.message}
											/>
										)}
									/>
								</div>
								<div className={fr.cx('fr-input-group')}>
									<Controller
										control={control}
										name="emailConfirmation"
										rules={{
											required: 'Ce champ est obligatoire',
											validate: value =>
												value === emailValue ||
												'Les adresses e-mail ne correspondent pas'
										}}
										render={({ field: { onChange, value, name } }) => (
											<Input
												label={
													<p className={fr.cx('fr-mb-0', 'fr-text--bold')}>
														Vérifiez l'adresse e-mail
													</p>
												}
												nativeInputProps={{
													onChange,
													value: value || '',
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
						</div>
						<div className={fr.cx('fr-col-md-12', 'fr-text--bold')}>
							Mot de passe
						</div>
						<div className={fr.cx('fr-col-md-12', 'fr-pt-0')}>
							<Button
								priority="secondary"
								onClick={() => {
									onConfirmModal.open();
								}}
							>
								Réinitialiser le mot de passe
							</Button>
						</div>
					</div>
				}
			/>
		</>
	);
};

const useStyles = tss.withName(CredentialsCard.name).create(() => ({
	actionContainer: {
		display: 'flex',
		justifyContent: 'flex-end'
	}
}));

export default CredentialsCard;
