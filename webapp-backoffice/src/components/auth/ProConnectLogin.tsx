import { getSafeCallbackUrl } from '@/src/utils/tools';
import { fr } from '@codegouvfr/react-dsfr';
import Alert from '@codegouvfr/react-dsfr/Alert';
import { CallOut } from '@codegouvfr/react-dsfr/CallOut';
import { ProConnectButton } from '@codegouvfr/react-dsfr/ProConnectButton';
import { push } from '@socialgouv/matomo-next';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';

const CONTACT_EMAIL = 'contact.jdma@design.numerique.gouv.fr';

export const ProConnectLogin = () => {
	const router = useRouter();
	const { error, callbackUrl } = router.query;

	return (
		<div>
			{error === 'MFA_REQUIRED' && (
				<Alert
					severity="error"
					className={fr.cx('fr-mb-8v')}
					title="Double authentification requise"
					description="Vous ne pouvez pas accéder au service sans avoir une double authentification installée. Veuillez installer une application d'authentification et vous connecter à nouveau."
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
				avis se fait uniquement avec ProConnect et une double authentification.
				Lors de votre connexion, ProConnect vous accompagne pour l&apos;activer
				si besoin.
				<br />
				<br />
				Un problème pour vous connecter ? Écrivez-nous à{' '}
				<a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
			</CallOut>
		</div>
	);
};
