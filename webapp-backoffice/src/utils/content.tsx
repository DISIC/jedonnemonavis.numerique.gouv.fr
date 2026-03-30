import { FrIconClassName, RiIconClassName } from '@codegouvfr/react-dsfr';
import {
	ButtonIntegrationTypes,
	FormTemplateButtonStyle
} from '@prisma/client';

interface MainStructure {
	[key: string]: {
		title: string;
		content: (
			| string
			| {
					text: string;
					type?: 'noSpaces' | 'link' | 'mailto' | 'list' | 'subtitle' | 'bold';
					href?: string;
					inLine?: boolean;
			  }
		)[];
	};
}

export const CGU: MainStructure = {
	responsable: {
		title:
			'Qui est responsable du formulaire de dépôt d’avis Je donne mon avis ?',
		content: [
			'Le site du formulaire de dépôt d’avis Je donne mon avis est développé au sein de la Direction Interministérielle du Numérique (DINUM). Le formulaire a pour objectif de donner la possibilité aux usagers des démarches et services publics de donner leur avis sur leur expérience à la suite de leur utilisation.',
			'Le responsable de l’utilisation des données est la DINUM représenté par Stéphanie Schaer, Directrice Interministérielle du Numérique (DINUM).'
		]
	},
	raison: {
		title: 'Pourquoi traitons-nous des données à caractère personnel ?',
		content: [
			'Le site du formulaire de dépôt d’avis Je donne mon avis n’a pas vocation à collecter ni à traiter de données à caractère personnel.'
		]
	},
	donnees: {
		title: 'Quelles sont les données à caractère personnel que nous traitons ?',
		content: [
			'Le site du formulaire de dépôt d’avis Je donne mon avis n’a pas vocation à collecter ni à traiter de données à caractère personnel.'
		]
	},
	autorisation: {
		title:
			'Qu’est-ce qui nous autorise à traiter vos données à caractère personnel ?',
		content: [
			'Le site du formulaire de dépôt d’avis Je donne mon avis n’a pas vocation à collecter ni à traiter de données à caractère personnel.'
		]
	},
	cookies: {
		title: 'Cookies',
		content: [
			'Un cookie est un fichier déposé sur votre terminal lors de la visite d’un site. Il a pour but de collecter des informations relatives à votre navigation et de vous adresser des services adaptés à votre terminal (ordinateur, mobile ou tablette).',
			'En application de l’article 5(3) de la directive 2002/58/CE modifiée concernant le traitement des données à caractère personnel et la protection de la vie privée dans le secteur des communications électroniques, transposée à l’article 82 de la loi n°78-17 du 6 janvier 1978 relative à l’informatique, aux fichiers et aux libertés, les traceurs ou cookies suivent deux régimes distincts.',
			{
				text: 'Les cookies n’étant pas strictement nécessaires au service ou n’ayant pas pour finalité exclusive de faciliter la communication par voie électronique doivent être consentis par l’utilisateur.',
				type: 'list'
			},
			'Ce consentement de la personne concernée pour une ou plusieurs finalités spécifiques constitue une base légale au sens du RGPD et doit être entendu au sens de l’article 6-a du Règlement (UE) 2016/679 du Parlement européen et du Conseil du 27 avril 2016 relatif à la protection des personnes physiques à l’égard du traitement des données à caractère personnel et à la libre circulation de ces données.',
			'À tout moment, vous pouvez refuser l’utilisation des cookies et désactiver le dépôt sur votre ordinateur en utilisant la fonction dédiée de votre navigateur (fonction disponible notamment sur Microsoft Internet Explorer 11, Google Chrome, Mozilla Firefox, Apple Safari et Opera).',
			{
				text: 'Certains cookies sont strictement nécessaires au service ou ayant pour finalité exclusive de faciliter la communication par voie électronique et sont dispensés de consentement préalable au titre de l’article 82 de la loi n°78-17 du 6 janvier 1978.',
				type: 'list'
			},
			'Des cookies relatifs aux statistiques publiques et anonymes sont également déposés.',
			"La plateforme utilise également la solution de mesure d'audience Matomo en l'ayant configuré en mode « exempté », conformément aux recommandations de la CNIL. Elle ne nécessite donc pas le consentement des personnes concernées.",
			'Pour aller plus loin, vous pouvez consulter les fiches proposées par la Commission Nationale de l’Informatique et des Libertés (CNIL) :',
			{
				text: 'Cookies et traceurs : que dit la loi ?',
				type: 'link',
				href: 'https://www.cnil.fr/fr/cookies-et-autres-traceurs-que-dit-la-loi'
			},
			{
				text: 'Cookies : les outils pour les maîtriser',
				type: 'link',
				href: 'https://www.cnil.fr/fr/cookies-les-outils-pour-les-maitriser'
			}
		]
	}
};

