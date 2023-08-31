import Head from "next/head";
import { ReactNode } from "react";

import { Header, HeaderProps } from "@codegouvfr/react-dsfr/Header";
import { Footer } from "@codegouvfr/react-dsfr/Footer";

export default function PublicLayout({ children }: { children: ReactNode }) {
  const quickAccessItems: HeaderProps.QuickAccessItem[] = [
    {
      iconId: "fr-icon-account-line",
      linkProps: {
        href: "",
        target: "_blank",
      },
      text: "L'Observatoire",
    },
    {
      iconId: "fr-icon-account-line",
      linkProps: {
        href: "/login",
        target: "_self",
      },
      text: "Connexion / Inscription",
    },
  ];

  return (
    <>
      <Head>
        <title>Je donne mon avis</title>
        <meta name="description" content="Je donne mon avis" />
      </Head>
      <Header
        brandTop={<>Je donne mon avis</>}
        homeLinkProps={{
          href: "/",
          title: "Accueil",
        }}
        id="fr-header-public-header"
        quickAccessItems={quickAccessItems}
        serviceTitle="Je donne mon avis"
        serviceTagline="baseline - précisions sur l'organisation"
      />
      <main id="main" role="main">
        {children}
      </main>
      <Footer />
    </>
  );
}
