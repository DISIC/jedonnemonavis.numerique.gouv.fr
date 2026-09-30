import ApiDocPage from '@/src/components/open-api/ApiDocPage';
import PartnerAuthenticationTab from '@/src/components/open-api/PartnerAuthenticationTab';
import PartnerEndpointsTab from '@/src/components/open-api/PartnerEndpointsTab';
import PartnerExamplesTab from '@/src/components/open-api/PartnerExamplesTab';
import React from 'react';

const sections = [
	{ id: 'authentication', label: 'Authentification' },
	{ id: 'endpoints', label: "Points d'accès" },
	{ id: 'examples', label: 'Exemples' }
];

/**
 * Documentation des points d'accès partenaires. Page publique mais volontairement non
 * référencée : aucun lien depuis `/open-api`, et `noindex`. L'URL est communiquée aux
 * partenaires avec leur clé.
 */
const DocAPIPartners = () => (
	<ApiDocPage
		title="Documentation API partenaires"
		metaTitle="Documentation API partenaires JDMA | Je donne mon avis"
		metaDescription="Documentation des points d'accès partenaires de l'API JDMA - Provisionnement de services"
		specUrl={`${process.env.NEXT_PUBLIC_BO_APP_URL}/api/open-api/partenaires`}
		sections={sections}
		noIndex
		renderSection={({ activeSection, filterDoc }) => (
			<>
				{activeSection === 'authentication' && <PartnerAuthenticationTab />}
				{activeSection === 'endpoints' && (
					<PartnerEndpointsTab filterDoc={filterDoc} />
				)}
				{activeSection === 'examples' && <PartnerExamplesTab />}
			</>
		)}
	/>
);

export default DocAPIPartners;
