import { Prisma } from '@prisma/client';

const createBugOptions =
	(): Prisma.FormTemplateBlockOptionCreateWithoutBlockInput[] => [
		{
			label: "J'ai un problème technique avec le site",
			value: "J'ai un problème technique avec le site",
			alias: 'BUG',
			position: 0
		},
		{
			label:
				"J'ai un problème avec ma situation, mes informations ou le résultat de ma démarche",
			value:
				"J'ai un problème avec ma situation, mes informations ou le résultat de ma démarche",
			alias: 'SITUATION',
			position: 1
		},
		{
			label: "J'ai une suggestion d'amélioration pour le site",
			value: "J'ai une suggestion d'amélioration pour le site",
			alias: 'AMÉLIORATION',
			position: 2
		}
	];

export const createBugForm: Prisma.FormTemplateUncheckedCreateInput = {
	title: "Remontées d'informations",
	slug: 'bug',
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
							label: 'Que souhaitez-vous remonter ?',
							type_bloc: 'radio',
							field_code: 'bug_kind',
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
				title: 'Décrivez votre remontée',
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
							isRequired: false
						}
					]
				}
			}
		]
	}
};
