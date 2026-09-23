import {
	describePersonalData,
	detectPersonalData
} from '@/src/utils/personal-data';
import { fr } from '@codegouvfr/react-dsfr';
import Alert from '@codegouvfr/react-dsfr/Alert';

type Props = {
	/** Contenu courant du champ. */
	value: string;
};

/**
 * Alerte affichée sous un champ libre dès qu'une donnée personnelle y est
 * repérée, et tant qu'elle y est.
 *
 * Nomme la donnée trouvée (« Numéro de téléphone détecté. ») plutôt que de
 * rester générique : sans ça, l'usager voit son bouton d'envoi grisé sans
 * savoir quoi corriger dans son texte.
 *
 * `role="alert"` pour que le lecteur d'écran annonce l'apparition, comme le
 * fait déjà l'alerte de limite de dépôt sur la page d'avis.
 */
export const PersonalDataAlert = ({ value }: Props) => {
	const matches = detectPersonalData(value);
	if (matches.length === 0) return null;

	return (
		<div role="alert" className={fr.cx('fr-mt-2v')}>
			<Alert
				severity="warning"
				small
				description={describePersonalData(matches)}
			/>
		</div>
	);
};

export default PersonalDataAlert;
