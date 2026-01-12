import { PasswordMessages } from '@/src/types/custom';
import {
	getMissingPasswordRequirements,
	regexAtLeastOneNumber,
	regexAtLeastOneSpecialCharacter
} from '@/src/utils/tools';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Alert from '@codegouvfr/react-dsfr/Alert';
import { Button } from '@codegouvfr/react-dsfr/Button';
import { PasswordInput } from '@codegouvfr/react-dsfr/blocks/PasswordInput';
import { push } from '@socialgouv/matomo-next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { tss } from 'tss-react/dsfr';
import { Loader } from '../ui/Loader';

type FormErrors = {
	password: { required: boolean; format: boolean };
};

export const ResetForm = () => {
	const router = useRouter();
	const passwordRef = useRef<HTMLInputElement>(null);
	const passwordConfirmRef = useRef<HTMLInputElement>(null);
	const defaultErrors = {
		password: {
			required: false,
			format: false
		}
	};
	const [errors, setErrors] = useState<FormErrors>({ ...defaultErrors });
	const [successChange, setSuccessChange] = useState<'Ok' | 'Error' | null>(
		null
	);
	const { classes, cx } = useStyles({
		errors,
		successChange
	});

	const resetErrors = (key: keyof FormErrors) => {
		setErrors({ ...errors, [key]: defaultErrors[key] });
	};

	const [userInfos, setUserInfos] = useState({
		password: ''
	});
	const [userInfosVerif, setUserInfosVerif] = useState({
		password: ''
	});

	const getPasswordMessages = (): PasswordMessages => {
		const messages: PasswordMessages = [];

		if (errors.password.required) {
			messages.push({
				message: <span role="alert">Veuillez renseigner un mot de passe.</span>,
				severity: 'error'
			});
			return messages;
		}

		// When format error is triggered (after form submission), announce exactly what's missing
		if (errors.password.format && userInfos.password) {
			const missing = getMissingPasswordRequirements(userInfos.password);
			if (missing.length > 0) {
				messages.push({
					message: (
						<span role="alert">
							Le mot de passe doit contenir au moins : {missing.join(', ')}.
						</span>
					),
					severity: 'error'
				});
				return messages;
			}
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

	const {
		data: testLink,
		isLoading: loadingCheck,
		isError: loadingError
	} = trpc.user.checkToken.useQuery({
		token: router.query.token as string
	});

	useEffect(() => {
		if (loadingError && !loadingCheck) {
			setSuccessChange('Error');
		}
	}, [loadingError]);

	const resetPassword = trpc.user.changePAssword.useMutation({
		onSuccess: () => {
			setSuccessChange('Ok');
		},
		onError: () => {
			setSuccessChange('Error');
		}
	});

	const sendNewPassword = () => {
		const nextErrors: FormErrors = {
			password: {
				required: false,
				format: false
			}
		};

		if (!userInfos.password) {
			nextErrors.password.required = true;
		} else {
			nextErrors.password.format =
				userInfos.password.length < 12 ||
				!regexAtLeastOneSpecialCharacter.test(userInfos.password) ||
				!regexAtLeastOneNumber.test(userInfos.password);
		}

		if (nextErrors.password.required || nextErrors.password.format) {
			setErrors(nextErrors);
			passwordRef.current?.focus();
			return;
		}

		if (userInfos.password !== userInfosVerif.password) {
			passwordConfirmRef.current?.focus();
			return;
		}

		resetPassword.mutate({
			token: router.query.token as string,
			password: userInfos.password
		});
	};

	return (
		<div>
			{loadingCheck && (
				<div className={cx(classes.checkLinkContainer)} role="status">
					<Loader size="md" />
					<span>Vérification du lien en cours...</span>
				</div>
			)}
			{!successChange && !loadingCheck && (
				<>
					<form
						onSubmit={e => {
							e.preventDefault();
							push(['trackEvent', 'BO - Auth', 'Reset-Password-Validate']);
							sendNewPassword();
						}}
					>
						<PasswordInput
							label="Mot de passe"
							className={cx(classes.password)}
							nativeInputProps={{
								onChange: e => {
									setUserInfos({ ...userInfos, password: e.target.value });
									resetErrors('password');
								},
								value: userInfos.password,
								ref: passwordRef,
								autoComplete: 'new-password'
							}}
							messages={getPasswordMessages()}
							messagesHint={
								getPasswordMessages().length === 1 ||
								getPasswordMessages().filter(m => m.severity === 'valid')
									.length === 3
									? ''
									: undefined
							}
						/>

						<PasswordInput
							label="Confirmez votre mot de passe"
							className={cx(classes.password, fr.cx('fr-mt-10v'))}
							nativeInputProps={{
								onChange: e => {
									setUserInfosVerif({
										...userInfosVerif,
										password: e.target.value
									});
									resetErrors('password');
								},
								value: userInfosVerif.password,
								ref: passwordConfirmRef,
								autoComplete: 'new-password'
							}}
							messages={
								userInfos.password !== userInfosVerif.password
									? [
											{
												message: 'Les mots de passe ne correspondent pas.',
												severity: 'error'
											}
										]
									: []
							}
							messagesHint={''}
						/>
						<Button
							type="submit"
							className={cx(classes.button, fr.cx('fr-mt-10v'))}
							disabled={
								!userInfos.password ||
								!userInfosVerif.password ||
								userInfos.password !== userInfosVerif.password
							}
						>
							Confirmer
						</Button>
					</form>
				</>
			)}
			{successChange && !loadingCheck && (
				<>
					<div role="alert">
						{successChange === 'Ok' ? (
							<Alert
								description="Vous pouvez désormais vous connecter avec votre nouveau mot de passe."
								severity="success"
								title="Mot de passe réinitilialisé"
							/>
						) : (
							<Alert
								description="Ce lien ne semble plus être valide. Vous pouvez relancer la procédure depuis l'écran de connexion."
								severity="error"
								title="Lien invalide"
							/>
						)}
					</div>
					<Link href="/login" className={fr.cx('fr-my-5w', 'fr-btn')}>
						Retourner à l'écran de connexion
					</Link>
				</>
			)}
		</div>
	);
};

const useStyles = tss
	.withName(ResetForm.name)
	.withParams<{ errors: FormErrors; successChange: string | null }>()
	.create(({ errors, successChange }) => ({
		button: {
			width: '100%',
			justifyContent: 'center',
			cursor: 'pointer',
			pointerEvents: 'auto'
		},
		password: {
			marginBottom:
				errors.password.format || errors.password.required
					? fr.spacing('5v')
					: 0
		},
		result: {
			color:
				successChange === 'Ok'
					? fr.colors.decisions.text.default.success.default
					: fr.colors.decisions.text.default.error.default
		},
		checkLinkContainer: {
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center'
		}
	}));
