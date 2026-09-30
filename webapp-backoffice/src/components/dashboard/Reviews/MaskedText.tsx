import { PERSONAL_DATA_MASK } from '@/src/utils/personal-data';
import { fr } from '@codegouvfr/react-dsfr';
import Tooltip from '@codegouvfr/react-dsfr/Tooltip';
import React from 'react';
import { tss } from 'tss-react/dsfr';

type Props = {
	/**
	 * Texte **déjà masqué côté serveur** : les données personnelles y ont été
	 * remplacées par `PERSONAL_DATA_MASK`. Ce composant ne détecte rien, il se
	 * contente de mettre en forme ce qui a été retiré — la détection n'a pas sa
	 * place dans le navigateur, où le texte brut n'arrive jamais.
	 */
	text: string;
	/**
	 * Rendu des fragments restés en clair. Permet à la liste des avis de
	 * conserver son surlignage des termes recherchés autour des blocs masqués.
	 */
	renderSegment?: (segment: string, key: number) => React.ReactNode;
};

/**
 * Affiche un verbatim en signalant visuellement ce qui en a été retiré.
 *
 * La maquette montre un aplat gris avec l'infobulle « Information personnelle
 * masquée ». On n'utilise volontairement pas de `filter: blur()` : le texte
 * resterait présent dans le DOM, donc lisible par n'importe qui sachant ouvrir
 * l'inspecteur — ce serait un masquage en trompe-l'œil.
 */
export const MaskedText = ({ text, renderSegment }: Props) => {
	const { classes } = useStyles();

	const render = (segment: string, key: number) =>
		renderSegment ? renderSegment(segment, key) : segment;

	if (!text.includes(PERSONAL_DATA_MASK)) {
		return <>{render(text, 0)}</>;
	}

	const segments = text.split(PERSONAL_DATA_MASK);

	return (
		<>
			{segments.map((segment, index) => (
				<React.Fragment key={index}>
					{segment && render(segment, index)}
					{index < segments.length - 1 && (
						<Tooltip kind="hover" title="Information personnelle masquée">
							<span className={classes.mask}>
								<span aria-hidden="true">•••••</span>
								<span className={fr.cx('fr-sr-only')}>
									Information personnelle masquée
								</span>
							</span>
						</Tooltip>
					)}
				</React.Fragment>
			))}
		</>
	);
};

const useStyles = tss.withName({ MaskedText }).create(() => ({
	mask: {
		display: 'inline-block',
		padding: `0 ${fr.spacing('1v')}`,
		borderRadius: '2px',
		backgroundColor: fr.colors.decisions.background.contrast.grey.default,
		color: fr.colors.decisions.text.mention.grey.default,
		letterSpacing: '0.1em',
		verticalAlign: 'baseline',
		cursor: 'help'
	}
}));

export default MaskedText;
