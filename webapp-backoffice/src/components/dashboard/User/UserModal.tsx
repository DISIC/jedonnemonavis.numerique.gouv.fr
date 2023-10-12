import { fr } from '@codegouvfr/react-dsfr';
import { ModalProps } from '@codegouvfr/react-dsfr/Modal';
import { RadioButtons } from '@codegouvfr/react-dsfr/RadioButtons';
import { Input } from '@codegouvfr/react-dsfr/Input';
import { Accordion } from '@codegouvfr/react-dsfr/Accordion';
import { Prisma, User } from '@prisma/client';
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
	role: 'user' | 'admin';
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
			editUser.mutate({
				id: user.id,
				user: { ...data }
			});
		} else {
			createUser.mutate(data);
		}
	};

	const resetForm = () => {
		reset({
			email: '',
			firstName: '',
			lastName: '',
			password: '',
			role: 'user'
		});
	};

	React.useEffect(() => {
		if (user) {
			const userWithoutPassword = { ...user, password: '' };
			reset(userWithoutPassword as FormValues);
		} else {
			resetForm();
		}
	}, [user, isOpen]);

	const createUser = trpc.user.create.useMutation({
		onSuccess: () => handleModalClose(),
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
		onSuccess: () => handleModalClose()
	});

	const displayModalTitle = (): string => {
		if (user) {
			return 'Modifier un utilisateur';
		} else {
			return 'Créer un utilisateur';
		}
	};

	const handleModalClose = () => {
		refetchUsers();
		modal.close();
		resetForm();
	};

	const displayModalContent = (): JSX.Element => {
		return (
			<div className={fr.cx('fr-container', 'fr-container--fluid')}>
				<Controller
					control={control}
					name="email"
					rules={{ required: 'Ce champ est requis' }}
					render={({ field: { onChange, value } }) => (
						<Input
							label="Email"
							className={cx(classes.boldText)}
							state={errors.email ? 'error' : 'default'}
							stateRelatedMessage={errors.email?.message}
							nativeInputProps={{
								onChange,
								value
							}}
						/>
					)}
				/>
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
				onClick: handleModalClose
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
			className={fr.cx(
				'fr-grid-row',
				'fr-grid-row--center',
				'fr-grid-row--gutters',
				'fr-my-0'
			)}
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
