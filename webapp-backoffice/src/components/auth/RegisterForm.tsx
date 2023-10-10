import { isValidEmail } from '@/src/utils/tools';
import { fr } from '@codegouvfr/react-dsfr';
import Alert from '@codegouvfr/react-dsfr/Alert';
import { Button } from '@codegouvfr/react-dsfr/Button';
import { Input } from '@codegouvfr/react-dsfr/Input';
import {
	PasswordInput,
	PasswordInputProps
} from '@codegouvfr/react-dsfr/blocks/PasswordInput';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode, useEffect, useState } from 'react';
import { tss } from 'tss-react/dsfr';
import { RegisterValidationMessage } from './RegisterConfirmMessage';
import { RegisterNotWhiteListed } from './RegisterNotWhiteListed';
import { trpc } from '@/src/utils/trpc';
import { Prisma } from '@prisma/client';

type Props = {
	userPresetInfos?: UserInfos;
	otp?: string;
};

export type UserInfos = {
	firstName?: string;
	lastName?: string;
	email?: string;
	password?: string;
	inviteToken?: string;
};

type FormErrors = {
	firstName: { required: boolean };
	lastName: { required: boolean };
	email: {
		required: boolean;
		format: boolean;
		conflict: boolean;
	};
	password: { required: boolean; format: boolean };
};

type PasswordMessages = {
	severity: PasswordInputProps.Severity;
	message: ReactNode;
}[];

const regexAtLeastOneSpecialCharacter = /[^a-zA-Z0-9\s]/;
const regexAtLeastOneNumber = /\d/;

