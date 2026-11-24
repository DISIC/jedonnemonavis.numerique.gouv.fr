import type {
	FrIconClassName,
	RiIconClassName
} from '@codegouvfr/react-dsfr/fr/generatedFromCss/classNames';

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

export type HeaderMenuLink = {
	label: string;
	href: string;
	iconId: FrIconClassName | RiIconClassName;
	isExternal: boolean;
};

export const HELP_MENU_LINKS: HeaderMenuLink[] = [
	{
		label: 'Nouveautés',
		href: 'https://docs.numerique.gouv.fr/docs/0b3cd9e3-6a39-4980-ba5b-17c1d7634d50',
		iconId: 'fr-icon-flashlight-line',
		isExternal: true
	},
	{
		label: 'Documentation',
		href: 'https://docs.numerique.gouv.fr/docs/99f0a063-5bfd-49a6-97b5-7ec5fb83206d/',
		iconId: 'fr-icon-file-text-line',
		isExternal: true
	},
	{
		label: 'Signaler un problème',
		href:
			process.env.NEXT_PUBLIC_FEEDBACK_FORM_URL ||
			'https://jedonnemonavis.numerique.gouv.fr',
		iconId: 'fr-icon-edit-line',
		isExternal: false
	},
	{
		label: 'Nous contacter',
		href: '/public/contact',
		iconId: 'fr-icon-chat-3-line',
		isExternal: false
	}
];
