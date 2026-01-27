import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export type RegisterValidationMessage = 'classic' | 'from_otp' | undefined;

type Props = {
	mode: RegisterValidationMessage;
	isUserInvited: boolean;
	email?: string;
};

export const RegisterValidationMessage = (props: Props) => {
	const { mode, isUserInvited, email } = props;
	const [hasTheEmailBeenResent, setHasTheEmailBeenResent] = useState(false);
	const [cooldown, setCooldown] = useState<number | null>(null);

	const resendValidationEmail = trpc.user.resendValidationEmail.useMutation({
		onSuccess: () => {
			setHasTheEmailBeenResent(true);
			setCooldown(600); // 10 minutes in seconds
		}
	});

	useEffect(() => {
		if (cooldown === null) return;

		const interval = setInterval(() => {
			setCooldown(prev => (prev && prev > 0 ? prev - 1 : null));
		}, 1000);

		return () => clearInterval(interval);
	}, [cooldown]);

	if (!mode || !email) return;

	return (
		<div>
			<h2>Valider votre compte</h2>
			{mode === 'classic' ? (
				<>
					<p role="status" tabIndex={-1}>
						Votre compte a été créé avec succès.
					</p>
					{!isUserInvited ? (
						<>
							<p role="status" tabIndex={-1}>
								Vous allez recevoir un email contenant un lien de validation
								dans les prochaines minutes.
							</p>
							<hr className={fr.cx('fr-mt-6v')} />
							<p role="status" tabIndex={-1} className={fr.cx('fr-mb-2v')}>
								{hasTheEmailBeenResent
									? 'Email renvoyé !'
									: "Vous n'avez pas reçu d'email ?"}
							</p>
							<Button
								size="small"
								priority="tertiary"
								onClick={() => resendValidationEmail.mutate({ email })}
								disabled={
									hasTheEmailBeenResent || resendValidationEmail.isLoading
								}
							>
								{resendValidationEmail.isLoading
									? 'Envoi en cours...'
									: "Renvoyer l'email de validation"}
							</Button>
							{cooldown !== null && (
								<p
									className={fr.cx(
										'fr-message--info',
										'fr-text--xs',
										'fr-mt-3v'
									)}
								>
									Vous pouvez renvoyer le mail dans {Math.floor(cooldown / 60)}:
									{cooldown % 60}
								</p>
							)}
						</>
					) : (
						<Link className={fr.cx('fr-link')} href="/login">
							Connectez-vous dès maintenant
						</Link>
					)}
				</>
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
};
