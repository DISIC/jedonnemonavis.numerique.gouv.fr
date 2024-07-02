interface Section {
  blocks: string[];
}
interface SecondPart {
  title: string;
  sections: {
    [key: string]: Section;
  };
}

interface LegalNotice {
  [key: string]: {
    title: string;
    content: (
      | string
      | {
          text: string;
          type?: "breakAfter" | "link" | "mailto";
          href?: string;
        }
    )[];
  };
}

export const CGU = {
  title: "Conditions générales d'utilisation",
  firstPart: {
    subtitle: "Conditions d’utilisation",
    firstBlock:
      "Ce site permet de suivre l’avancée et la qualité de la dématérialisation des 250 démarches phares de l'État. Il met à disposition les données précises sur l’offre de services dématérialisés aux usagers et présente des indicateurs de qualité concrets mis à jour tous les 3 mois.",
    secondBlock:
      "Il permet également aux usagers de donner leurs avis sur les démarches en ligne qu’ils viennent d’effectuer, et en affiche les résultats de manière transparente. Un bouton/lien situé à la fin de la démarche permet d’accéder à ce service.",
    thirdBlock: {
      firstBlock:
        "Lorsque vous donnez un avis détaillé sur une démarche (espace d’expression libre), nous vous prions de :",
      secondBlock: [
        "ne pas nous communiquer d’informations personnelles, permettant de vous identifier ou d’identifier une autre personne (identité, date de naissance, adresse, courriel, y compris professionnel, identifiant administratif, etc.) ;",
        "ne pas inclure d’insultes ou de propos dénigrants ou diffamatoires à l’encontre d’une personne.",
      ],
    },
    fourthBlock:
      "Vous ne pouvez en tant qu’usager ou accompagnant évaluer qu’une seule fois la démarche. Vous pouvez néanmoins formuler un nouvel avis à chaque fois que vous effectuez à nouveau la même démarche.",
    fifthBlock: {
      firstBlock:
        "L'adresse URL qui permet d'accéder au service Vos démarches essentielles est la suivante :",
      url1: "https://observatoire.numerique.gouv.fr",
      secondBlock:
        "L'adresse URL vers laquelle sont dirigés les usagers qui donnent leurs avis à la fin d'une démarche est la suivante dépend de la démarche en question mais commence systématiquement par : ",
      url2: "https://jedonnemonavis.numerique.gouv.fr",
    },
  },
  secondPart: {
    title: "Vie privée",
    sections: {
      "Informations de connexion et d'appareil": {
        blocks: [
          "Lorsque vous donnez votre avis sur une démarche administrative sur le site, nous recevons des informations relatives à votre ordinateur, téléphone ou autre outil que vous utilisez pour accéder à MonAvis. Nous pouvons par exemple avoir accès à votre adresse IP, ou aux URLs d'entrée ou de sortie. Le volume d'information recueillie dépend de la configuration de votre appareil et de votre navigateur.",
          "Nous stockons votre adresse IP de façon temporaire pour des raisons d'analyse technique, et nous ne la partageons avec aucun partenaire autre que les prestataires techniques ayant des engagements de confidentialité.",
        ],
      },
      Cookies: {
        blocks: [
          "Nous collectons des données anonymes d’audience du site, dans le respect des conditions définies par la recommandation « Cookies » de la Commission nationale informatique et libertés (CNIL).",
          "L’outil de mesure d’audience que nous utilisons (Matomo) est paramétré de façon à ce que les informations recueillies soient anonymisées.",
        ],
      },
      "Vos données à caractère personnel": {
        blocks: [
          "Conformément aux dispositions de la loi n° 78-17 du 6 janvier 1978 relative à l’informatique, aux fichiers et aux libertés, vous disposez d’un droit d’accès, de modification, de rectification et de suppression des données qui vous concernent. Pour demander une modification, rectification ou suppression des données vous concernant, il vous suffit de nous écrire par voie électronique à contact@design.numerique.gouv.fr ou postale à la Direction interministérielle du numérique (DINUM), 20, avenue de Ségur, 75007 Paris en justifiant de votre identité. Si vous estimez, après nous avoir contactés, que vos droits Informatique et Libertés ne sont pas respectés, vous pouvez adresser une réclamation à la CNIL.",
        ],
      },
      "Refuser le suivi de votre navigation": {
        blocks: [
          "Malgré tout, si vous le souhaitez, vous avez la possibilité de refuser que votre navigation sur notre site soit enregistrée, en cochant la case ci-dessous.",
          `Vous n'êtes pas suivi car votre navigateur signale que vous ne le souhaitez pas. Il s'agit d'un paramètre de votre navigateur, vous ne pourrez donc pas vous inscrire tant que vous n'aurez pas désactivé la fonction "Ne pas suivre".`,
        ],
      },
    },
  } as SecondPart,
};

export const LegalNotice: LegalNotice = {
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
      "Pour en savoir plus sur la politique d’accessibilité numérique de l’État : ",
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
      "L’adresse courriel de contact est la suivante : ",
      {
        text: "contact.jdma@design.numerique.gouv.fr",
        type: "mailto",
        href: "mailto:contact.jdma@design.numerique.gouv.fr",
      },
    ],
  },
};
