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
