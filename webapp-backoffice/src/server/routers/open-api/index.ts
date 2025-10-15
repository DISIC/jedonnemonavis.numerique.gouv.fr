import {
	protectedApiProcedure,
	publicProcedure,
	router
} from '@/src/server/trpc';

import { healthQuery, healthInputSchema, healthOutputSchema } from './health';

import {
	infoServicesQuery,
	infoServicesInputSchema,
	infoServicesOutputSchema
} from './info-services';

import {
	statsUsagersQuery,
	statsUsagersInputSchema,
	statsUsagersOutputSchema
} from './stats-usagers';

import {
	setTop250Mutation,
	setTop250InputSchema,
	setTop250OutputSchema
} from './set-top250';

import {
	triggerSendNotifMailsMutation,
	triggerSendNotifMailsInputSchema,
	triggerSendNotifMailsOutputSchema
} from './trigger-send-notif-mails';

const openAPIRouter = router({
	health: publicProcedure
		.meta({
			openapi: {
				method: 'GET',
				path: '/health',
				protect: true,
				enabled: true,
				summary: "Point d'accès santé JDMA.",
				example: {
					request: {}
				}
			}
		})
		.input(healthInputSchema)
		.output(healthOutputSchema)
		.query(healthQuery),

	infoServices: protectedApiProcedure
		.meta({
			openapi: {
				method: 'GET',
				path: '/services',
				protect: true,
				enabled: true,
				summary: "Point d'accès informations services.",
				example: {
					request: {}
				}
			}
		})
		.input(infoServicesInputSchema)
		.output(infoServicesOutputSchema)
		.query(infoServicesQuery),

	statsUsagers: protectedApiProcedure
		.meta({
			openapi: {
				method: 'POST',
				path: '/stats',
				protect: true,
				enabled: true,
				summary:
					"Ce point d'accès retourne les données de satisfaction pour tous les formulaires des services liés à la clé fournie.",
				example: {
					request: {
						start_date: '2024-01-01',
						end_date: new Date().toISOString().split('T')[0],
						product_ids: [],
						field_codes: ['satisfaction', 'comprehension', 'contact_tried'],
						interval: 'none'
					}
				}
			}
		})
		.input(statsUsagersInputSchema)
		.output(statsUsagersOutputSchema)
		.query(statsUsagersQuery),

	setTop250: protectedApiProcedure
		.meta({
			openapi: {
				method: 'POST',
				path: '/setTop250',
				protect: true,
				enabled: true
			}
		})
		.input(setTop250InputSchema)
		.output(setTop250OutputSchema)
		.mutation(setTop250Mutation),

	triggerSendNotifMails: protectedApiProcedure
		.meta({
			openapi: {
				method: 'POST',
				path: '/triggerMails',
				protect: true,
				enabled: true
			}
		})
		.input(triggerSendNotifMailsInputSchema)
		.output(triggerSendNotifMailsOutputSchema)
		.mutation(triggerSendNotifMailsMutation)
});

export default openAPIRouter;
