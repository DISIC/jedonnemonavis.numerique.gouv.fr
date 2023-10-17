import { generateOpenApiDocument } from 'trpc-openapi';

import { appRouter } from './routers/root';

// Generate OpenAPI schema document
export const openApiDocument = generateOpenApiDocument(appRouter, {
	title: 'JDMA CRUD API',
	version: '1.0.0',
	baseUrl: 'http://localhost:3000/api/open-api'
});