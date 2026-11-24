import React from 'react';
import { fr } from '@codegouvfr/react-dsfr';
import CodeBlock from './CodeBlock';

const PartnerExamplesTab = () => {
	const baseUrl = `${process.env.NEXT_PUBLIC_BO_APP_URL}/api/open-api`;

	return (
		<div>
			<h2>Exemples d'utilisation</h2>
			<p>
				Enchaînement type : une démarche est créée côté partenaire, JDMA
				provisionne le service et renvoie le code d'intégration à afficher.
			</p>

			<h3 className={fr.cx('fr-h6', 'fr-mb-2v', 'fr-mt-10v')}>
				Provisionner un service
			</h3>
			<CodeBlock language="bash">
				{`curl -X POST "${baseUrl}/demarches-numeriques/services" \\
  -H "Authorization: Bearer VOTRE_CLE_PARTENAIRE" \\
  -H "Content-Type: application/json" \\
  -d '{
    "external_id": "dn-abc-123",
    "demarche_name": "Demande de subvention culture 2026",
    "organisation_name": "Ministère de la Culture",
    "creator_email": "createur@culture.gouv.fr",
    "admin_emails": ["agent@culture.gouv.fr"],
    "integration_type": "button"
  }'`}
			</CodeBlock>

			<p className={fr.cx('fr-mt-2w')}>
				La réponse porte <code>integration_code</code> (à afficher en fin de
				démarche), <code>integration_url</code>, les identifiants créés et la
				liste des <code>invitations</code>. <code>already_existed</code> vaut{' '}
				<code>true</code> si l'<code>external_id</code> était déjà provisionné :
				l'appel est idempotent, rejouer une création n'a pas d'effet de bord.
			</p>

			<h3 className={fr.cx('fr-h6', 'fr-mb-2v', 'fr-mt-10v')}>
				Ajouter des administrateurs à un service existant
			</h3>
			<CodeBlock language="bash">
				{`curl -X POST "${baseUrl}/demarches-numeriques/services/dn-abc-123/admins" \\
  -H "Authorization: Bearer VOTRE_CLE_PARTENAIRE" \\
  -H "Content-Type: application/json" \\
  -d '{
    "admin_emails": ["nouvel-agent@culture.gouv.fr"]
  }'`}
			</CodeBlock>

			<p className={fr.cx('fr-mt-2w')}>
				Chaque entrée de <code>results</code> indique le sort de l'adresse
				soumise : <code>invited</code>, <code>already_admin</code> ou{' '}
				<code>error</code>.
			</p>

			<h3 className={fr.cx('fr-h6', 'fr-mb-2v', 'fr-mt-10v')}>
				Exemple avec Node.js / Fetch
			</h3>
			<CodeBlock language="javascript">
				{`const apiKey = process.env.JDMA_PARTNER_API_KEY;
const baseUrl = '${baseUrl}';

const service = await fetch(\`\${baseUrl}/demarches-numeriques/services\`, {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${apiKey}\`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    external_id: demarche.id,
    demarche_name: demarche.title,
    organisation_name: demarche.organisation,
    creator_email: demarche.creatorEmail,
    admin_emails: demarche.adminEmails
  })
}).then(res => res.json());

// Code à afficher en fin de démarche
console.log(service.integration_code);`}
			</CodeBlock>
		</div>
	);
};

export default PartnerExamplesTab;
