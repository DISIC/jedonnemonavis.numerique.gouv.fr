import { Prisma } from '@prisma/client';

const createYesNoOptions =
	(): Prisma.FormTemplateBlockOptionCreateWithoutBlockInput[] => [
		{ label: 'Oui', value: 'Oui' },
		{ label: 'Non', value: 'Non' }
	];

const createQualityRatingOptions =
	(): Prisma.FormTemplateBlockOptionCreateWithoutBlockInput[] => [
		{ label: 'Très mauvaise', value: 'Très mauvaise' },
		{ label: 'Mauvaise', value: 'Mauvaise' },
		{ label: 'Ni bonne, ni mauvaise', value: 'Ni bonne, ni mauvaise' },
		{ label: 'Bonne', value: 'Bonne' },
		{ label: 'Excellente', value: 'Excellente' },
		{ label: 'Ne se prononce pas', value: 'Ne se prononce pas' }
	];

const createRadioBlock = (
	label: string,
	options: Prisma.FormTemplateBlockOptionCreateWithoutBlockInput[],
	position: number
): Prisma.FormTemplateBlockUncheckedCreateWithoutForm_template_stepInput => ({
	label,
	type_bloc: 'radio',
	options: { create: options },
	position
});

const contactMethods = [
	"Au guichet avec l'administration",
	"Par téléphone avec l'administration",
	"Par e-mail avec l'administration",
	"Par chat avec l'administration"
];

const simpleContactMethods = [
	'Au guichet',
	'Par téléphone',
	'Par e-mail',
	'Par chat'
];

export const createRootForm: Prisma.FormTemplateUncheckedCreateInput = {
	title: 'Évaluation de la satisfaction usager',
	slug: 'root',
	active: true,
	form_template_steps: {
		create: [
			{
				title: 'Expérience générale',
				position: 0,
				form_template_blocks: {
					create: [
						{
							label: "Texte d'introduction",
							content:
								'<p>Aidez-nous à améliorer le service <b>{{title}}</b> en répondant à quelques questions.</p><p>Vos réponses sont anonyme.</p>',
							type_bloc: 'paragraph',
							position: 0,
							isUpdatable: true
						},
						{
							label: "De façon générale, comment ça s'est passé ?",
							type_bloc: 'smiley_input',
							position: 1,
							isRequired: true
						}
					]
				}
			},
			{
				title: 'Clarté',
				position: 1,
				form_template_blocks: {
					create: [
						{
							label:
								"Qu'avez-vous pensé des informations et des instructions fournies ?",
							downLabel: 'Pas clair du tout',
							upLabel: 'Très clair',
							content:
								"Sur une échelle de 1 à 5, 1 n'est pas clair du tout et 5 est très clair.",
							type_bloc: 'mark_input',
							options: {
								create: [
									{
										label: '1',
										value: '1'
									},
									{
										label: '2',
										value: '2'
									},
									{
										label: '3',
										value: '3'
									},
									{
										label: '4',
										value: '4'
									},
									{
										label: '5',
										value: '5'
									}
								]
							},
							position: 0
						}
					]
				}
			},
			{
				title: 'Aides',
				position: 2,
				form_template_blocks: {
					create: [
						{
							label:
								"Durant votre parcours, avez-vous tenté d'obtenir de l'aide par l'un des moyens suivants ?",
							content: 'Plusieurs choix possibles',
							type_bloc: 'checkbox',
							position: 0,
							options: {
								create: [
									...contactMethods.map(method => ({
										label: method,
										value: method
									})),
									{
										label: 'Une personne proche',
										value: 'Une personne proche'
									},
									{ label: 'Une association', value: 'Une association' },
									{ label: 'Des sites internet', value: 'Des sites internet' },
									{
										label: 'Autres, précisez',
										value: 'Autres, précisez',
										isOther: true
									},
									{
										label: "Je n'ai pas eu besoin d'aide",
										value: "Je n'ai pas eu besoin d'aide",
										isIsolated: true
									}
								]
							}
						},
						{
							label:
								"Quand vous avez cherché de l'aide, avez-vous réussi à joindre l'administration ?",
							type_bloc: 'heading_3',
							position: 1
						},
						...contactMethods.map((method, index) =>
							createRadioBlock(method, createYesNoOptions(), index + 2)
						),
						{
							label:
								"Comment évaluez-vous la qualité de l'aide que vous avez obtenue de la part de l'administration ?",
							type_bloc: 'heading_3',
							position: contactMethods.length + 2
						},
						...simpleContactMethods.map((method, index) =>
							createRadioBlock(
								method,
								createQualityRatingOptions(),
								index + contactMethods.length + 3
							)
						)
					]
				}
			},
			{
				title: 'Informations complémentaires',
				position: 3,
				form_template_blocks: {
					create: [
						{
							label: 'Souhaitez-vous nous en dire plus ?',
							content: "Ne partagez pas d'information personnelle.",
							type_bloc: 'input_text_area',
							position: 0
						}
					]
				}
			}
		]
	}
};
