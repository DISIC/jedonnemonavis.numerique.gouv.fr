import ApiDocPage from '@/src/components/open-api/ApiDocPage';
import AuthenticationTab from '@/src/components/open-api/AuthenticationTab';
import EndpointsTab from '@/src/components/open-api/EndpointsTab';
import ExamplesTab from '@/src/components/open-api/ExamplesTab';
import React from 'react';

const sections = [
	{ id: 'authentication', label: 'Authentification' },
	{ id: 'endpoints', label: "Points d'accès" },
	{ id: 'examples', label: 'Exemples' }
];

const DocAPIv2 = () => (
	<ApiDocPage
		title="Documentation API"
		metaTitle="Documentation API JDMA | Je donne mon avis"
		metaDescription="Documentation complète de l'API JDMA - Accédez aux données de satisfaction des usagers"
		specUrl={`${process.env.NEXT_PUBLIC_BO_APP_URL}/api/open-api`}
		sections={sections}
		renderSection={({ activeSection, filterDoc, hasPath }) => (
			<>
				{activeSection === 'authentication' && <AuthenticationTab />}
				{activeSection === 'endpoints' && (
					<EndpointsTab filterDoc={filterDoc} hasPath={hasPath} />
				)}
				{activeSection === 'examples' && <ExamplesTab hasPath={hasPath} />}
			</>
		)}
	/>
);

export default DocAPIv2;
