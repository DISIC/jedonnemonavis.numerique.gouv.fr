import { isValidEmail } from '@/utils/tools';
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

type Props = {
	userPresetInfos?: UserInfos;
	otp_id?: string;
};

type UserInfos = {
	firstName?: string;
	lastName?: string;
	email?: string;
	password?: string;
};

type FormErrors = {
	firstName: { required: boolean };
	lastName: { required: boolean };
	email: { required: boolean; format: boolean; conflict: boolean };
	password: { required: boolean; format: boolean };
};

type PasswordMessages = {
	severity: PasswordInputProps.Severity;
	message: ReactNode;
}[];

const regexAtLeastOneSpecialCharacter = /[^a-zA-Z0-9\s]/;
const regexAtLeastOneNumber = /\d/;

export const RegisterForm = (props: Props) => {
	const { otp_id, userPresetInfos } = props;

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
	const [errors, setErrors] = useState<FormErrors>({ ...defaultErrors });
	const [registered, setRegistered] = useState<
		'classic' | 'from_otp' | undefined
	>();

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

		fetch('/api/auth/register?', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ ...userInfos, otp_id: otp_id as string })
		}).then(res => {
			if (res.status === 200)
				res.json().then(json => {
					const registerMode = json.user.active ? 'from_otp' : 'classic';
					router.query.registered = registerMode;
					router.push(router);
					setRegistered(registerMode);
				});
			else if (res.status === 409) {
				errors.email.conflict = true;
				setErrors({ ...errors });
			}
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

	if (registered) {
		return (
			<div>
				<h5>Se créer un compte</h5>
				{registered === 'classic' ? (
					<p>
						Votre compte a été créé avec succès. <br />
						<br />
						Un e-mail contenant un lien de validation vous sera envoyé. Veuillez
						également vérifier votre dossier de spams.
					</p>
				) : (
					<p>
						Votre ancien compte de l&apos;observatoire a été configuré avec
						succès. <br />
						<br />
						<Link className={fr.cx('fr-link')} href="/login">
							Connectez-vous dès maintenant
						</Link>{' '}
						pour gérer vos boutons Je donne mon avis dans ce nouvel espace.
					</p>
				)}
			</div>
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
					disabled={!!otp_id}
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