export const Accessibility: MainStructure = {
	intro: {
		title: '',
		content: [
			'La direction interministérielle du numérique (DINUM) s’engage à rendre ses sites internet, intranet, extranet et ses progiciels accessibles (et ses applications mobiles et mobilier urbain numérique) conformément à l’article 47 de la loi n°2005-102 du 11 février 2005.'
		]
	},
	intro_p2: {
		title: '',
		content: [
			{
				text: `Cette déclaration d'accessibilité s'applique à${' '}`,
				type: 'noSpaces'
			},
			{
				text: ' jedonnemonavis.numerique.gouv.fr',
				type: 'link',
				href: 'https://jedonnemonavis.numerique.gouv.fr/'
			}
		]
	},
	state: {
		title: 'État de conformité',
		content: [
			{ text: `Le site est `, type: 'noSpaces' },
			{ text: `non conforme `, type: 'bold' },
			{
				text: `avec le référentiel général d’amélioration de l’accessibilité, RGAA version 4.1, en raison de l’absence d’audit de conformité.`,
				type: 'noSpaces'
			}
		]
	},
	state_p2: {
		title: '',
		content: [
			{
				text: `Un audit de conformité est en cours. L’état de conformité sera mis à jour lorsque l’audit sera terminé.`,
				type: 'noSpaces'
			}
		]
	},
	info_contact: {
		title: 'Retour d’information et contact',
		content: [
			{
				text: `Si vous n’arrivez pas à accéder à un contenu ou à un service, vous pouvez nous contacter par courriel à l’adresse `,
				type: 'noSpaces'
			},
			{ text: `contact.jdma@design.numerique.gouv.fr `, type: 'bold' },
			{
				text: `pour être orienté vers une alternative accessible ou obtenir le contenu sous une autre forme.`,
				type: 'noSpaces'
			}
		]
	},
	rights: {
		title: 'Défenseur des droits',
		content: [
			{
				text: `Si vous constatez un défaut d'accessibilité vous empêchant d'accéder à un contenu ou une fonctionnalité du site, que vous nous le signalez et que vous ne parvenez pas à obtenir une réponse de notre part, vous êtes en droit de faire parvenir vos doléances ou une demande de saisine au Défenseur des droits.`,
				type: 'noSpaces'
			}
		]
	},
	rights_p2: {
		title: '',
		content: [
			{ text: `Plusieurs moyens sont à votre disposition :`, type: 'noSpaces' }
		]
	},
	rights_p3: {
		title: '',
		content: [
			{
				text: `Écrire un message au Défenseur des droits (https://www.defenseurdesdroits.fr/nous-contacter-355)`,
				type: 'list'
			},
			{
				text: `Contacter le délégué du Défenseur des droits près de chez vous (https://www.defenseurdesdroits.fr/carte-des-delegues)`,
				type: 'list'
			},
			{
				text: `Envoyer un courrier par la poste (gratuit, ne pas mettre de timbre) Défenseur des droits Libre réponse 71120 75342 Paris CEDEX 07`,
				type: 'list'
			}
		]
	}
};

