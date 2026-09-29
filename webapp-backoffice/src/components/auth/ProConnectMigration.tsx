import { CONTACT_EMAIL } from '@/src/utils/proconnect';
import { formatDateToFrenchString } from '@/src/utils/tools';
import { fr } from '@codegouvfr/react-dsfr';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import Notice from '@codegouvfr/react-dsfr/Notice';
import { ProConnectButton } from '@codegouvfr/react-dsfr/ProConnectButton';
import { push } from '@socialgouv/matomo-next';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const MODAL_SEEN_KEY = 'jdma-proconnect-migration-seen';

const migrationModal = createModal({
	id: 'proconnect-migration-modal',
	isOpenedByDefault: false
});

interface Props {
	legacyLoginUntil: string | null;
}

export const ProConnectMigration = ({ legacyLoginUntil }: Props) => {
	const router = useRouter();
	const deadline = legacyLoginUntil
		? formatDateToFrenchString(legacyLoginUntil)
		: null;

	const linkProConnect = () => {
		push(['trackEvent', 'BO - Auth', 'Link-ProConnect']);
		signIn('openid', { callbackUrl: router.asPath });
	};

	useEffect(() => {
		let seen = false;
		try {
			seen = sessionStorage.getItem(MODAL_SEEN_KEY) === 'true';
		} catch {}
		if (seen) return;
		const timer = setTimeout(() => {
			migrationModal.open();
			try {
				sessionStorage.setItem(MODAL_SEEN_KEY, 'true');
			} catch {}
		}, 500);
		return () => clearTimeout(timer);
	}, []);

	return (
		<>
			<Notice
				severity="warning"
				title={`Associez votre compte ProConnect${
					deadline ? ` avant le ${deadline} inclus` : ''
				}`}
				description={
					<>
						Ensuite, la connexion par mot de passe ne sera plus possible.{' '}
						<button
							type="button"
							className={fr.cx('fr-link')}
							onClick={() => migrationModal.open()}
						>
							Associer mon compte
						</button>
					</>
				}
			/>
			<migrationModal.Component
				title="Associez votre compte ProConnect"
				buttons={[{ children: 'Plus tard', priority: 'secondary' }]}
			>
				<p>
					Pour renforcer la sécurité, la connexion à Je donne mon avis se fera
					bientôt uniquement avec ProConnect et une double authentification.
					{deadline &&
						` La connexion par mot de passe reste possible jusqu'au ${deadline} inclus.`}
				</p>
				<p>
					Associez dès maintenant votre compte ProConnect : vous retrouverez vos
					services et vos droits, même si votre adresse ProConnect est
					différente de celle de votre compte actuel.
				</p>
				<ProConnectButton onClick={linkProConnect} />
				<p className={fr.cx('fr-mt-4v', 'fr-mb-0')}>
					Un problème ? Écrivez-nous à{' '}
					<a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
				</p>
			</migrationModal.Component>
		</>
	);
};
