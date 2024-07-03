interface MainStructure {
  [key: string]: {
    title: string;
    content: (
      | string
      | {
          text: string;
          type?:
            | "breakAfter"
            | "breakBefore"
            | "breakBoth"
            | "link"
            | "mailto"
            | "list";
          href?: string;
        }
    )[];
  };
}

export const CGU: MainStructure = {
  responsable: {
    title:
      "Qui est responsable du formulaire de dépôt d’avis Je donne mon avis ?",
    content: [
      {
        text: "Le site du formulaire de dépôt d’avis Je donne mon avis est développé au sein de la Direction Interministérielle du Numérique (DINUM). Le formulaire a pour objectif de donner la possibilité aux usagers des démarches et services publics de donner leur avis sur leur expérience à la suite de leur utilisation.",
        type: "breakAfter",
      },
      {
        text: "Le responsable de l’utilisation des données est la DINUM représenté par Stéphanie Schaer, Directrice Interministérielle du Numérique (DINUM).",
        type: "breakBefore",
      },
    ],
  },
  raison: {
    title: "Pourquoi traitons-nous des données à caractère personnel ?",
    content: [
      "Le site du formulaire de dépôt d’avis Je donne mon avis n’a pas vocation à collecter ni à traiter de données à caractère personnel.",
    ],
  },
  donnees: {
    title: "Quelles sont les données à caractère personnel que nous traitons ?",
    content: [
      "Le site du formulaire de dépôt d’avis Je donne mon avis n’a pas vocation à collecter ni à traiter de données à caractère personnel.",
    ],
  },
  autorisation: {
    title:
      "Qu’est-ce qui nous autorise à traiter vos données à caractère personnel ?",
    content: [
      "Le site du formulaire de dépôt d’avis Je donne mon avis n’a pas vocation à collecter ni à traiter de données à caractère personnel.",
    ],
  },
  cookies: {
    title: "Cookies",
    content: [
      {
        text: "Un cookie est un fichier déposé sur votre terminal lors de la visite d’un site. Il a pour but de collecter des informations relatives à votre navigation et de vous adresser des services adaptés à votre terminal (ordinateur, mobile ou tablette).",
        type: "breakAfter",
      },
      {
        text: "En application de l’article 5(3) de la directive 2002/58/CE modifiée concernant le traitement des données à caractère personnel et la protection de la vie privée dans le secteur des communications électroniques, transposée à l’article 82 de la loi n°78-17 du 6 janvier 1978 relative à l’informatique, aux fichiers et aux libertés, les traceurs ou cookies suivent deux régimes distincts.",
        type: "breakBefore",
      },
      {
        text: "Les cookies n’étant pas strictement nécessaires au service ou n’ayant pas pour finalité exclusive de faciliter la communication par voie électronique doivent être consentis par l’utilisateur.",
        type: "list",
      },
      {
        text: "Ce consentement de la personne concernée pour une ou plusieurs finalités spécifiques constitue une base légale au sens du RGPD et doit être entendu au sens de l’article 6-a du Règlement (UE) 2016/679 du Parlement européen et du Conseil du 27 avril 2016 relatif à la protection des personnes physiques à l’égard du traitement des données à caractère personnel et à la libre circulation de ces données.",
        type: "breakAfter",
      },
      {
        text: "À tout moment, vous pouvez refuser l’utilisation des cookies et désactiver le dépôt sur votre ordinateur en utilisant la fonction dédiée de votre navigateur (fonction disponible notamment sur Microsoft Internet Explorer 11, Google Chrome, Mozilla Firefox, Apple Safari et Opera).",
        type: "breakBefore",
      },
      {
        text: "Certains cookies sont strictement nécessaires au service ou ayant pour finalité exclusive de faciliter la communication par voie électronique et sont dispensés de consentement préalable au titre de l’article 82 de la loi n°78-17 du 6 janvier 1978.",
        type: "list",
      },
      {
        text: "Des cookies relatifs aux statistiques publiques et anonymes sont également déposés.",
        type: "breakAfter",
      },
      {
        text: "La plateforme utilise également la solution de mesure d'audience Matomo en l'ayant configuré en mode « exempté », conformément aux recommandations de la CNIL. Elle ne nécessite donc pas le consentement des personnes concernées.",
        type: "breakBoth",
      },
      {
        text: "Pour aller plus loin, vous pouvez consulter les fiches proposées par la Commission Nationale de l’Informatique et des Libertés (CNIL) :",
        type: "breakBoth",
      },
      {
        text: "Cookies et traceurs : que dit la loi ?",
        type: "link",
        href: "https://www.cnil.fr/fr/cookies-et-autres-traceurs-que-dit-la-loi",
      },
      {
        text: "Cookies : les outils pour les maîtriser",
        type: "link",
        href: "https://www.cnil.fr/fr/cookies-les-outils-pour-les-maitriser",
      },
    ],
  },
};

export const LegalNotice: MainStructure = {
  editeur: {
    title: "Éditeur de la plateforme",
    content: [
      {
        text: "Le formulaire de dépôt d’avis Je donne mon avis est éditée par la Direction interministérielle du numérique de l’Etat (DINUM) située :",
        type: "breakAfter",
      },
      "20 avenue de Ségur",
      { text: "75007 Paris", type: "breakAfter" },
      { text: "Tel. Accueil : 01.71.21.01.70", type: "breakAfter" },
      "SIRET : 12000101100010 (secrétariat général du gouvernement)",
      "SIREN : 120 001 011",
    ],
  },
  directeurPublication: {
    title: "Directeur de la publication",
    content: [
      "La directrice de la publication est Madame Stéphanie Schaer, Directrice interministérielle du numérique.",
    ],
  },
  hebergement: {
    title: "Hébergement de la plateforme",
    content: [
      {
        text: "La plateforme est hébergée par Clever Cloud situé :",
        type: "breakAfter",
      },
      "RCS Nantes B 524 172 699",
      "Code APE : 6311Z",
      "N°TVA : FR 87 524 172 699",
      "Siège social : 4 rue Voltaire",
      "44000 Nantes",
      "France",
    ],
  },
  accessibilite: {
    title: "Accessibilité",
    content: ["L’accessibilité de la plateforme est non conforme."],
  },
  moreInfo: {
    title: "En savoir plus",
    content: [
      {
        text: "Pour en savoir plus sur la politique d’accessibilité numérique de l’État : ",
        type: "breakAfter",
      },
      {
        text: "https://accessibilite.numerique.gouv.fr/",
        type: "link",
        href: "https://accessibilite.numerique.gouv.fr/",
      },
    ],
  },
  securite: {
    title: "Sécurité",
    content: [
      {
        text: "La plateforme est protégée par un certificat électronique, matérialisé pour la grande majorité des navigateurs par un cadenas. Cette protection participe à la confidentialité des échanges.",
        type: "breakAfter",
      },
      "En aucun cas les services associés à la plateforme ne seront à l’origine d’envoi de courriels pour demander la saisie d’informations personnelles.",
    ],
  },
  service: {
    title: "Service",
    content: [
      "Le suivi éditorial et graphique est assuré par la DINUM.",
      "Tout site public ou privé est autorisé à établir, sans autorisation préalable, un lien (y compris profond) vers les informations diffusées sur le site.",
    ],
  },
  contact: {
    title: "Contact",
    content: [
      {
        text: "L’adresse courriel de contact est la suivante : ",
        type: "breakAfter",
      },
      {
        text: "contact.jdma@design.numerique.gouv.fr",
        type: "mailto",
        href: "mailto:contact.jdma@design.numerique.gouv.fr",
      },
    ],
  },
};