export const LegalNotice: MainStructure = {
	editeur: {
		title: 'Éditeur de la plateforme',
		content: [
			'Le formulaire de dépôt d’avis Je donne mon avis est éditée par la Direction interministérielle du numérique de l’Etat (DINUM) située :',
			{ text: '20 avenue de Ségur', type: 'noSpaces' },
			{ text: '75007 Paris', type: 'noSpaces' },
			'Tel. Accueil : 01.71.21.01.70',
			{
				text: 'SIRET : 12000101100010 (secrétariat général du gouvernement)',
				type: 'noSpaces'
			},
			'SIREN : 120 001 011'
		]
	},
	directeurPublication: {
		title: 'Directeur de la publication',
		content: [
			'La directrice de la publication est Madame Stéphanie Schaer, Directrice interministérielle du numérique.'
		]
	},
	hebergement: {
		title: 'Hébergement de la plateforme',
		content: [
			'La plateforme est hébergée par Clever Cloud situé :',
			{ text: 'RCS Nantes B 524 172 699', type: 'noSpaces' },
			{ text: 'Code APE : 6311Z', type: 'noSpaces' },
			{ text: 'N°TVA : FR 87 524 172 699', type: 'noSpaces' },
			{ text: 'Siège social : 4 rue Voltaire', type: 'noSpaces' },
			{ text: '44000 Nantes', type: 'noSpaces' },
			'France'
		]
	},
	accessibilite: {
		title: 'Accessibilité',
		content: ['L’accessibilité de la plateforme est non conforme.']
	},
	moreInfo: {
		title: 'En savoir plus',
		content: [
			'Pour en savoir plus sur la politique d’accessibilité numérique de l’État : ',
			{
				text: 'https://accessibilite.numerique.gouv.fr/',
				type: 'link',
				href: 'https://accessibilite.numerique.gouv.fr/'
			}
		]
	},
	securite: {
		title: 'Sécurité',
		content: [
			'La plateforme est protégée par un certificat électronique, matérialisé pour la grande majorité des navigateurs par un cadenas. Cette protection participe à la confidentialité des échanges.',
			'En aucun cas les services associés à la plateforme ne seront à l’origine d’envoi de courriels pour demander la saisie d’informations personnelles.'
		]
	},
	service: {
		title: 'Service',
		content: [
			'Le suivi éditorial et graphique est assuré par la DINUM.',
			'Tout site public ou privé est autorisé à établir, sans autorisation préalable, un lien (y compris profond) vers les informations diffusées sur le site.'
		]
	},
	contact: {
		title: 'Contact',
		content: [
			'L’adresse courriel de contact est la suivante : ',
			{
				text: 'contact.jdma@design.numerique.gouv.fr',
				type: 'mailto',
				href: 'mailto:contact.jdma@design.numerique.gouv.fr'
			}
		]
	}
};

