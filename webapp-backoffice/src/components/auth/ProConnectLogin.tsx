import { CONTACT_EMAIL } from '@/src/utils/proconnect';
import {
	formatDateToFrenchString,
	getSafeCallbackUrl
} from '@/src/utils/tools';
import { fr } from '@codegouvfr/react-dsfr';
import Alert from '@codegouvfr/react-dsfr/Alert';
import { CallOut } from '@codegouvfr/react-dsfr/CallOut';
import { ProConnectButton } from '@codegouvfr/react-dsfr/ProConnectButton';
import { push } from '@socialgouv/matomo-next';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { LegacyLoginForm } from './LegacyLoginForm';

interface Props {
	legacyLoginUntil: string | null;
}

const errorAlerts: Record<string, { title: string; description: string }> = {
	MFA_REQUIRED: {
		title: 'Double authentification requise',
		description:
			"Vous ne pouvez pas accéder au service sans avoir une double authentification installée. Veuillez installer une application d'authentification et vous connecter à nouveau."
	},
	LINK_CONFLICT: {
		title: 'Association impossible',
		description: `L'adresse de votre compte ProConnect est déjà utilisée par un autre compte Je donne mon avis. Écrivez-nous à ${CONTACT_EMAIL} pour regrouper vos comptes.`
	}
};

export const ProConnectLogin = ({ legacyLoginUntil }: Props) => {
	const router = useRouter();
	const { error, callbackUrl } = router.query;

	return (
		<div>
			{typeof error === 'string' && errorAlerts[error] && (
				<Alert
					severity="error"
					className={fr.cx('fr-mb-8v')}
					title={errorAlerts[error].title}
					description={errorAlerts[error].description}
				/>
			)}
			<ProConnectButton
				onClick={() => {
					push(['trackEvent', 'BO - Auth', 'Login-ProConnect']);
					signIn('openid', { callbackUrl: getSafeCallbackUrl(callbackUrl) });
				}}
			/>
			<CallOut
				className={fr.cx('fr-mt-8v', 'fr-mb-0')}
				iconId="fr-icon-shield-line"
				title="Une connexion plus sécurisée"
				titleAs="h2"
			>
				Pour protéger les données de vos services, la connexion à Je donne mon
				avis se fait désormais avec ProConnect et une double authentification.
				Lors de votre connexion, ProConnect vous accompagne pour l&apos;activer
				si besoin.
				<br />
				<br />
				Un problème pour vous connecter ? Écrivez-nous à{' '}
				<a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
			</CallOut>
			{legacyLoginUntil && (
				<>
					<hr className={fr.cx('fr-mt-8v', 'fr-mb-2v')} />
					<h2 className={fr.cx('fr-h5')}>
						Vous n&apos;avez pas encore associé ProConnect ?
					</h2>
					<p>
						Jusqu&apos;au {formatDateToFrenchString(legacyLoginUntil)}, vous
						pouvez encore vous connecter avec votre mot de passe, puis associer
						votre compte ProConnect.
					</p>
					<LegacyLoginForm />
				</>
			)}
		</div>
	);
};
