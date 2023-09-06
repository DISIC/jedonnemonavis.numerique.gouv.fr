import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react/dsfr';
import { Input } from '@codegouvfr/react-dsfr/Input';
import { Button } from '@codegouvfr/react-dsfr/Button';
import Link from 'next/link';
import { useState } from 'react';
import { isValidEmail } from '@/utils/tools';

type FormCredentials = {
	email: string;
	password: string;
};

type FormErrors = {
	emailFormat: boolean;
	emailNotFound: boolean;
	userInactive: boolean;
};

const defaultErrors = {
	emailFormat: false,
	emailNotFound: false,
	userInactive: false
};

export const LoginForm = () => {
	const [credentials, setCredentials] = useState<FormCredentials>({
		email: '',
		password: ''
	});
	const [errors, setErrors] = useState<FormErrors>(defaultErrors);

	const { classes, cx } = useStyles();

	const resetErrors = () => {
		setErrors(defaultErrors);
	};

	const hasErrors = (): boolean => {
		return Object.values(errors).some(value => value === true);
	};

	const getEmailErrorMessage = (): string => {
		if (errors.emailFormat) return "Format de l'email incorrect.";
		if (errors.emailNotFound)
			return 'Aucun compte connu avec cette adresse e-mail.';
		if (errors.userInactive)
			return "Votre compte n'est pas validé, veuillez cliquer sur le lien reçu par email lors de l'inscription.";
		return '';
	};

	const checkEmail = () => {
		if (!isValidEmail(credentials.email)) {
			setErrors({ ...errors, emailFormat: true });
			return;
		}

		fetch(`/api/auth/check-email?email=${credentials.email}`)
			.then(res => {
				console.log('res : ', res);
				switch (res.status) {
					case 404:
						setErrors({ ...errors, emailNotFound: true });
						break;
					case 423:
						setErrors({ ...errors, userInactive: true });
						break;
					case 206:
						// USER FROM OBSERVATOIRE FIRST LOGIN. GO TO OTP TUNNEL
						break;
					case 200:
						// USER OK. GO TO PASSWORD
						break;
				}
			})
			.catch(e => {
				console.log('e : ', e);
			});
	};

	return (
		<div>
			<h4>Connexion</h4>
			<h5>Se connecter avec son compte</h5>
			<form
				onSubmit={e => {
					e.preventDefault();
				}}
			>
				<Input
					hintText="Format attendu : nom@domaine.fr"
					label="Adresse email"
					nativeInputProps={{
						onChange: e => {
							setCredentials({ ...credentials, email: e.target.value });
							resetErrors();
						}
					}}
					state={hasErrors() ? 'error' : 'default'}
					stateRelatedMessage={getEmailErrorMessage()}
				/>
				<Button
					type="submit"
					className={cx(classes.button)}
					onClick={checkEmail}
				>
					Continuer
				</Button>
			</form>
			<hr className={fr.cx('fr-mt-8v', 'fr-mb-2v')} />
			<h5>Vous n&apos;avez pas de compte ?</h5>
			<Link
				className={cx(classes.button, fr.cx('fr-btn', 'fr-btn--secondary'))}
				href="/signup"
			>
				Créer un compte
			</Link>
		</div>
	);
};

const useStyles = tss
	.withName(LoginForm.name)
	.withParams()
	.create(() => ({
		button: {
			width: '100%',
			justifyContent: 'center'
		}
	}));