export const TermsOfUse: MainStructure = {
	appField: {
		title: '1. Champ d’application',
		content: [
			'Le présent document définit les modalités d’utilisation du site du formulaire de dépôt d’avis Je donne mon avis, développé au sein de la Direction Interministérielle du Numérique (DINUM).'
		]
	},
	platform: {
		title: '2. Objet de la plateforme',
		content: [
			'Le formulaire a pour objectif de donner la possibilité aux usagers des démarches et services publics de donner leur avis sur leur expérience à la suite de leur utilisation.',
			'Le formulaire de dépôt d’avis Je donne mon avis est développé et opéré par la DINUM. Toute utilisation de ce service doit respecter les présentes modalités d’utilisation.'
		]
	},
	service: {
		title: '3. Accès au service',
		content: [
			'Le formulaire  est mis à disposition de toutes personnes souhaitant donner son avis sur un service numérique public suite à son utilisation.',
			'L’utilisation du service est libre et gratuite et n’est pas soumis à la création d’un compte utilisateur.'
		]
	},
	features: {
		title: '4. Fonctionnalités',
		content: [
			'L’utilisateur ou l’utilisatrice peut déposer son avis en répondant à une série de questions déployée par le formulaire.'
		]
	},
	engagement: {
		title:
			'5. Engagements et responsabilités des utilisateurs et utilisatrices',
		content: [
			'Pour en savoir plus sur la politique d’accessibilité numérique de l’État : ',
			{
				text: '5.1. Usages conformes',
				type: 'subtitle'
			},
			'Le service est mis à disposition pour recueillir les avis des usagers des services publics dans le but de leur amélioration continue.',
			'L’utilisateur ou l’utilisatrice est responsable des données ou contenus qu’il ou elle saisit dans les divers champs libres du formulaire. Il ou elle veille à ne saisir que des messages appropriés.',
			'L’utilisateur s’assure de garder son mot de passe secret. Toute divulgation du mot de passe, quelle que soit sa forme, est interdite. Il assume les risques liés à l’utilisation de son adresse e-mail et de son mot de passe.',
			{
				text: '5.2. Usages interdits',
				type: 'subtitle'
			},
			'L’utilisateur ou l’utilisatrice s’engage à ne pas saisir dans les champs libres du formulaire des contenus ou informations contraires aux dispositions légales et réglementaires en vigueur.',
			'En particulier, il ou elle s’engage à ne communiquer que les données strictement nécessaires à l’évaluation du service numérique public dont il est question et s’abstenir dans les champs libres de révéler des données sensibles le concernant ou concernant des tiers (ex : données de santé, opinion politique, philosophique ou religieuse), de tenir des propos injurieux, diffamatoires, obscènes et plus généralement contraire à la loi et à l’ordre public.',
			'Il est rappelé que toute personne qui procède à une fausse déclaration pour elle-même ou pour autrui s’expose, notamment, aux sanctions prévues à l’article 441-1 du Code pénal, prévoyant des peines pouvant aller jusqu’à trois ans d’emprisonnement et 45 000 euros d’amende.',
			'L’utilisateur s’assure, en amont de la publication, que cette dernière respecte le cadre juridique en vigueur notamment le RGPD, la loi Informatique et libertés, le Code de la propriété intellectuelle et le CRPA.',
			'L’utilisateur s’engage à ne pas publier dans les espaces de discussion ou à quelque endroit que ce soit de messages racistes, sexistes, injurieux, insultants ou contraires à l’ordre public. Chaque commentaire publié emporte cession de ses droits de propriété intellectuelle de façon non exclusive, à titre gracieux, pour le monde entier et pour toute la durée de ces droits.'
		]
	},
	dinum: {
		title: '6. Engagements et responsabilités de la DINUM',
		content: [
			{
				text: '6.1 Sécurité et accès à la Plateforme',
				type: 'subtitle'
			},

			'Les sources des informations diffusées sur la Plateforme sont réputées fiables mais elle ne garantit pas qu’elle soit exempte de défauts, d’erreurs ou d’omissions.',
			'La DINUM s’engage à la sécurisation de la Plateforme, notamment en prenant toutes les mesures nécessaires permettant de garantir la sécurité et la confidentialité des informations fournies.',
			'La DINUM s’engage à fournir les moyens nécessaires et raisonnables pour assurer un accès continu à la Plateforme.',
			'La DINUM se réserve le droit de faire évoluer, de modifier ou de suspendre, sans préavis, le service pour des raisons de maintenance ou pour tout autre motif jugé nécessaire.',
			'La DINUM se réserve le droit de suspendre ou supprimer un compte utilisateur ou utilisatrice du service qui aurait méconnu les présentes modalités d’utilisation, sans préjudice des éventuelles actions en responsabilité pénale et civile qui pourraient être engagées à l’encontre de l’utilisateur ou l’utilisatrice.',
			{
				text: '6.2 Open Source et Licences',
				type: 'subtitle'
			},
			'Le code source de la Plateforme est libre et disponible ici :',
			{
				text: 'https://github.com/DISIC/jedonnemonavis.numerique.gouv.fr',
				type: 'link',
				href: 'https://github.com/DISIC/jedonnemonavis.numerique.gouv.fr'
			},
			'Les contenus proposés par l’Éditeur sont sous Licence Ouverte, à l’exception des logos et des représentations iconographiques et photographiques pouvant être régis par leurs licences propres.'
		]
	},
	evolution: {
		title: '7. Évolution des modalités d’utilisation',
		content: [
			'Les termes des présentes modalités d’utilisation peuvent être modifiés ou complétés à tout moment, sans préavis, en fonction des modifications apportées au service, de l’évolution de la législation ou pour tout autre motif jugé nécessaire. Ces modifications et mises à jour s’imposent à l’utilisateur ou l’utilisatrice qui doit, en conséquence, se référer régulièrement à cette rubrique pour vérifier les conditions générales en vigueur.'
		]
	},
	accessibility: {
		title: '8. Accessibilité',
		content: [
			'Si vous constatez un défaut d’accessibilité vous empêchant d’accéder à un contenu ou une fonctionnalité du service, que vous nous le signalez et que vous ne parvenez pas à obtenir une réponse rapide de notre part, vous êtes en droit de faire parvenir vos doléances ou demande de saisine au défenseur des droits par courrier gratuit, sans affranchissement à l’adresse :',
			{
				text: 'Défenseur des droits',
				type: 'noSpaces'
			},
			{
				text: 'Libre réponse 71120',
				type: 'noSpaces'
			},
			{
				text: '75342 Paris CEDEX 07,',
				type: 'noSpaces'
			},
			{
				text: 'par Téléphone : 09 69 39 00 00 ou via le formulaire en ligne.',
				type: 'noSpaces'
			}
		]
	}
};

