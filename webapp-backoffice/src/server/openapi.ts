import { generateOpenApiDocument } from 'trpc-openapi';

import { appRouter } from './routers/root';

/**
 * Préfixe des points d'accès réservés aux partenaires (clé API `is_partner`, voir
 * `routers/open-api/helpers.ts`). Ils sont documentés à part, sur `/open-api/partenaires`,
 * parce qu'ils ne sont d'aucune utilité aux porteurs de services : ils ne peuvent ni
 * générer la clé qui les ouvre, ni les appeler.
 */
const PARTNER_PATH_PREFIX = '/demarches-numeriques';

const isPartnerPath = (path: string) => path.startsWith(PARTNER_PATH_PREFIX);

type OpenApiDocument = ReturnType<typeof generateOpenApiDocument>;

const keepPaths = (
	document: OpenApiDocument,
	keep: (path: string) => boolean
): OpenApiDocument => ({
	...document,
	paths: Object.fromEntries(
		Object.entries(document.paths ?? {}).filter(([path]) => keep(path))
	)
});

/**
 * Document complet, tous publics confondus. Sert de source aux deux documents publiés et
 * à la résolution des routes journalisées (`open-api-log/routes.ts`), qui doit continuer
 * à reconnaître les appels partenaires.
 */
export const openApiDocument = generateOpenApiDocument(appRouter, {
	title: 'JDMA API',
	description: '',
	version: '1.0',
	baseUrl: `${process.env.NEXT_PUBLIC_BO_APP_URL}/api/open-api`
});

/** Document servi sur `/api/open-api` : tout sauf les points d'accès partenaires. */
export const publicOpenApiDocument = keepPaths(
	openApiDocument,
	path => !isPartnerPath(path)
);

/** Document servi sur `/api/open-api/partenaires` : uniquement les points d'accès partenaires. */
export const partnerOpenApiDocument = {
	...keepPaths(openApiDocument, isPartnerPath),
	info: {
		...openApiDocument.info,
		title: 'JDMA API partenaires'
	}
};
