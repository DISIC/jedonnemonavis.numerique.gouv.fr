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

import {
	provisionServiceMutation,
	provisionServiceInputSchema,
	provisionServiceOutputSchema
} from './demarches-numeriques/provision-service';

import {
	addAdminMutation,
	addAdminInputSchema,
	addAdminOutputSchema
} from './demarches-numeriques/add-admin';

import {
	reviewsListQuery,
	reviewsListInputSchema,
	reviewsListOutputSchema
} from './reviews-list';

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
				path: '/statistiques',
				protect: true,
				enabled: true,
				summary:
					"Ce point d'accès retourne les données de satisfaction pour tous les formulaires des services numériques liés à la clé fournie.",
				example: {
					request: {
						start_date: '2024-01-01',
						end_date: new Date().toISOString().split('T')[0],
						product_ids: [],
						form_ids: [],
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
		.mutation(triggerSendNotifMailsMutation),

	provisionDemarcheNumerique: protectedApiProcedure
		.meta({
			openapi: {
				method: 'POST',
				path: '/demarches-numeriques/services',
				protect: true,
				enabled: true,
				summary:
					'Provisionne un service JDMA (service + formulaire observatoire + lien) depuis une démarche Démarches Numériques. Un même external_id ne crée pas de doublon : un nouvel appel renvoie le service déjà créé.',
				example: {
					request: {
						external_id: 'dn-abc-123',
						demarche_name: 'Demande de subvention culture 2026',
						organisation_name: 'Ministère de la Culture',
						creator_email: 'createur@culture.gouv.fr',
						admin_emails: ['agent@culture.gouv.fr'],
						integration_type: 'button'
					}
				}
			}
		})
		.input(provisionServiceInputSchema)
		.output(provisionServiceOutputSchema)
		.mutation(provisionServiceMutation),

	addDemarcheNumeriqueAdmins: protectedApiProcedure
		.meta({
			openapi: {
				method: 'POST',
				path: '/demarches-numeriques/services/{external_id}/admins',
				protect: true,
				enabled: true,
				summary:
					'Ajoute des admins (carrier_admin) à un service DN existant, identifié par son external_id.',
				example: {
					request: {
						external_id: 'dn-abc-123',
						admin_emails: ['nouvel-agent@culture.gouv.fr']
					}
				}
			}
		})
		.input(addAdminInputSchema)
		.output(addAdminOutputSchema)
		.mutation(addAdminMutation),

	reviewsList: protectedApiProcedure
		.meta({
			openapi: {
				method: 'GET',
				path: '/avis',
				protect: true,
				enabled: true,
				summary:
					"Liste paginée des avis bruts pour un formulaire donné (avis classiques et remontées d'information).",
				example: {
					request: {
						form_id: 1,
						limit: 50
					}
				}
			}
		})
		.input(reviewsListInputSchema)
		.output(reviewsListOutputSchema)
		.query(reviewsListQuery)
});

export default openAPIRouter;
