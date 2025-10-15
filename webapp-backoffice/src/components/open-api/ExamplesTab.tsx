import React from 'react';
import { fr } from '@codegouvfr/react-dsfr';
import CodeBlock from './CodeBlock';

const ExamplesTab = () => {
	const now = new Date();
	const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
	const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

	const startDate = lastMonth.toISOString().split('T')[0];
	const endDate = lastMonthEnd.toISOString().split('T')[0];

	return (
		<div>
			<h2>Exemples d'utilisation</h2>
			<p>Découvrez comment utiliser l'API JDMA avec des exemples concrets.</p>

			<h3 className={fr.cx('fr-h6', 'fr-mb-2v', 'fr-mt-10v')}>
				Récupérer les informations de vos services
			</h3>
			<CodeBlock language="bash">
				{`curl -X GET "${process.env.NEXT_PUBLIC_BO_APP_URL}/api/open-api/services" \\
  -H "Authorization: Bearer VOTRE_CLE_API" \\
  -H "Content-Type: application/json"`}
			</CodeBlock>

			<h3 className={fr.cx('fr-h6', 'fr-mb-2v', 'fr-mt-10v')}>
				Obtenir les statistiques du mois dernier
			</h3>
			<CodeBlock language="bash">
				{`curl -X GET "${process.env.NEXT_PUBLIC_BO_APP_URL}/api/open-api/statistiques?start_date=${startDate}&end_date=${endDate}&interval=day" \\
  -H "Authorization: Bearer VOTRE_CLE_API" \\
  -H "Content-Type: application/json"`}
			</CodeBlock>

			<h3 className={fr.cx('fr-h6', 'fr-mb-2v', 'fr-mt-10v')}>
				Filtrer par type de question (satisfaction uniquement)
			</h3>
			<CodeBlock language="bash">
				{`curl -X GET "${process.env.NEXT_PUBLIC_BO_APP_URL}/api/open-api/statistiques?field_codes=satisfaction" \\
  -H "Authorization: Bearer VOTRE_CLE_API" \\
  -H "Content-Type: application/json"`}
			</CodeBlock>

			<h3 className={fr.cx('fr-h6', 'fr-mb-2v', 'fr-mt-10v')}>
				Exemple avec JavaScript/Fetch
			</h3>
			<CodeBlock language="javascript">
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
const stats = await fetch(\`\${baseUrl}/statistiques?start_date=${startDate}&interval=month\`, {
  headers: {
    'Authorization': \`Bearer \${apiKey}\`,
    'Content-Type': 'application/json'
  }
}).then(res => res.json());`}
			</CodeBlock>

			<h3 className={fr.cx('fr-h6', 'fr-mb-2v', 'fr-mt-10v')}>
				Exemple avec Python/Requests
			</h3>
			<CodeBlock language="python">
				{`import requests
from datetime import datetime, timedelta

# Configuration
api_key = 'VOTRE_CLE_API'
base_url = '${process.env.NEXT_PUBLIC_BO_APP_URL}/api/open-api'
headers = {
    'Authorization': f'Bearer {api_key}',
    'Content-Type': 'application/json'
}

# Récupérer les services
services_response = requests.get(f'{base_url}/services', headers=headers)
services = services_response.json()

# Calculer les dates du mois dernier
today = datetime.now()
last_month_start = datetime(today.year, today.month - 1, 1)
last_month_end = datetime(today.year, today.month, 1) - timedelta(days=1)


# Récupérer les statistiques
try:
    stats_response = requests.get(
        f'{base_url}/statistiques',
        headers=headers,
        params={
            'start_date': last_month_start.strftime('%Y-%m-%d'),
            'end_date': last_month_end.strftime('%Y-%m-%d'),
            'interval': 'day'
        }
    )
    stats_response.raise_for_status()
    stats = stats_response.json()
    print(f"Données récupérées pour {len(stats)} jours")
except requests.exceptions.RequestException as e:
    print(f"Erreur lors de la récupération des stats: {e}")`}
			</CodeBlock>
		</div>
	);
};

export default ExamplesTab;
