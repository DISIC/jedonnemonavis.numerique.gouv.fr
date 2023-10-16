import { fr } from '@codegouvfr/react-dsfr';
import Link from 'next/link';

export type RegisterValidationMessage = 'classic' | 'from_otp' | undefined;

type Props = {
	mode: RegisterValidationMessage;
	isUserInvited: boolean;
};

export const RegisterValidationMessage = (props: Props) => {
	const { mode, isUserInvited } = props;

	if (!mode) return;

	return (
		<div>
			<h5>Se créer un compte</h5>
			{mode === 'classic' ? (
				<p>
					Votre compte a été créé avec succès. <br />
					<br />
					{!isUserInvited ? (
						<>
							Vous allez recevoir un email contenant un lien de validation dans
							les prochaines minutes.
						</>
					) : (
						<Link className={fr.cx('fr-link')} href="/login">
							Connectez-vous dès maintenant
						</Link>
					)}
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
};
