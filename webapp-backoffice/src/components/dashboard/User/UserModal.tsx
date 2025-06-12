import { fr } from '@codegouvfr/react-dsfr';
import { ModalProps } from '@codegouvfr/react-dsfr/Modal';
import { RadioButtons } from '@codegouvfr/react-dsfr/RadioButtons';
import { Button } from '@codegouvfr/react-dsfr/Button';
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
import { CustomModalProps } from '@/src/types/custom';


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
									value,
									name: 'email'
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
										type: 'password',
										name: 'password'
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
									value,
									name: 'firstName'
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
									value,
									name: 'lastName'
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
					<div className={classes.buttonsContainer}>
						{displayModalButtons().map((button, index) => (
							<Button
								key={index}
								priority={button.priority}
								onClick={button.onClick}
								className={classes.button}
							>
								{button.children}
							</Button>
						))}
					</div>
				</form>
			</div>
		);
	};

	const displayModalButtons = ():
		[ModalProps.ActionAreaButtonProps, ...ModalProps.ActionAreaButtonProps[]]=> {
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
	buttonsContainer: { 
		display: 'flex', 
		flexDirection: 'column-reverse', 
		gap: '1.5rem', 
		marginTop: '2rem',
		[fr.breakpoints.up('md')]: {
			flexDirection: 'row',
			justifyContent: 'end',
		} 
	},
	button: {
		display: 'flex', 
		justifyContent:'center', 
		width: '100%',
		[fr.breakpoints.up('md')]: {
			width: 'initial'
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