export const linksFaqContents: { title: string; children: JSX.Element }[] = [
	{
		title: 'Pourquoi créer plusieurs liens d’intégration ?',
		children: (
			<>
				<p>
					Créer plusieurs liens d'intégration permet de préciser d'où vient la
					réponse de l'utilisateur.
				</p>
				<p>Cela permet par exemple de :</p>
				<ul>
					<li>
						<strong>
							Comparer l'expérience selon le parcours utilisateurs
						</strong>
					</li>
					<li>
						<strong>Comparer l’expérience selon le support</strong> (mobile,
						ordinateur…)
					</li>
					<li>
						Mesurer les résultats selon <strong>le canal utilisé</strong> (sur
						le site, dans un email…)
					</li>
				</ul>
				<p>
					<a
						href="https://docs.numerique.gouv.fr/docs/e6e0fbd2-40f5-4fc5-906f-8043e7f9359b/"
						target="_blank"
					>
						En savoir plus
					</a>
				</p>
			</>
		)
	},
	{
		title:
			'Comment définir le meilleur emplacement pour intégrer un formulaire sur son site?',
		children: (
			<>
				<p>
					L’emplacement du formulaire dépend{' '}
					<strong>du type de retour que vous souhaitez recueillir</strong> et du
					format choisi (avec un bouton, intégré au contenu, avec un bouton
					flottant toujours visible).
				</p>
				<p>
					Le bouton flottant doit être{' '}
					<strong>visible sur la majorité des pages du site</strong> Il est
					généralement utilisé avec{' '}
					<strong>un seul lien d’intégration global.</strong>
				</p>
				<p>
					Le formulaire intégré au contenu doit être placé{' '}
					<strong>après un contenu </strong>
					sur lequel vous souhaitez recueillir un avis ou{' '}
					<strong>à la fin d’une page.</strong>
				</p>
				<p>
					Le bouton avec ouverture du formulaire en pleine page peut être placé
					à la fin d'une démarche, dans un email de confirmation ou dans un
					email dédié. Il est important d’
					<strong>
						expliquer à quoi sert le bouton et le mettre en valeur
					</strong>{' '}
					en le distinguant visuellement du reste de la page. Idéalement, la
					page sur lequel il est placé ne doit pas contenir d'autre action
					(autre bouton).
				</p>
				<p>
					<a
						href="https://docs.numerique.gouv.fr/docs/d9aab8c6-f70c-4cd7-9d07-0cf27b15cc17"
						target="_blank"
					>
						En savoir plus
					</a>
				</p>
			</>
		)
	},
	{
		title: 'Comment intégrer un lien sur mon site ?',
		children: (
			<>
				<p>
					Commencez par créer un lien d’intégration depuis l'onglet{' '}
					<strong>Liens d'intégration</strong> de votre formulaire. Ce lien
					correspond à un code à insérer sur le site de votre choix.
				</p>
				<p>
					Ensuite, collez le code fourni à l’endroit souhaité sur votre site, à
					l’emplacement où vous souhaitez faire apparaître le bouton ou le
					formulaire.
				</p>
				<p>
					N'hésitez pas à solliciter l’aide d’un développeur pour effectuer
					cette intégration.
				</p>
				<p>
					Pour le{' '}
					<strong>
						formulaire de Satisfaction utilisateur "Je donne mon avis"
					</strong>
					, vous pouvez également passer par le site Démarche Simplifiée et
					coller le code dans le champ dédié. Le bouton sera automatiquement
					placé à la fin de la démarche.
				</p>
				<p>
					<a
						href="https://docs.numerique.gouv.fr/docs/8862e507-b41f-48c3-980a-ac67f9baa8f4"
						target="_blank"
					>
						En savoir plus
					</a>
				</p>
			</>
		)
	},
	{
		title: 'Modifier un formulaire qui est déjà en ligne',
		children: (
			<>
				<p>
					Vous pouvez à tout moment ajuster un formulaire sans avoir à le
					recréer ou à modifier les liens d’intégration existants. Les
					modifications apportées sont automatiquement prises en compte et
					visibles par les usagers.
				</p>
				<p>
					<b>Données</b>
					<br />
					Il n’y a aucun impact sur les données déjà collectées. Pour les
					nouvelles données, toute modification de l’affichage d’une étape ou
					d’une option de réponse se répercute sur les statistiques. <br />
					<a
						href="https://docs.numerique.gouv.fr/docs/bd97cb99-ac14-434f-bb13-aed58acabd24"
						target="_blank"
					>
						En savoir plus
					</a>
				</p>
			</>
		)
	}
];

