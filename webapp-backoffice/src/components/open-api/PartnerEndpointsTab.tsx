import React from 'react';
import { fr } from '@codegouvfr/react-dsfr';
import dynamic from 'next/dynamic';
import { SwaggerUIProps } from 'swagger-ui-react';

const SwaggerUI = dynamic<SwaggerUIProps>(import('swagger-ui-react') as any, {
	ssr: false
});
import 'swagger-ui-react/swagger-ui.css';

interface PartnerEndpointsTabProps {
	filterDoc: (fieldToKeep: string) => any;
}

const PartnerEndpointsTab = ({ filterDoc }: PartnerEndpointsTabProps) => {
	return (
		<div>
			<h2>Points d'accès partenaires</h2>
			<p>
				Deux points d'accès permettent de provisionner automatiquement un
				service JDMA depuis une plateforme partenaire, puis d'en gérer les
				administrateurs. Ils exigent une clé API partenaire.
			</p>

			<div className={fr.cx('fr-mt-6w')}>
				<div className={fr.cx('fr-mb-2w')}>
					<strong>/demarches-numeriques/services</strong>
					<span className={fr.cx('fr-ml-2v', 'fr-text--sm')}>
						Provisionner un service depuis Démarches Numériques
					</span>
				</div>

				<p>
					Crée en un appel le service, le formulaire (observatoire), le lien
					d'intégration et les droits admin, puis renvoie le code d'intégration
					et les liens d'inscription. Un même <code>external_id</code> ne crée
					pas de doublon : un nouvel appel renvoie le service déjà créé.
				</p>

				<SwaggerUI spec={filterDoc('/demarches-numeriques/services')} />
			</div>

			<div className={fr.cx('fr-mt-8w')}>
				<div className={fr.cx('fr-mb-2w')}>
					<strong>
						/demarches-numeriques/services/{'{external_id}'}/admins
					</strong>
					<span className={fr.cx('fr-ml-2v', 'fr-text--sm')}>
						Ajouter des admins à un service DN existant
					</span>
				</div>

				<p>
					Ajoute des administrateurs (carrier_admin) à un service déjà
					provisionné, identifié par son <code>external_id</code>.
				</p>

				<SwaggerUI
					spec={filterDoc(
						'/demarches-numeriques/services/{external_id}/admins'
					)}
				/>
			</div>
		</div>
	);
};

export default PartnerEndpointsTab;
