interface Section {
  blocks: string[];
}
interface SecondPart {
  title: string;
  sections: {
    [key: string]: Section;
  };
}

interface Block {
  title?: string;
  content: string[] | string[][];
}

interface LegalNoticeSections {
  [key: string]: Block;
}

interface LegalNotice {
  title: string;
  sections: LegalNoticeSections;
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
  title: "Mentions légales",
  sections: {
    Éditeur: {
      content: [
        "Direction interministérielle du numérique (DINUM)",
        "20 Avenue de Ségur",
        "75007 PARIS",
      ],
    },
    "Directrice de la publication": {
      content: [
        "Stéphanie Schaer, Directrice Interministérielle du Numérique (DINUM).",
      ],
    },
    "Prestataires d'hébergement": {
      title: "Clever Cloud",
      content: [
        [
          "RCS Nantes B 524 172 699",
          "Code APE : 6311Z",
          "N°TVA : FR 87 524 172 699",
          "Siège social : 4 rue Voltaire",
          "44000 Nantes",
          "France",
        ],
      ],
    },
  },
};