export type InfoContent = {
	title: string;
	iconId: FrIconClassName | RiIconClassName;
};

export type StepContent = InfoContent & {
	slug: 'product' | 'access' | 'form' | 'link';
	url: string;
	details: InfoContent[];
	actionsLabel: string;
	isSkippable?: boolean;
	isCompleted?: boolean;
	isSkipped?: boolean;
	isEditing?: boolean;
};

export const onboardingStepsContent: StepContent[] = [
	{
		slug: 'product',
		title: 'Ajouter un service numérique',
		iconId: 'ri-check-line',
		url: '/administration/dashboard/product/new',
		details: [],
		actionsLabel: ''
	},
	{
		slug: 'access',
		title: 'Inviter des utilisateurs',
		iconId: 'fr-icon-user-add-line',
		url: '/administration/dashboard/product/[id]/access/new',
		details: [
			{
				title:
					'Ajoutez des membres sur votre service numérique et partagez les informations à votre équipe !',
				iconId: 'ri-group-line'
			}
		],
		actionsLabel: 'Inviter des utilisateurs',
		isSkippable: true
	},
	{
		slug: 'form',
		title: 'Générer un formulaire',
		iconId: 'ri-survey-line',
		url: '/administration/dashboard/product/[id]/forms/new',
		details: [
			{
				title:
					'Un formulaire vous permet de récolter les avis de vos usagers sur un service numérique.',
				iconId: 'ri-file-edit-line'
			}
		],
		actionsLabel: 'Générer un formulaire'
	},
	{
		slug: 'link',
		title: 'Intégrer le formulaire sur votre site',
		iconId: 'ri-link',
		url: '/administration/dashboard/product/[id]/forms/[form_id]/link/new',
		details: [
			{ title: 'Créez votre premier lien d’intégration', iconId: 'ri-link' },
			{
				title:
					'Copiez le code généré sur votre site pour publier le formulaire',
				iconId: 'ri-file-copy-line'
			}
		],
		actionsLabel: "Créer un lien d'intégration"
	}
];

export const buttonStylesMapping: Record<
	FormTemplateButtonStyle,
	{
		label: React.ReactNode;
		hintText?: React.ReactNode;
	}
> = {
	solid: {
		label: 'Plein',
		hintText: (
			<p className={'fr-text--xs fr-mb-0'}>
				Le bouton par défaut, à placer sur un{' '}
				<span className="fr-text--bold">fond blanc ou neutre</span>.
			</p>
		)
	},
	outline: {
		label: 'Contour',
		hintText: (
			<p className={'fr-text--xs fr-mb-0'}>
				À placer sur un <span className="fr-text--bold">fond coloré</span>.
			</p>
		)
	},
	ghost: {
		label: 'Contour',
		hintText: (
			<p className={'fr-text--xs fr-mb-0'}>
				Bouton avec un contour léger, à placer sur un{' '}
				<span className="fr-text--bold">fond clair</span>.
			</p>
		)
	}
};

export const allowedStylesByIntegrationType: Record<
	ButtonIntegrationTypes,
	FormTemplateButtonStyle[] | null
> = {
	button: ['solid', 'outline'],
	modal: ['ghost', 'solid'],
	embed: null,
	link: null
};

export const buttonIntegrationTypesMapping: Record<
	ButtonIntegrationTypes,
	{
		label: React.ReactNode;
		hintText?: React.ReactNode;
		noIllustration?: boolean;
		isNew?: boolean;
	}
> = {
	button: {
		label: 'Pleine page',
		hintText:
			'Depuis un bouton, le formulaire s’ouvre dans un nouvel onglet. C’est le seul format compatible avec l’utilisation de Démarches Simplifiées'
	},
	embed: {
		label: 'Intégré au contenu',
		hintText:
			'La 1ère question est visible directement dans la page de contenu',
		isNew: true
	},
	modal: {
		label: 'Flottant',
		hintText:
			'Le formulaire est accessible via un bouton flottant et s’affiche par dessus le contenu',
		isNew: true
	},
	link: {
		label: 'Lien seul',
		hintText:
			'Le lien n’a pas de design associé. Il est à intégrer dans un composant existant de votre site (bouton, bannière,...)',
		noIllustration: true
	}
};
