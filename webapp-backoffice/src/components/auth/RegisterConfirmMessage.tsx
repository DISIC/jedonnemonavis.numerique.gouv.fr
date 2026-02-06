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
	const [canResendEmail, setCanResendEmail] = useState(true);
	const [cooldown, setCooldown] = useState<number | null>(null);

	const resendValidationEmail = trpc.user.resendValidationEmail.useMutation({
		onSuccess: () => {
			setHasTheEmailBeenResent(true);
			setCanResendEmail(false);
			setCooldown(300);
		},
		onError: () => {
			setHasTheEmailBeenResent(false);
			setCanResendEmail(true);
			setCooldown(null);
		}
	});

	useEffect(() => {
		if (cooldown === null) return setCanResendEmail(true);

		const interval = setInterval(() => {
			setCooldown(prev => (prev && prev > 0 ? prev - 1 : null));
		}, 1000);

		return () => clearInterval(interval);
	}, [cooldown]);

	if (!mode || !email) return;

	const formatCooldown = () =>
		cooldown !== null
			? `dans ${Math.floor(cooldown / 60)}:${String(cooldown % 60).padStart(
					2,
					'0'
			  )}`
			: '';

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
							<p role="status" tabIndex={-1} className={fr.cx('fr-mb-3v')}>
								{!canResendEmail
									? 'Email renvoyé !'
									: "Vous n'avez pas reçu d'email ?"}
							</p>
							<Button
								size="small"
								priority="tertiary"
								onClick={() => resendValidationEmail.mutate({ email })}
								disabled={resendValidationEmail.isLoading || !canResendEmail}
							>
								{resendValidationEmail.isLoading
									? 'Envoi en cours...'
									: "Renvoyer l'email de validation"}
							</Button>
							{hasTheEmailBeenResent &&
								(cooldown !== null || canResendEmail) && (
									<p
										className={fr.cx(
											canResendEmail ? 'fr-message--valid' : 'fr-message--info',
											'fr-text--xs',
											'fr-mt-3v',
											'fr-mb-0'
										)}
									>
										Vous {cooldown !== null ? 'pourrez' : 'pouvez'} renvoyer le
										mail {formatCooldown()}
									</p>
								)}
							{hasTheEmailBeenResent && (
								<p className={fr.cx('fr-text--xs', 'fr-mt-6v')}>
									Vous n’avez toujours pas reçu le mail ? Pensez à vérifier dans
									vos courriels indésirables. <br />
									En cas de problème persistant, contactez-nous à
									l’adresse&nbsp;:&nbsp;
									<a
										href="mailto:contact.jdma@design.numerique.gouv.fr"
										className={fr.cx('fr-link', 'fr-text--xs')}
									>
										contact.jdma@design.numerique.gouv.fr
									</a>
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
