import {
  Language,
  LanguageSelector,
} from "@/components/global/LanguageSelector";
import { fr } from "@codegouvfr/react-dsfr";
import { Footer } from "@codegouvfr/react-dsfr/Footer";
import { Header } from "@codegouvfr/react-dsfr/Header";
import { i18n, useTranslation } from "next-i18next";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { ReactNode } from "react";
import { tss } from "tss-react/dsfr";

export default function PublicLayout({ children }: { children: ReactNode }) {
  const { classes, cx } = useStyles();
  const router = useRouter();
  const { t } = useTranslation("common");

  const onToggleLanguageClick = (newLocale: Language) => {
    const { pathname, asPath, query } = router;
    router.push({ pathname, query }, asPath, { locale: newLocale });
  };

  return (
    <>
      <Head>
        <title>Je donne mon avis</title>
        <meta name="description" content="Je donne mon avis" />
      </Head>
      <Header
        brandTop={
          <>
            REPUBLIQUE
            <br />
            FRANCAISE
          </>
        }
        homeLinkProps={{
          href: "#",
          title: "Je donne mon avis",
        }}
        id="fr-header-public-header"
        serviceTitle={
          <>
            <Image
              className={classes.logo}
              alt="Service public +"
              src="/assets/services-plus.svg"
              title="Service public + logo"
              width={830}
              height={250}
            />
          </>
        }
        quickAccessItems={[
          {
            buttonProps: {
              "aria-controls": "translate-select",
              "aria-expanded": false,
              title: t("select language"),
              className: fr.cx("fr-btn--tertiary", "fr-translate", "fr-nav"),
            },
            iconId: "fr-icon-translate-2",
            text: (
              <LanguageSelector
                lang={(i18n?.language || "fr") as Language}
                setLang={onToggleLanguageClick}
              />
            ),
          },
        ]}
        serviceTagline=""
      />
      <main id="main" role="main">
        {children}
      </main>
      <Footer accessibility="non compliant" />
    </>
  );
}

const useStyles = tss
  .withName(PublicLayout.name)
  .withParams()
  .create(() => ({
    logo: {
      maxHeight: fr.spacing("11v"),
      width: "100%",
    },
  }));
