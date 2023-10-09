import { isValidEmail } from '@/src/utils/tools';
import { fr } from '@codegouvfr/react-dsfr';
import { Button } from '@codegouvfr/react-dsfr/Button';
import { Input } from '@codegouvfr/react-dsfr/Input';
import { PasswordInput } from '@codegouvfr/react-dsfr/blocks/PasswordInput';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { tss } from 'tss-react/dsfr';

type FormCredentials = {
	email: string;
	password: string;
};

type FormErrors = {
	emailEmpty: boolean;
	emailFormat: boolean;
	emailNotFound: boolean;
	userInactive: boolean;
};

const defaultErrors = {
	emailEmpty: false,
	emailFormat: false,
	emailNotFound: false,
	userInactive: false
};

export const LoginForm = () => {
	const router = useRouter();

	const [credentials, setCredentials] = useState<FormCredentials>({
		email: '',
		password: ''
	});
	const [errors, setErrors] = useState<FormErrors>(defaultErrors);
	const [passwordIncorrect, setPasswordIncorrect] = useState<boolean>(false);
	const [showPassword, setShowPassword] = useState<boolean>(false);

	const passwordRef = useRef<HTMLInputElement | null>(null);

	const { classes, cx } = useStyles({ passwordIncorrect });

	const resetErrors = () => {
		setErrors(defaultErrors);
	};

	const hasErrors = (): boolean => {
		return Object.values(errors).some(value => value === true);
	};

	const getEmailErrorMessage = (): string => {
		if (errors.emailEmpty) return 'Saisissez une adresse email.';
		if (errors.emailFormat) return "Format de l'email incorrect.";
		if (errors.emailNotFound)
			return 'Aucun compte connu avec cette adresse e-mail.';
		if (errors.userInactive)
			return "Votre compte n'est pas validé, veuillez cliquer sur le lien reçu par email lors de l'inscription.";
		return '';
	};

	const checkEmail = () => {
		if (!credentials.email) {
			setErrors({ ...errors, emailEmpty: true });
			return;
		}

		if (!isValidEmail(credentials.email)) {
			setErrors({ ...errors, emailFormat: true });
			return;
		}

		fetch(`/api/auth/check-email?email=${credentials.email}`)
			.then(res => {
				switch (res.status) {
					case 404:
						setErrors({ ...errors, emailNotFound: true });
						break;
					case 423:
						setErrors({ ...errors, userInactive: true });
						break;
					case 206:
						router.push({
							pathname: 'login/otp',
							query: { email: credentials.email }
						});
						break;
					case 200:
						setShowPassword(true);
						break;
				}
			})
			.catch(e => {
				console.error('error : ', e);
			});
	};

	const login = (): void => {
		signIn('credentials', { ...credentials, redirect: false }).then(res => {
			if (res?.error) {
				if (res.error === 'CredentialsSignin') setPasswordIncorrect(true);
			} else {
				router.push('/administration/dashboard');
			}
		});
	};

	useEffect(() => {
		if (showPassword) passwordRef?.current?.focus();
	}, [showPassword]);

	return (
		<div>
			<h4>Connexion</h4>
			<h5>Se connecter avec son compte</h5>
			<form
				onSubmit={e => {
					e.preventDefault();
					if (showPassword) login();
					else checkEmail();
				}}
			>
				<Input
					hintText="Format attendu : nom@domaine.fr"
					label="Adresse email"
					nativeInputProps={{
						onChange: e => {
							setCredentials({ ...credentials, email: e.target.value });
							setShowPassword(false);
							resetErrors();
						},
						name: 'email'
					}}
					state={hasErrors() ? 'error' : 'default'}
					stateRelatedMessage={getEmailErrorMessage()}
				/>
				{showPassword && (
					<PasswordInput
						label="Mot de passe"
						className={cx(classes.password)}
						nativeInputProps={{
							ref: passwordRef,
							onChange: e => {
								setCredentials({ ...credentials, password: e.target.value });
								setPasswordIncorrect(false);
							}
						}}
						messages={
							passwordIncorrect
								? [{ message: 'Mot de passe incorrect.', severity: 'error' }]
								: []
						}
						messagesHint=""
					/>
				)}
				<Button type="submit" className={cx(classes.button)}>
					{showPassword ? 'Confirmer' : 'Continuer'}
				</Button>
			</form>
			<hr className={fr.cx('fr-mt-8v', 'fr-mb-2v')} />
			<h5>Vous n&apos;avez pas de compte ?</h5>
			<Link
				className={cx(classes.button, fr.cx('fr-btn', 'fr-btn--secondary'))}
				href="/register"
			>
				Créer un compte
			</Link>
		</div>
	);
};

const useStyles = tss
	.withName(LoginForm.name)
	.withParams<{ passwordIncorrect: boolean }>()
	.create(({ passwordIncorrect }) => ({
		button: {
			width: '100%',
			justifyContent: 'center'
		},
		password: {
			marginBottom: passwordIncorrect ? fr.spacing('5v') : 0
		}
	}));
