import { fr } from '@codegouvfr/react-dsfr';
import { ModalProps } from '@codegouvfr/react-dsfr/Modal';
import { RadioButtons } from '@codegouvfr/react-dsfr/RadioButtons';
import { Input } from '@codegouvfr/react-dsfr/Input';
import { Accordion } from '@codegouvfr/react-dsfr/Accordion';
import { Prisma, User, UserRole } from '@prisma/client';
import React from 'react';
import { tss } from 'tss-react/dsfr';
import { Checkbox } from '@codegouvfr/react-dsfr/Checkbox';
import Image from 'next/image';
import { trpc } from '@/src/utils/trpc';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import Select from '@codegouvfr/react-dsfr/Select';

interface CustomModalProps {
	buttonProps: {
		id: string;
		'aria-controls': string;
		'data-fr-opened': boolean;
	};
	Component: (props: ModalProps) => JSX.Element;
	close: () => void;
	open: () => void;
	isOpenedByDefault: boolean;
	id: string;
}

interface Props {
	isOpen: boolean;
	modal: CustomModalProps;
	refetchUsers: () => void;
	user?: User;
}

type FormValues = {
	email: string;
	firstName: string;
	lastName: string;
	password: string;
	role: UserRole;
};

const ButtonModal = (props: Props) => {
	const { cx, classes } = useStyles();
	const { modal, user, isOpen, refetchUsers } = props;

	const {
		control,
		handleSubmit,
		reset,
		setError,
		formState: { errors }
	} = useForm<FormValues>();

	const onSubmit: SubmitHandler<FormValues> = data => {
		if (user) {
			const { password, ...updateUser } = data;
			editUser.mutate({
				id: user.id,
				user: { ...updateUser }
			});
		} else {
			createUser.mutate(data);
		}
	};

	const resetForm = () => {
		reset({
			email: '',
			password: '',
			firstName: '',
			lastName: '',
			role: 'user'
		});
	};

	React.useEffect(() => {
		if (user) {
			reset({
				email: user.email,
				firstName: user.firstName || '',
				lastName: user.lastName || '',
				role: user.role
			});
		} else {
			resetForm();
		}
	}, [user, isOpen]);

	const createUser = trpc.user.create.useMutation({
		onSuccess: () => {
			refetchUsers();
			handleModalClose();
		},
		onError: error => {
			switch (error.data?.httpStatus) {
				case 409:
					setError('email', {
						type: 'Conflict email',
						message: 'Cet email est déjà utilisé'
					});
					break;
			}
		}
	});

	const editUser = trpc.user.update.useMutation({
		onSuccess: () => {
			refetchUsers();
			handleModalClose();
		}
	});

	const displayModalTitle = (): string => {
		if (user) {
			return 'Modifier un utilisateur';
		} else {
			return 'Créer un utilisateur';
		}
	};

	const handleModalClose = () => {
		modal.close();
		resetForm();
	};

	const displayModalContent = (): JSX.Element => {
		return (
			<div>
				<form onSubmit={handleSubmit(onSubmit)}>
					<Controller
						control={control}
						name="email"
						rules={{ required: 'Ce champ est requis' }}
						disabled={!!user}
						render={({ field: { onChange, value, disabled } }) => (
							<Input
								label="Email"
								className={cx(classes.boldText)}
								disabled={disabled}
								state={errors.email ? 'error' : 'default'}
								stateRelatedMessage={errors.email?.message}
								nativeInputProps={{
									onChange,
									value
								}}
							/>
						)}
					/>
					{!user && (
						<Controller
							control={control}
							name="password"
							rules={{
								required: 'Ce champ est requis',
								minLength: {
									value: 12,
									message:
										'Votre mot de passe doit contenir au moins 12 caractères'
								},
								pattern: {
									value: /^(?=.*[0-9])(?=.*[!@#$%^&*])/,
									message:
										'Votre mot de passe doit contenir au moins un chiffre et un caractère spécial'
								}
							}}
							render={({ field: { onChange, value } }) => (
								<Input
									label="Mot de passe"
									className={cx(classes.boldText)}
									state={errors.password ? 'error' : 'default'}
									stateRelatedMessage={errors.password?.message}
									nativeInputProps={{
										onChange,
										value,
										type: 'password'
									}}
								/>
							)}
						/>
					)}
					<Controller
						control={control}
						name="firstName"
						rules={{ required: 'Ce champ est requis' }}
						render={({ field: { onChange, value } }) => (
							<Input
								label="Prénom"
								className={cx(classes.boldText)}
								state={errors.firstName ? 'error' : 'default'}
								stateRelatedMessage={errors.firstName?.message}
								nativeInputProps={{
									onChange,
									value
								}}
							/>
						)}
					/>
					<Controller
						control={control}
						name="lastName"
						rules={{ required: 'Ce champ est requis' }}
						render={({ field: { onChange, value } }) => (
							<Input
								label="Nom"
								className={cx(classes.boldText)}
								state={errors.lastName ? 'error' : 'default'}
								stateRelatedMessage={errors.lastName?.message}
								nativeInputProps={{
									onChange,
									value
								}}
							/>
						)}
					/>
					<Controller
						control={control}
						name="role"
						rules={{ required: 'Ce champ est requis' }}
						render={({ field: { onChange, value } }) => (
							<Select
								label="Rôle"
								className={cx(classes.boldText)}
								state={errors.role ? 'error' : 'default'}
								stateRelatedMessage={errors.role?.message}
								nativeSelectProps={{
									onChange,
									value
								}}
							>
								<option value="user" defaultChecked>
									Utilisateur
								</option>
								<option value="admin">Administrateur</option>
							</Select>
						)}
					/>
				</form>
			</div>
		);
	};

	const displayModalButtons = ():
		| ModalProps.ActionAreaButtonProps
		| [ModalProps.ActionAreaButtonProps, ...ModalProps.ActionAreaButtonProps[]]
		| undefined => {
		return [
			{
				children: 'Annuler',
				priority: 'secondary',
				doClosesModal: false,
				onClick: () => handleModalClose()
			},
			{
				children: user ? 'Modifier' : 'Créer',
				priority: 'primary',
				doClosesModal: false,
				onClick: () => handleSubmit(onSubmit)()
			}
		];
	};

	return (
		<modal.Component
			title={displayModalTitle()}
			concealingBackdrop={false}
			size="large"
			className={fr.cx('fr-my-0')}
			buttons={displayModalButtons()}
		>
			{displayModalContent()}
		</modal.Component>
	);
};

const useStyles = tss.withName(ButtonModal.name).create(() => ({
	textArea: {
		'.fr-input': {
			height: '200px',
			minHeight: '200px'
		}
	},
	topContainer: {
		display: 'flex',
		justifyContent: 'space-between'
	},
	accordion: {
		'.fr-accordion__btn': {
			backgroundColor: '#FFF',
			color: fr.colors.decisions.text.active.grey.default
		},
		'.fr-accordion__btn[aria-expanded=true]': {
			backgroundColor: '#FFF',
			color: fr.colors.decisions.text.active.grey.default,
			'&:hover': {
				backgroundColor: '#FFF'
			},
			'&:active': {
				backgroundColor: '#FFF'
			}
		}
	},
	boldText: {
		fontWeight: 'bold'
	},
	asterisk: {
		color: fr.colors.decisions.text.default.error.default
	}
}));

export default ButtonModal;
