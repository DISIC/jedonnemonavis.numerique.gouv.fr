import { Prisma } from '@prisma/client';

const createBugOptions =
	(): Prisma.FormTemplateBlockOptionCreateWithoutBlockInput[] => [
		{
			label: "J'ai un problème technique avec le site",
			value: "J'ai un problème technique avec le site",
			position: 0
		},
		{
			label:
				"J'ai un problème avec ma situation, mes informations ou le résultat de ma démarche",
			value:
				"J'ai un problème avec ma situation, mes informations ou le résultat de ma démarche",
			position: 1
		},
		{
			label: "J'ai une suggestion d'amélioration pour le site",
			value: "J'ai une suggestion d'amélioration pour le site",
			position: 2
		}
	];

export const createBugForm: Prisma.FormTemplateUncheckedCreateInput = {
	title: "Remontées d'informations",
	slug: 'bug',
	active: true,
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
							position: 0,
							isRequired: true,
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
							position: 0,
							isRequired: false
						}
					]
				}
			}
		]
	}
};
