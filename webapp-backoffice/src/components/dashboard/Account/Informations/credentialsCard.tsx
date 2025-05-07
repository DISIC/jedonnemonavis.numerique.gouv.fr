import { fr } from '@codegouvfr/react-dsfr';
import React, { ReactElement } from 'react';
import { tss } from 'tss-react/dsfr';
import { User, UserSchema } from '@/prisma/generated/zod';
import Button from '@codegouvfr/react-dsfr/Button';
import GenericCardInfos from './genericCardAccount';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { signIn, signOut, useSession } from 'next-auth/react';
import Input from '@codegouvfr/react-dsfr/Input';
import { trpc } from '@/src/utils/trpc';
import OnConfirmModal from '@/src/components/ui/modal/OnConfirm';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { Toast } from '@/src/components/ui/Toast';
import Alert from '@codegouvfr/react-dsfr/Alert';
import { push } from '@socialgouv/matomo-next';
import { useRouter } from 'next/router';

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
	const router = useRouter();
	const [resolvePromise, setResolvePromise] = React.useState<
		((value: boolean) => void) | null
	>(null);
	const [modalType, setModalType] = React.useState<
		'change-mail' | 'change-pwd'
	>('change-mail');

	const {
		control,
		handleSubmit,
		setError,
		formState: { errors },
		watch
	} = useForm<FormValues>({
		defaultValues: { ...user, email: '' }
	});

	const editUser = trpc.user.update.useMutation({
		onSuccess: async () => {
			utils.user.getById.invalidate({});
			signOut();
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

	const onLocalSubmit = async (data: FormValues): Promise<boolean> => {
		const dataParsed = UserSchema.parse(data);
		try {
			await editUser.mutateAsync({
				id: user.id,
				user: { ...dataParsed }
			});
			return true;
		} catch (error) {
			return false;
		}
	};

	const onFormSubmit = (): Promise<boolean> => {
		return new Promise<boolean>(resolve => {
			setResolvePromise(() => resolve);
			setModalType('change-mail');
			onConfirmModal.open();
		});
	};

	const handleConfirm = () => {
		onConfirmModal.close();
		if (resolvePromise) {
			handleSubmit(async data => {
				const result = await onLocalSubmit(data);
				resolvePromise(result);
			})();
		}
	};

	const emailValue = watch('email');

	const initResetPwd = trpc.user.initResetPwd.useMutation({});

	return (
		<>
			<OnConfirmModal
				modal={onConfirmModal}
				title={`${modalType === 'change-mail' ? "Changer l'adresse mail" : 'Réinitialiser le mot de passe'}`}
				handleOnConfirm={() => {
					if (modalType === 'change-mail') {
						handleConfirm();
					} else {
						initResetPwd.mutate({
							email: session?.user.email || ''
						});
						setDisplayToast(true);
						onConfirmModal.close();
					}
				}}
			>
				<>
					{modalType === 'change-mail' ? (
						<p>
							Le changement d'adresse email entraînera une déconnexion de la
							plateforme. Souhaitez-vous continuer?
						</p>
					) : (
						<p>
							Nous enverrons un lien pour réinitialiser votre mot de passe à
							l'adresse suivante : {session?.user.email}
						</p>
					)}
				</>
			</OnConfirmModal>
			<GenericCardInfos
				title={'Identifiants de connexion'}
				modifiable={true}
				onSubmit={onFormSubmit}
				viewModeContent={
					<>
						{displayToast && (
							<div className={cx(fr.cx('fr-mt-4v'))} role="status">
								<Alert
									closable
									onClose={function noRefCheck() {
										setDisplayToast(false);
									}}
									severity={'success'}
									className={fr.cx('fr-mb-5w')}
									small
									description={
										'Email de réinitialisation du mot de passe envoyé avec succès'
									}
								/>
							</div>
						)}
						<div
							className={fr.cx(
								'fr-grid-row',
								'fr-grid-row--gutters',
								'fr-grid-row--middle'
							)}
						>
							<div className={fr.cx('fr-col-12', 'fr-text--bold')}>
								Adresse e-mail
							</div>
							<div
								className={fr.cx('fr-col-12', 'fr-pt-0', 'fr-mb-4v')}
								style={{ wordBreak: 'break-all' }}
							>
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
							<div className={fr.cx('fr-col-12', 'fr-text--bold')}>
								Mot de passe
							</div>
							<div className={fr.cx('fr-col-12', 'fr-pt-0')}>
								*****************
							</div>
						</div>
					</>
				}
				editModeContent={
					<>
						{displayToast && (
							<div className={cx(fr.cx('fr-mt-4v'))} role="status">
								<Alert
									closable
									onClose={function noRefCheck() {
										setDisplayToast(false);
									}}
									severity={'success'}
									className={fr.cx('fr-mb-5w')}
									small
									description={
										<>
											<p role="status">
												Email de réinitialisation du mot de passe envoyé avec
												succès.
											</p>
										</>
									}
								/>
							</div>
						)}
						<div
							className={fr.cx(
								'fr-grid-row',
								'fr-grid-row--gutters',
								'fr-grid-row--middle'
							)}
						>
							<div className={cx(fr.cx('fr-col-md-6'), classes.formContainer)}>
								<form id="credentials-form">
									<div className={fr.cx('fr-input-group')}>
										<Input
											label={
												<p className={fr.cx('fr-mb-0', 'fr-text--bold')}>
													Adresse e-mail actuelle
												</p>
											}
											disabled={true}
											nativeInputProps={{
												value: user.email || '',
												required: true,
												disabled: true
											}}
										/>
									</div>
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
															Nouvelle adresse e-mail
														</p>
													}
													nativeInputProps={{
														onChange,
														value: value || '',
														name,
														required: true,
														placeholder: 'Saisissez votre nouvelle adresse mail'
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
															Confirmation de la nouvelle adresse e-mail
														</p>
													}
													nativeInputProps={{
														onChange,
														value: value || '',
														name,
														required: true,
														placeholder: 'Confirmez votre nouvelle adresse mail'
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
							<div className={cx(fr.cx('fr-col-md-12', 'fr-pt-0'), classes.buttonContainer)}>
								<Button
									priority="secondary"
									onClick={() => {
										setModalType('change-pwd');
										onConfirmModal.open();
										push([
											'trackEvent',
											'BO - Account',
											`Credentials-Modal-Open`
										]);
									}}
									className={classes.buttonContainer}
								>
									Réinitialiser le mot de passe
								</Button>
							</div>
						</div>
					</>
				}
			/>
		</>
	);
};

const useStyles = tss.withName(CredentialsCard.name).create(() => ({
	formContainer: {
		[fr.breakpoints.down('md')]: {
			width: '100%'
		}
	},
	buttonContainer: {
		[fr.breakpoints.down('md')]: {
			width: '100%',
			justifyContent: 'center',
		}
	}
}));

export default CredentialsCard;
