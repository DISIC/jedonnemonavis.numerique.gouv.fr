import React from 'react';
import { fr } from '@codegouvfr/react-dsfr';
import CodeBlock from './CodeBlock';

const ExamplesTab = () => {
	return (
		<div>
			<h2>Exemples d'utilisation</h2>
			<p>Découvrez comment utiliser l'API JDMA avec des exemples concrets.</p>

			<h3>Récupérer les informations de vos services</h3>
			<CodeBlock>
				{`curl -X GET "${process.env.NEXT_PUBLIC_BO_APP_URL}/api/open-api/services" \\
  -H "Authorization: Bearer VOTRE_CLE_API" \\
  -H "Content-Type: application/json"`}
			</CodeBlock>

			<h3>Obtenir les statistiques du mois dernier</h3>
			<CodeBlock>
				{`curl -X GET "${process.env.NEXT_PUBLIC_BO_APP_URL}/api/open-api/stats?start_date=2024-01-01&end_date=2024-01-31&interval=day" \\
  -H "Authorization: Bearer VOTRE_CLE_API" \\
  -H "Content-Type: application/json"`}
			</CodeBlock>

			<h3>Filtrer par type de question (satisfaction uniquement)</h3>
			<CodeBlock>
				{`curl -X GET "${process.env.NEXT_PUBLIC_BO_APP_URL}/api/open-api/stats?field_codes=satisfaction" \\
  -H "Authorization: Bearer VOTRE_CLE_API" \\
  -H "Content-Type: application/json"`}
			</CodeBlock>

			<h3>Exemple avec JavaScript/Fetch</h3>
			<CodeBlock>
				{`const apiKey = 'VOTRE_CLE_API';
const baseUrl = '${process.env.NEXT_PUBLIC_BO_APP_URL}/api/open-api';

// Récupérer les services
const services = await fetch(\`\${baseUrl}/services\`, {
  headers: {
    'Authorization': \`Bearer \${apiKey}\`,
    'Content-Type': 'application/json'
  }
}).then(res => res.json());

// Récupérer les stats avec filtres
const stats = await fetch(\`\${baseUrl}/stats?start_date=2024-01-01&interval=month\`, {
  headers: {
    'Authorization': \`Bearer \${apiKey}\`,
    'Content-Type': 'application/json'
  }
}).then(res => res.json());`}
			</CodeBlock>
		</div>
	);
};

export default ExamplesTab;
