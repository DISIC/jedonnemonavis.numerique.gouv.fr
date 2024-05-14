import { fr } from '@codegouvfr/react-dsfr';
import Alert from '@codegouvfr/react-dsfr/Alert';
import Link from 'next/link';

export const AlertObservatoire = () => {
	return (
		<Alert
			className={fr.cx('fr-mb-16v')}
			closable
			description={
				<>
					<div style={{ wordWrap: 'break-word', hyphens: 'auto' }}>
						Si vous avez déjà un compte sur
						https://observatoire.numerique.gouv.fr/, vous pouvez maintenant
						gérer tous les avis récoltés sur vos boutons “Je donne mon avis” sur
						ce site.
						<br />
						<br /> <b>Vous n’avez pas besoin de créer un nouveau compte.</b> Il
						suffit de verifier votre ancien compte sur la{' '}
					</div>

					<Link className={fr.cx('fr-link')} href="/login">
						page de connexion.
					</Link>
				</>
			}
			onClose={function noRefCheck() {}}
			severity="info"
			title="Nouvel hébergement"
		/>
	);
};
