import { fr } from '@codegouvfr/react-dsfr';
import Badge from '@codegouvfr/react-dsfr/Badge';

export const DemarcheEssentielleBadge = ({ small }: { small?: boolean }) => (
	<Badge severity="info" noIcon small={small}>
		<span
			className={fr.cx(
				'fr-icon-lock-line',
				small ? 'fr-icon--xs' : 'fr-icon--sm',
				'fr-mr-1v'
			)}
			aria-hidden="true"
		/>{' '}
		Démarche essentielle
	</Badge>
);
