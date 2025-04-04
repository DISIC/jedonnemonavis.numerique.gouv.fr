import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import {
	PasswordInput,
	PasswordInputProps
} from '@codegouvfr/react-dsfr/blocks/PasswordInput';
import { Button } from '@codegouvfr/react-dsfr/Button';
import { push } from '@socialgouv/matomo-next';
import { useRouter } from 'next/router';
import { ReactNode, useState } from 'react';
import { tss } from 'tss-react/dsfr';

type Props = {
	email: string;
};

type FormErrors = {
	otpInvalid: boolean;
	otpExpired: boolean;
};

const defaultErrors = {
	otpInvalid: false,
	otpExpired: false
};

export const OTPForm = (props: Props) => {
	const { email } = props;

	const router = useRouter();

	const [otp, setOtp] = useState<string>('');
	const [errors, setErrors] = useState<FormErrors>(defaultErrors);
	const [resend, setResend] = useState<boolean>(false);

	const { classes, cx } = useStyles({ errors });

	const resetErrors = () => {
		setErrors(defaultErrors);
	};

	const checkOTP = trpc.user.getOtp.useMutation({
		onSuccess: () => {
			router.push({
				pathname: '/register',
				query: { otp }
			});
		},
		onError: error => {
			switch (error.data?.httpStatus) {
				case 404:
					setErrors({ ...errors, otpInvalid: true });
					break;
				case 400:
					setErrors({ ...errors, otpExpired: true });
					break;
			}
		}
	});

	const checkMail = trpc.user.checkEmail.useMutation({
		onSuccess: () => {}
	});

	const getPasswordInputMessages = (): {
		severity: PasswordInputProps.Severity;
		message: ReactNode;
	}[] => {
		if (errors.otpInvalid)
			return [
				{
					message: 'Mot de passe temporaire incorrect.',
					severity: 'error'
				}
			];

		if (errors.otpExpired)
			return [
				{
					message: 'Mot de passe temporaire expiré.',
					severity: 'error'
				}
			];

		return [];
	};

	return (
		<div>
			<form
				onSubmit={e => {
					e.preventDefault();
					push(['trackEvent', 'BO - Auth', 'OTP-Validate']);
					checkOTP.mutate({
						email,
						otp
					});
				}}
			>
				<PasswordInput
					className={cx(classes.password)}
					label="Mot de passe temporaire"
					nativeInputProps={{
						onChange: e => {
							setOtp(e.target.value);
							resetErrors();
						},
						autoComplete: 'off'
					}}
					messagesHint=""
					messages={getPasswordInputMessages()}
				/>
				<p className={fr.cx('fr-hint-text', 'fr-text--sm')}>
					Si vous ne recevez pas de courriel sous 15 minutes (n’hésitez pas à
					vérifier dans les indésirables),
					<br />
					<Button
						onClick={async () => {
							checkMail.mutate({ email: (router.query.email || '') as string });
							push(['trackEvent', 'BO - Auth', 'OTP-Resend-Mail']);
							setResend(true);
						}}
						priority="tertiary no outline"
						type="button"
						className={fr.cx('fr-p-0')}
						disabled={resend}
					>
						vous pouvez le renvoyer en cliquant ici
					</Button>
					.
				</p>
				<Button className={cx(classes.button)} type="submit">
					Valider
				</Button>
			</form>
		</div>
	);
};

const useStyles = tss
	.withName(OTPForm.name)
	.withParams<{ errors: FormErrors }>()
	.create(({ errors }) => ({
		button: {
			display: 'block',
			marginLeft: 'auto'
		},
		password: {
			marginBottom:
				errors.otpExpired || errors.otpInvalid ? fr.spacing('5v') : 0
		}
	}));
