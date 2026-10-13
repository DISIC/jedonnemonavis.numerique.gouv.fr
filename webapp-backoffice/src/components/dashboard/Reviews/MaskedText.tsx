import { splitMaskedText } from '@/src/utils/personal-data';
import Tooltip from '@codegouvfr/react-dsfr/Tooltip';
import React from 'react';
import { tss } from 'tss-react/dsfr';

type Props = {
	/**
	 * Texte **déjà masqué côté serveur** : les données personnelles y ont été
	 * remplacées par le libellé de leur catégorie. Ce composant ne détecte
	 * rien, il se contente de mettre en forme ce qui a été retiré — la
	 * détection n'a pas sa place dans le navigateur, où le texte brut n'arrive
	 * jamais.
	 */
	text: string;
	/**
	 * Rendu des fragments restés en clair. Permet à la liste des avis de
	 * conserver son surlignage des termes recherchés autour des libellés.
	 */
	renderSegment?: (segment: string, key: number) => React.ReactNode;
};

/**
 * Affiche un verbatim en signalant ce qui en a été retiré.
 *
 * Le libellé reste dans le fil du texte, en italique entre parenthèses —
 * « Voici mon numéro : (Numéro de téléphone masqué), merci de me rappeler. »
 * L'agent lit la phrase d'un bout à l'autre et sait ce qui manque.
 *
 * Pas de `filter: blur()` : le texte resterait présent dans le DOM, donc
 * lisible par quiconque ouvre l'inspecteur — ce serait un masquage en
 * trompe-l'œil.
 */
export const MaskedText = ({ text, renderSegment }: Props) => {
	const { classes } = useStyles();

	const segments = splitMaskedText(text);

	return (
		<>
			{segments.map((segment, index) =>
				segment.masked ? (
					<Tooltip
						key={index}
						kind="hover"
						title="Les informations personnelles sont supprimées pour le respect de la vie privée"
					>
						<em className={classes.mask}>{segment.text}</em>
					</Tooltip>
				) : renderSegment ? (
					renderSegment(segment.text, index)
				) : (
					<React.Fragment key={index}>{segment.text}</React.Fragment>
				)
			)}
		</>
	);
};

const useStyles = tss.withName({ MaskedText }).create(() => ({
	mask: {
		fontStyle: 'italic',
		cursor: 'help'
	}
}));

export default MaskedText;