export const RegisterForm = (props: Props) => {
	const { otp, userPresetInfos } = props;

	const router = useRouter();

	const defaultErrors = {
		firstName: {
			required: false
		},
		lastName: {
			required: false
		},
		email: {
			required: false,
			format: false,
			conflict: false
		},
		password: {
			required: false,
			format: false
		}
	};

	const [userInfos, setUserInfos] = useState<UserInfos>({});
	const [userNotWhiteListed, setUserNotWhiteListed] = useState<boolean>(false);
	const [errors, setErrors] = useState<FormErrors>({ ...defaultErrors });
	const [registered, setRegistered] = useState<RegisterValidationMessage>();

	const registerUser = trpc.user.register.useMutation({
		onSuccess: result => {
			if (result.data) {
				const registerMode = result.data.active ? 'from_otp' : 'classic';
				router.query.registered = registerMode;
				router.push(router);
				setRegistered(registerMode);
			}
		},
		onError: error => {
			if (error.data?.httpStatus === 409) {
				errors.email.conflict = true;
				setErrors({ ...errors });
			} else if (error.data?.httpStatus === 401) {
				router.query.request = 'whitelist';
				router.push(router);
				setUserNotWhiteListed(true);
			}
		}
	});

	const { classes, cx } = useStyles({ errors });

	const resetErrors = (key: keyof FormErrors) => {
		setErrors({ ...errors, [key]: defaultErrors[key] });
	};

	const formHasErrors = (tmpErrors?: FormErrors): boolean => {
		return Object.values(tmpErrors || errors)
			.map(e => Object.values(e).some(value => value === true))
			.some(value => value);
	};

	const hasErrors = (key: keyof FormErrors): boolean => {
		return Object.values(errors[key]).some(value => value === true);
	};

	const getErrorMessage = (key: keyof FormErrors): string | undefined => {
		if (errors[key].required) return 'Veuillez compléter ce champ.';

		if (key === 'email') {
			if (errors[key].format) return "Format de l'email incorrect.";
			if (errors[key].conflict)
				return 'Il y a déjà un compte avec cette adresse email.';
		}

		return;
	};

	const getPasswordMessages = (): PasswordMessages => {
		const messages: PasswordMessages = [];

		if (errors.password.required) {
			messages.push({
				message: 'Veuillez renseigner un mot de passe.',
				severity: 'error'
			});
			return messages;
		}

		messages.push({
			message: '12 caractères minimum',
			severity: !userInfos.password
				? 'info'
				: userInfos.password.length >= 12
				? 'valid'
				: 'error'
		});

		messages.push({
			message: '1 caractère spécial',
			severity: !userInfos.password
				? 'info'
				: regexAtLeastOneSpecialCharacter.test(userInfos.password)
				? 'valid'
				: 'error'
		});

		messages.push({
			message: '1 chiffre minimum',
			severity: !userInfos.password
				? 'info'
				: regexAtLeastOneNumber.test(userInfos.password)
				? 'valid'
				: 'error'
		});

		return messages;
	};

	const register = () => {
		if (!userInfos.firstName) {
			errors.firstName.required = true;
		}

		if (!userInfos.lastName) {
			errors.lastName.required = true;
		}

		if (!userInfos.email) {
			errors.email.required = true;
		} else if (!isValidEmail(userInfos.email)) {
			errors.email.format = true;
		}

		if (!userInfos.password) {
			errors.password.required = true;
		} else {
			errors.password.format =
				userInfos.password.length < 12 ||
				!regexAtLeastOneSpecialCharacter.test(userInfos.password) ||
				!regexAtLeastOneNumber.test(userInfos.password);
		}

		if (formHasErrors(errors)) {
			setErrors({ ...errors });
			return;
		}

		const { inviteToken, ...userInfosWithoutInviteToken } = userInfos;

		registerUser.mutate({
			user: userInfosWithoutInviteToken as Prisma.UserCreateInput,
			inviteToken,
			otp
		});
	};

	useEffect(() => {
		if (
			userPresetInfos &&
			(userPresetInfos?.email ||
				userPresetInfos.firstName ||
				userPresetInfos?.lastName)
		)
			setUserInfos(userPresetInfos);
	}, [userPresetInfos]);

	if (userNotWhiteListed) {
		return <RegisterNotWhiteListed userInfos={userInfos} />;
	}

	if (registered) {
		return (
			<RegisterValidationMessage
				mode={registered}
				isUserInvited={userInfos.inviteToken !== undefined}
			/>
		);
	}

	return (
		<div>
			<h5>Se créer un compte</h5>
			<p>
				Description — Lorem ipsum dolor sit amet, consectetur adipiscing elit.
			</p>
			<p className={fr.cx('fr-hint-text')}>
				Sauf mention contraire, tous les champs sont obligatoires.
			</p>
			{errors.email.conflict && (
				<Alert
					className={fr.cx('fr-mb-4v', 'fr-text--sm')}
					closable
					description={
						<>
							Il y a déjà un compte avec cette adresse email.{' '}
							<Link className={fr.cx('fr-link', 'fr-text--sm')} href="/login">
								Veuillez vous connecter ici.
							</Link>
						</>
					}
					onClose={function noRefCheck() {}}
					severity="error"
					title=""
				/>
			)}
			<form
				onSubmit={e => {
					e.preventDefault();
					register();
				}}
			>
				<Input
					label="Prénom"
					nativeInputProps={{
						onChange: e => {
							setUserInfos({ ...userInfos, firstName: e.target.value });
							resetErrors('firstName');
						},
						value: userInfos.firstName,
						name: 'firstName'
					}}
					state={hasErrors('firstName') ? 'error' : 'default'}
					stateRelatedMessage={getErrorMessage('firstName')}
				/>
				<Input
					label="Nom"
					nativeInputProps={{
						onChange: e => {
							setUserInfos({ ...userInfos, lastName: e.target.value });
							resetErrors('lastName');
						},
						value: userInfos.lastName,
						name: 'lastName'
					}}
					state={hasErrors('lastName') ? 'error' : 'default'}
					stateRelatedMessage={getErrorMessage('lastName')}
				/>
				<Input
					hintText="Format attendu : nom@domaine.fr"
					label="Adresse email"
					disabled={
						!!otp ||
						(userInfos.email !== undefined &&
							userInfos.inviteToken !== undefined)
					}
					nativeInputProps={{
						onChange: e => {
							setUserInfos({ ...userInfos, email: e.target.value });
							resetErrors('email');
						},
						value: userInfos.email,
						name: 'email'
					}}
					state={hasErrors('email') ? 'error' : 'default'}
					stateRelatedMessage={getErrorMessage('email')}
				/>
				<PasswordInput
					label="Mot de passe"
					className={cx(classes.password)}
					nativeInputProps={{
						onChange: e => {
							setUserInfos({ ...userInfos, password: e.target.value });
							resetErrors('password');
						},
						value: userInfos.password
					}}
					messages={getPasswordMessages()}
					messagesHint={
						errors.password.required
							? ''
							: 'Votre mot de passe doit contenir au moins :'
					}
				/>
				<Button className={cx(classes.button)} type="submit">
					Valider
				</Button>
			</form>
		</div>
	);
};

const useStyles = tss
	.withName(RegisterForm.name)
	.withParams<{ errors: FormErrors }>()
	.create(({ errors }) => ({
		button: {
			display: 'block',
			marginLeft: 'auto'
		},
		password: {
			marginBottom:
				errors.password.format || errors.password.required
					? fr.spacing('5v')
					: 0
		}
	}));
