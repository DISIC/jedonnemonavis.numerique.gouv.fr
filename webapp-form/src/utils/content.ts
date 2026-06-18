export interface ContentLine {
	key: string;
	type?: 'noSpaces' | 'link' | 'mailto' | 'list' | 'subtitle' | 'bold';
	href?: string;
}

export interface ContentBlock {
	titleKey: string;
	hideTitle?: boolean;
	content: ContentLine[];
}

export type ContentStructure = Record<string, ContentBlock>;

export const CGU: ContentStructure = {
	responsable: {
		titleKey: 'cgu.responsable.title',
		content: [{ key: 'cgu.responsable.c1' }, { key: 'cgu.responsable.c2' }]
	},
	raison: {
		titleKey: 'cgu.raison.title',
		content: [{ key: 'cgu.raison.c1' }]
	},
	donnees: {
		titleKey: 'cgu.donnees.title',
		content: [{ key: 'cgu.donnees.c1' }]
	},
	autorisation: {
		titleKey: 'cgu.autorisation.title',
		content: [{ key: 'cgu.autorisation.c1' }]
	},
	cookies: {
		titleKey: 'cgu.cookies.title',
		content: [
			{ key: 'cgu.cookies.c1' },
			{ key: 'cgu.cookies.c2' },
			{ key: 'cgu.cookies.c3', type: 'list' },
			{ key: 'cgu.cookies.c4' },
			{ key: 'cgu.cookies.c5' },
			{ key: 'cgu.cookies.c6', type: 'list' },
			{ key: 'cgu.cookies.c7' },
			{ key: 'cgu.cookies.c8' },
			{ key: 'cgu.cookies.c9' },
			{
				key: 'cgu.cookies.c10',
				type: 'link',
				href: 'https://www.cnil.fr/fr/cookies-et-autres-traceurs-que-dit-la-loi'
			},
			{
				key: 'cgu.cookies.c11',
				type: 'link',
				href: 'https://www.cnil.fr/fr/cookies-les-outils-pour-les-maitriser'
			}
		]
	}
};

export const Accessibility: ContentStructure = {
	intro: {
		titleKey: 'accessibility.intro.title',
		hideTitle: true,
		content: [{ key: 'accessibility.intro.c1' }]
	},
	intro_p2: {
		titleKey: 'accessibility.intro_p2.title',
		hideTitle: true,
		content: [
			{ key: 'accessibility.intro_p2.c1', type: 'noSpaces' },
			{
				key: 'accessibility.intro_p2.c2',
				type: 'link',
				href: 'https://jedonnemonavis.numerique.gouv.fr/'
			}
		]
	},
	state: {
		titleKey: 'accessibility.state.title',
		content: [
			{ key: 'accessibility.state.c1', type: 'noSpaces' },
			{ key: 'accessibility.state.c2', type: 'bold' },
			{ key: 'accessibility.state.c3', type: 'noSpaces' }
		]
	},
	state_p2: {
		titleKey: 'accessibility.state_p2.title',
		hideTitle: true,
		content: [{ key: 'accessibility.state_p2.c1', type: 'noSpaces' }]
	},
	info_contact: {
		titleKey: 'accessibility.info_contact.title',
		content: [
			{ key: 'accessibility.info_contact.c1', type: 'noSpaces' },
			{ key: 'accessibility.info_contact.c2', type: 'bold' },
			{ key: 'accessibility.info_contact.c3', type: 'noSpaces' }
		]
	},
	rights: {
		titleKey: 'accessibility.rights.title',
		content: [{ key: 'accessibility.rights.c1', type: 'noSpaces' }]
	},
	rights_p2: {
		titleKey: 'accessibility.rights_p2.title',
		hideTitle: true,
		content: [{ key: 'accessibility.rights_p2.c1', type: 'noSpaces' }]
	},
	rights_p3: {
		titleKey: 'accessibility.rights_p3.title',
		hideTitle: true,
		content: [
			{ key: 'accessibility.rights_p3.c1', type: 'list' },
			{ key: 'accessibility.rights_p3.c2', type: 'list' },
			{ key: 'accessibility.rights_p3.c3', type: 'list' }
		]
	}
};

