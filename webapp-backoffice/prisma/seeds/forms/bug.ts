import { Prisma, PrismaClient } from '@prisma/client';

const createBugOptions =
	(): Prisma.FormTemplateBlockOptionCreateWithoutBlockInput[] => [
		{
			label: "J'ai un problème technique avec le site",
			value: "J'ai un problème technique avec le site",
			hint: 'Exemples : pages qui ne s’affichent pas correctement, lenteurs, quelque chose qui ne fonctionne pas, message d’erreur, ...',
			alias: 'BUG',
			position: 0
		},
		{
			label:
				"J'ai un problème avec ma situation, mes informations ou le résultat de ma démarche",
			value:
				"J'ai un problème avec ma situation, mes informations ou le résultat de ma démarche",
			hint: 'Exemples : données incorrectes, difficulté à accéder à un service, incohérence dans les informations affichées...',
			alias: 'SITUATION',
			isHideable: true,
			position: 1
		},
		{
			label: "J'ai une suggestion d'amélioration pour le site",
			value: "J'ai une suggestion d'amélioration pour le site",
			hint: 'Exemples : nouvelle fonctionnalité, amélioration d’un parcours, clarification d’un contenu...',
			alias: 'AMÉLIORATION',
			position: 2
		}
	];

const bugButtons = [
	{
		label: 'Une remarque ?',
		slug: 'remark',
		order: 0,
		isDefault: true
	},
	{
		label: 'Faire un retour',
		slug: 'feedback',
		order: 1,
		isDefault: false
	},
	{
		label: 'Signaler un problème',
		slug: 'problem',
		order: 2,
		isDefault: false
	}
];

export const createBugForm: Prisma.FormTemplateUncheckedCreateInput = {
	title: "Remontées d'informations",
	slug: 'bug',
	description:
		"Permet à vos usagers de signaler des problèmes techniques, problèmes avec leur situation ou de faire des suggestions d'amélioration.",
	active: true,
	hasStepper: false,
	form_template_steps: {
		create: [
			{
				title: 'Une remarque ?',
				description:
					'Cette étape permet d’identifier le type de remontée que vous souhaitez nous partager.',
				position: 0,
				isHideable: false,
				form_template_blocks: {
					create: [
						{
							label: 'Quel type de retour souhaitez-vous nous faire ?',
							type_bloc: 'radio',
							field_code: 'bug_kind',
							alias: 'Type de retour',
							position: 0,
							isRequired: true,
							isMainBlock: true,
							options: {
								create: createBugOptions()
							}
						}
					]
				}
			},
			{
				title: 'Commentaire',
				description:
					'Cette étape vous permet de détailler votre remarque si vous le souhaitez.',
				position: 1,
				isHideable: false,
				form_template_blocks: {
					create: [
						{
							label: 'Pouvez-vous nous en dire plus ?',
							type_bloc: 'input_text_area',
							field_code: 'verbatim',
							position: 0,
							isRequired: true
						}
					]
				}
			}
		]
	},
	form_template_buttons: {
		create: bugButtons.map(button => ({
			label: button.label,
			slug: button.slug,
			order: button.order,
			isDefault: button.isDefault,
			variants: {
				create: [
					{
						style: 'solid',
						theme: 'light',
						image_url: `https://jedonnemonavis.numerique.gouv.fr/static/buttons/button-${button.slug}-solid-light.svg`,
						alt_text: button.label
					},
					{
						style: 'outline',
						theme: 'light',
						image_url: `https://jedonnemonavis.numerique.gouv.fr/static/buttons/button-${button.slug}-outline-light.svg`,
						alt_text: button.label
					},
					{
						style: 'solid',
						theme: 'dark',
						image_url: `https://jedonnemonavis.numerique.gouv.fr/static/buttons/button-${button.slug}-solid-dark.svg`,
						alt_text: button.label
					},
					{
						style: 'outline',
						theme: 'dark',
						image_url: `https://jedonnemonavis.numerique.gouv.fr/static/buttons/button-${button.slug}-outline-dark.svg`,
						alt_text: button.label
					}
				]
			}
		}))
	},
	integration_types: ['modal', 'link'],
	default_integration_type: 'modal'
};

export async function seed_bug_form_template_buttons(
	prisma: PrismaClient,
	formTemplateId: number
) {
	const bugButtons = [
		{
			label: 'Une remarque ?',
			slug: 'remark',
			order: 0,
			isDefault: true
		},
		{
			label: 'Faire un retour',
			slug: 'feedback',
			order: 1,
			isDefault: false
		},
		{
			label: 'Signaler un problème',
			slug: 'problem',
			order: 2,
			isDefault: false
		}
	];

	for (const bugButton of bugButtons) {
		await prisma.formTemplateButton.upsert({
			where: {
				form_template_id_slug: {
					form_template_id: formTemplateId,
					slug: bugButton.slug
				}
			},
			update: {
				label: bugButton.label,
				order: bugButton.order,
				isDefault: bugButton.isDefault,
				variants: {
					deleteMany: {},
					create: [
						{
							style: 'solid',
							theme: null,
							image_url: '',
							alt_text: bugButton.label
						},
						{
							style: 'outline',
							theme: null,
							image_url: '',
							alt_text: bugButton.label
						}
					]
				}
			},
			create: {
				form_template: {
					connect: {
						id: formTemplateId
					}
				},
				label: bugButton.label,
				slug: bugButton.slug,
				order: bugButton.order,
				isDefault: bugButton.isDefault,
				variants: {
					create: [
						{
							style: 'solid',
							theme: 'light',
							image_url: `https://jedonnemonavis.numerique.gouv.fr/static/buttons/button-${bugButton.slug}-solid-light.svg`,
							alt_text: bugButton.label
						},
						{
							style: 'outline',
							theme: 'light',
							image_url: `https://jedonnemonavis.numerique.gouv.fr/static/buttons/button-${bugButton.slug}-outline-light.svg`,
							alt_text: bugButton.label
						},
						{
							style: 'solid',
							theme: 'dark',
							image_url: `https://jedonnemonavis.numerique.gouv.fr/static/buttons/button-${bugButton.slug}-solid-dark.svg`,
							alt_text: bugButton.label
						},
						{
							style: 'outline',
							theme: 'dark',
							image_url: `https://jedonnemonavis.numerique.gouv.fr/static/buttons/button-${bugButton.slug}-outline-dark.svg`,
							alt_text: bugButton.label
						}
					]
				}
			}
		});
	}
}
