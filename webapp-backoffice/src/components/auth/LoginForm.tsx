import { isValidEmail } from '@/src/utils/tools';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import { Button } from '@codegouvfr/react-dsfr/Button';
import { Input } from '@codegouvfr/react-dsfr/Input';
import { PasswordInput } from '@codegouvfr/react-dsfr/blocks/PasswordInput';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { tss } from 'tss-react/dsfr';
import { Loader } from '../ui/Loader';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import { Toast } from '@/src/components/ui/Toast';

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
	const [isSignInLoading, setIsSignInLoading] = useState<boolean>(false);
	const [displayToast, setDisplayToast] = useState<boolean>(false);

	const emailRef = useRef(null);
	const passwordRef = useRef<HTMLInputElement | null>(null);

	const checkEmailUser = trpc.user.checkEmail.useMutation({
		onSuccess: result => {
			switch (result.metadata.statusCode) {
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
		},
		onError: error => {
			switch (error.data?.httpStatus) {
				case 404:
					setErrors({ ...errors, emailNotFound: true });
					break;
				case 409:
					setErrors({ ...errors, userInactive: true });
					break;
			}
		}
	});

	const modal = createModal({
		id: 'reset-modal',
		isOpenedByDefault: false
	});

	const initResetPwd = trpc.user.initResetPwd.useMutation({});

	const isLoading = checkEmailUser.isLoading || isSignInLoading;
	const { classes, cx } = useStyles({
		passwordIncorrect,
		isLoading
	});

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

		checkEmailUser.mutate({
			email: credentials.email
		});
	};

	const login = (): void => {
		setIsSignInLoading(true);
		signIn('credentials', { ...credentials, redirect: false })
			.then(res => {
				if (res?.error) {
					if (res.error === 'CredentialsSignin') setPasswordIncorrect(true);
				} else {
					router.push('/administration/dashboard/products');
				}
			})
			.finally(() => {
				setIsSignInLoading(false);
			});
	};

	useEffect(() => {
		if (showPassword) passwordRef?.current?.focus();
	}, [showPassword]);

	useEffect(() => {
		if (hasErrors() && emailRef && emailRef.current) {
			emailRef.current.focus();
		}
	}, [hasErrors]);

	return (
		<div>
			<Toast
				isOpen={displayToast}
				setIsOpen={setDisplayToast}
				autoHideDuration={4000}
				severity="success"
				message="Email envoyé avec succès"
			/>
			<modal.Component title="Mot de passe oublié">
				<p className={fr.cx('fr-my-10v')}>
					Nous vous enverrons un lien pour réinitialiser votre mot de passe à
					l'adresse email suivante : {credentials.email}
				</p>
				<div className={cx(classes.actionModal)}>
					<Button
						onClick={() => modal.close()}
						priority="secondary"
						type="button"
					>
						Annuler
					</Button>
					<Button
						onClick={() => {
							initResetPwd.mutate({
								email: credentials.email
							});
							setDisplayToast(true);
							modal.close();
						}}
						priority="primary"
						type="button"
					>
						Envoyer
					</Button>
				</div>
			</modal.Component>
			<h1>Connexion</h1>
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
						ref: emailRef,
						onChange: e => {
							setCredentials({ ...credentials, email: e.target.value });
							setShowPassword(false);
							resetErrors();
						},
						name: 'email',
						autoComplete: 'email'
					}}
					state={hasErrors() ? 'error' : 'default'}
					stateRelatedMessage={
						hasErrors() ? (
							<span role="alert">{getEmailErrorMessage()}</span>
						) : null
					}
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
							},
							autoComplete: 'current-password'
						}}
						messages={
							passwordIncorrect
								? [
										{
											message: (
												<span role="alert">Mot de passe incorrect.</span>
											),
											severity: 'error'
										}
									]
								: []
						}
						messagesHint=""
					/>
				)}
				{showPassword && (
					<div className={fr.cx('fr-mb-4v')}>
						<Button
							onClick={() => {
								modal.open();
							}}
							priority="tertiary no outline"
							type="button"
						>
							Mot de passe oublié
						</Button>
					</div>
				)}
				<Button type="submit" className={cx(classes.button)}>
					{isLoading ? (
						<Loader size="sm" white />
					) : showPassword ? (
						'Confirmer'
					) : (
						'Continuer'
					)}
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
	.withParams<{ passwordIncorrect: boolean; isLoading: boolean }>()
	.create(({ passwordIncorrect, isLoading }) => ({
		button: {
			width: '100%',
			justifyContent: 'center',
			cursor: isLoading ? 'not-allowed' : 'pointer',
			pointerEvents: isLoading ? 'none' : 'auto'
		},
		password: {
			marginBottom: passwordIncorrect ? fr.spacing('5v') : 0
		},
		actionModal: {
			display: 'flex',
			justifyContent: 'space-between'
		}
	}));