export const LegalNotice: ContentStructure = {
	editeur: {
		titleKey: 'legal_notice.editeur.title',
		content: [
			{ key: 'legal_notice.editeur.c1' },
			{ key: 'legal_notice.editeur.c2', type: 'noSpaces' },
			{ key: 'legal_notice.editeur.c3', type: 'noSpaces' },
			{ key: 'legal_notice.editeur.c4' },
			{ key: 'legal_notice.editeur.c5', type: 'noSpaces' },
			{ key: 'legal_notice.editeur.c6' }
		]
	},
	directeurPublication: {
		titleKey: 'legal_notice.directeurPublication.title',
		content: [{ key: 'legal_notice.directeurPublication.c1' }]
	},
	hebergement: {
		titleKey: 'legal_notice.hebergement.title',
		content: [
			{ key: 'legal_notice.hebergement.c1' },
			{ key: 'legal_notice.hebergement.c2', type: 'noSpaces' },
			{ key: 'legal_notice.hebergement.c3', type: 'noSpaces' },
			{ key: 'legal_notice.hebergement.c4', type: 'noSpaces' },
			{ key: 'legal_notice.hebergement.c5', type: 'noSpaces' },
			{ key: 'legal_notice.hebergement.c6', type: 'noSpaces' },
			{ key: 'legal_notice.hebergement.c7' }
		]
	},
	accessibilite: {
		titleKey: 'legal_notice.accessibilite.title',
		content: [{ key: 'legal_notice.accessibilite.c1' }]
	},
	moreInfo: {
		titleKey: 'legal_notice.moreInfo.title',
		hideTitle: true,
		content: [
			{ key: 'legal_notice.moreInfo.c1' },
			{
				key: 'legal_notice.moreInfo.c2',
				type: 'link',
				href: 'https://accessibilite.numerique.gouv.fr/'
			}
		]
	},
	securite: {
		titleKey: 'legal_notice.securite.title',
		content: [
			{ key: 'legal_notice.securite.c1' },
			{ key: 'legal_notice.securite.c2' }
		]
	},
	service: {
		titleKey: 'legal_notice.service.title',
		content: [
			{ key: 'legal_notice.service.c1' },
			{ key: 'legal_notice.service.c2' }
		]
	},
	contact: {
		titleKey: 'legal_notice.contact.title',
		content: [
			{ key: 'legal_notice.contact.c1' },
			{
				key: 'legal_notice.contact.c2',
				type: 'mailto',
				href: 'mailto:contact.jdma@design.numerique.gouv.fr'
			}
		]
	}
};

export const TermsOfUse: ContentStructure = {
	appField: {
		titleKey: 'terms_of_use.appField.title',
		content: [{ key: 'terms_of_use.appField.c1' }]
	},
	platform: {
		titleKey: 'terms_of_use.platform.title',
		content: [
			{ key: 'terms_of_use.platform.c1' },
			{ key: 'terms_of_use.platform.c2' }
		]
	},
	service: {
		titleKey: 'terms_of_use.service.title',
		content: [
			{ key: 'terms_of_use.service.c1' },
			{ key: 'terms_of_use.service.c2' }
		]
	},
	features: {
		titleKey: 'terms_of_use.features.title',
		content: [{ key: 'terms_of_use.features.c1' }]
	},
	engagement: {
		titleKey: 'terms_of_use.engagement.title',
		content: [
			{ key: 'terms_of_use.engagement.c1' },
			{ key: 'terms_of_use.engagement.c2', type: 'subtitle' },
			{ key: 'terms_of_use.engagement.c3' },
			{ key: 'terms_of_use.engagement.c4' },
			{ key: 'terms_of_use.engagement.c5' },
			{ key: 'terms_of_use.engagement.c6', type: 'subtitle' },
			{ key: 'terms_of_use.engagement.c7' },
			{ key: 'terms_of_use.engagement.c8' },
			{ key: 'terms_of_use.engagement.c9' },
			{ key: 'terms_of_use.engagement.c10' },
			{ key: 'terms_of_use.engagement.c11' }
		]
	},
	dinum: {
		titleKey: 'terms_of_use.dinum.title',
		content: [
			{ key: 'terms_of_use.dinum.c1', type: 'subtitle' },
			{ key: 'terms_of_use.dinum.c2' },
			{ key: 'terms_of_use.dinum.c3' },
			{ key: 'terms_of_use.dinum.c4' },
			{ key: 'terms_of_use.dinum.c5' },
			{ key: 'terms_of_use.dinum.c6' },
			{ key: 'terms_of_use.dinum.c7', type: 'subtitle' },
			{ key: 'terms_of_use.dinum.c8' },
			{
				key: 'terms_of_use.dinum.c9',
				type: 'link',
				href: 'https://github.com/DISIC/jedonnemonavis.numerique.gouv.fr'
			},
			{ key: 'terms_of_use.dinum.c10' }
		]
	},
	evolution: {
		titleKey: 'terms_of_use.evolution.title',
		content: [{ key: 'terms_of_use.evolution.c1' }]
	},
	accessibility: {
		titleKey: 'terms_of_use.accessibility.title',
		content: [
			{ key: 'terms_of_use.accessibility.c1' },
			{ key: 'terms_of_use.accessibility.c2', type: 'noSpaces' },
			{ key: 'terms_of_use.accessibility.c3', type: 'noSpaces' },
			{ key: 'terms_of_use.accessibility.c4', type: 'noSpaces' },
			{ key: 'terms_of_use.accessibility.c5', type: 'noSpaces' }
		]
	}
};
