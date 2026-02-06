export const FIELD_CODE_BOOLEAN_VALUES = [
	{
		slug: 'contact_reached',
		hint: 'Cette question est une sous-question de "contact_tried", mais l\'indiquer dans votre requête permettra d\'aggréger les données.',
		question:
			"Quand vous avez cherché de l'aide, avez-vous réussi à joindre l'administration ?"
	}
] as const;

export const FIELD_CODE_SMILEY_VALUES = [
	{
		slug: 'satisfaction',
		question: "Comment s'est passée cette démarche pour vous ?"
	},
	{
		slug: 'easy',
		hideInDocs: true,
		question: 'Était-ce facile à utiliser ?'
	},
	{
		slug: 'comprehension',
		question:
			"Qu'avez-vous pensé des informations et des instructions fournies ?"
	}
] as const;
export const FIELD_CODE_DETAILS_VALUES = [
	{
		slug: 'difficulties',
		hideInDocs: true,
		question: 'Avez-vous rencontré des difficultés ?'
	},
	{
		slug: 'help',
		hideInDocs: true,
		question: 'De quelle aide avez-vous eu besoin ?'
	},
	{
		slug: 'contact_tried',
		hint: 'Les sous-questions conditionnelles "contact_reached" et "contact_satisfaction" associées à cette question sont incluses dans le résultat.',
		question:
			'Durant votre parcours, avez-vous tenté d’obtenir de l’aide par l’un des moyens suivants ?'
	},
	{
		slug: 'contact_satisfaction',
		hint: 'Cette question est une sous-question de "contact_tried", mais l\'indiquer dans votre requête permettra d\'aggréger les données.',
		question:
			"Comment évaluez-vous la qualité de l'aide que vous avez obtenue de la part de l'administration ?"
	},
	{
		slug: 'contact',
		hideInDocs: true,
		question:
			"Avez-vous tenté de contacter le service d'aide en charge de la démarche ?"
	},
	{
		slug: 'contact_channels',
		hideInDocs: true,
		question:
			'Par quel(s) moyen(s) avez-vous tenté de contacter le service de la démarche ?'
	},
	{
		slug: 'help_details',
		hideInDocs: true,
		question: 'De quelle aide avez vous eu besoin ?'
	}
] as const;

export type FieldCodeHelper =
	| (typeof FIELD_CODE_BOOLEAN_VALUES)[number]
	| (typeof FIELD_CODE_SMILEY_VALUES)[number]
	| (typeof FIELD_CODE_DETAILS_VALUES)[number];

export const DIFFICULTIES_LABEL = [
	{
		label: 'J’ai manqué d’information avant de commencer la démarche',
		value: 'J’ai manqué d’information avant de commencer la démarche'
	},
	{
		label: 'La démarche n’a pas fonctionné',
		value: 'La démarche n’a pas fonctionné'
	},
	{
		label: 'Le site ne s’affichait pas bien sur mobile',
		value: 'Le site ne s’affichait pas bien sur mobile'
	},
	{
		label: 'J’ai eu des difficultés à joindre des documents',
		value: 'J’ai eu des difficultés à joindre des documents'
	},
	{
		label:
			'Il manquait des informations sur les suites de ma demande ou de ma démarche (délai, etc.)',
		value:
			'Il manquait des informations sur les suites de ma demande ou de ma démarche (délai, etc.)'
	},
	{
		label: 'Autre',
		value: 'Autre'
	}
] as const;

export const HELP_LABELS = [
	{
		label: "J'ai fait une recherche sur internet (site, forum)",
		value: "J'ai fait une recherche sur internet (site, forum)"
	},
	{
		label: "J'ai demandé de l’aide à un proche (famille, ami)",
		value: "J'ai demandé de l’aide à un proche (famille, ami)"
	},
	{
		label: "J'ai demandé de l’aide à une association",
		value: "J'ai demandé de l’aide à une association"
	},
	{
		label: 'Autre',
		value: 'Autre'
	}
] as const;
