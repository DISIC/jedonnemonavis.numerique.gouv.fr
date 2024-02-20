export const FIELD_CODE_BOOLEAN_VALUES = [
	{ slug: 'difficulties', question: 'Avez-vous rencontré des difficultés ?' },
	{
		slug: 'help',
		question:
			"Avez-vous eu besoin d'une aide supplémentaire pour cette démarche ?"
	},
	{ slug: 'contact_reached', question: 'Avez vous réussi à les joindre ?' }
] as const;
export const FIELD_CODE_SMILEY_VALUES = [
	{
		slug: 'satisfaction',
		question: "Comment s'est passée cette démarche pour vous ?"
	},
	{
		slug: 'easy',
		question:
			"Selon les réponses suivantes, qu'est ce qui vous correspond le mieux :"
	},
	{
		slug: 'comprehension',
		question: "Qu'avez-vous pensé du langage utilisé ?"
	},
	{
		slug: 'contact_satisfaction',
		question: 'Comment s’est passé l’échange avec le service de la démarche ?'
	}
] as const;
export const FIELD_CODE_DETAILS_VALUES = [
	{
		slug: 'difficulties_details',
		question: 'Quelles ont été ces difficultés ?'
	},
	{
		slug: 'contact',
		question:
			"Avez-vous tenté de contacter le service d'aide en charge de la démarche ?"
	},
	{
		slug: 'contact_channels',
		question:
			'Par quel(s) moyen(s) avez-vous tenté de contacter le service de la démarche ?'
	},
	{ slug: 'help_details', question: 'De quelle aide avez vous eu besoin ?' }
] as const;

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

export const FILTER_LABELS = [
	{
		label: 'Verbatim', 
		value: "needVerbatim",
		type: "checkbox"
	},
	{
		label: 'Autre difficulté',
		value: "needOtherDifficulties",
		type: "checkbox"
	},
	{
		label: 'Autre aide',
		value: "needOtherHelp",
		type: "checkbox"
	},
	{
		label: "Satisfaction",
		value: "satisfaction",
		type: "iconbox"
	},
	{
		label: "Facilité",
		value: "easy",
		type: "iconbox"
	},
	{
		label: "Compréhension",
		value: "comprehension",
		type: "iconbox"
	},
	{
		label: "Difficultés",
		value: "difficulties",
		type: "select"
	},
	{
		label: "Aide",
		value: "help",
		type: "select"
	}
]
