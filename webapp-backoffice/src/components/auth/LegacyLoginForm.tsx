import { getSafeCallbackUrl } from '@/src/utils/tools';
import { fr } from '@codegouvfr/react-dsfr';
import { Button } from '@codegouvfr/react-dsfr/Button';
import { Input } from '@codegouvfr/react-dsfr/Input';
import { PasswordInput } from '@codegouvfr/react-dsfr/blocks/PasswordInput';
import { push } from '@socialgouv/matomo-next';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { tss } from 'tss-react/dsfr';
import { Loader } from '../ui/Loader';

const errorMessages: Record<string, string> = {
	CredentialsSignin: 'Adresse e-mail ou mot de passe incorrect.',
	PROCONNECT_ACCOUNT:
		'Ce compte est déjà associé à ProConnect : utilisez le bouton « S’identifier avec ProConnect ».',
	TOO_MANY_ATTEMPTS:
		'Trop de tentatives de connexion. Réessayez dans quelques minutes ou utilisez ProConnect.',
	LEGACY_LOGIN_DISABLED:
		'La connexion par mot de passe n’est plus disponible : utilisez ProConnect.'
};

export const LegacyLoginForm = () => {
	const router = useRouter();
	const { classes } = useStyles();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const login = async () => {
		setIsLoading(true);
		setError(null);
		const res = await signIn('credentials', {
			email,
			password,
			redirect: false
		});
		setIsLoading(false);
		if (res?.error) {
			setError(errorMessages[res.error] ?? errorMessages.CredentialsSignin);
			return;
		}
		router.push(getSafeCallbackUrl(router.query.callbackUrl));
	};

	return (
		<form
			onSubmit={e => {
				e.preventDefault();
				push(['trackEvent', 'BO - Auth', 'Login-Legacy']);
				login();
			}}
		>
			<Input
				label="Adresse e-mail"
				hintText="Format attendu : nom@domaine.fr"
				nativeInputProps={{
					type: 'email',
					name: 'email',
					autoComplete: 'email',
					required: true,
					value: email,
					onChange: e => setEmail(e.target.value)
				}}
				state={error ? 'error' : 'default'}
			/>
			<PasswordInput
				label="Mot de passe"
				nativeInputProps={{
					name: 'password',
					autoComplete: 'current-password',
					required: true,
					value: password,
					onChange: e => setPassword(e.target.value)
				}}
				messages={
					error
						? [
								{
									message: <span role="alert">{error}</span>,
									severity: 'error'
								}
						  ]
						: []
				}
			/>
			<Button
				type="submit"
				priority="secondary"
				className={classes.button}
				disabled={isLoading}
			>
				{isLoading ? (
					<Loader size="sm" />
				) : (
					'Se connecter avec mon mot de passe'
				)}
			</Button>
		</form>
	);
};

const useStyles = tss.withName({ LegacyLoginForm }).create(() => ({
	button: {
		width: '100%',
		justifyContent: 'center',
		marginTop: fr.spacing('4v')
	}
}));
