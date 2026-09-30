import { generateOpenApiDocument } from 'trpc-openapi';

import { openApiRouter } from './routers/open-api-root';

// Generate OpenAPI schema document
export const openApiDocument = generateOpenApiDocument(openApiRouter, {
	title: 'JDMA API',
	description: '',
	version: '1.0',
	baseUrl: `${process.env.NEXT_PUBLIC_BO_APP_URL}/api/open-api`
});
