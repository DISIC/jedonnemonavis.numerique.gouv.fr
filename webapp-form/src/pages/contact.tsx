import { fr } from "@codegouvfr/react-dsfr";
import Head from "next/head";
import React from "react";
import { tss } from "tss-react/dsfr";
import Image from "next/image";

const Contact = () => {
  const { cx, classes } = useStyles();

  return (
    <>
      <Head>
        <title>Contact | Je donne mon avis</title>
        <meta name="description" content={`Contact | Je donne mon avis`} />
      </Head>
      <div
        className={fr.cx(
          "fr-container",
          "fr-col-lg-10",
          "fr-col-xl-8",
          "fr-py-10v"
        )}
      >
        <div
          className={fr.cx(
            "fr-grid-row",
            "fr-grid-row--gutters",
            "fr-grid-row--middle"
          )}
        >
          <div
            className={fr.cx("fr-col-12", "fr-col-md-6", "fr-col-offset-lg-1")}
          >
            <h1 className={fr.cx("fr-mb-5v")}>Nous contacter</h1>
            <div className={cx(classes.description)}>
              <p>Vous pouvez nous contacter à l'adresse e-mail suivante :</p>
              <p className={fr.cx("fr-text--bold")}>
                support@jedonnemonavis.numerique.gouv.fr
              </p>
            </div>
          </div>
          <div className={cx(fr.cx("fr-col-12", "fr-col-md-6", "fr-col-lg-5"))}>
            <Image
              className={cx(classes.contactImage)}
              src={"/Demarches/assets/mailto.svg"}
              alt=""
              width={300}
              height={300}
            />
          </div>
        </div>
      </div>
      <div className={cx(classes.socialBannerBg)}>
        <div className={fr.cx("fr-container", "fr-col-lg-10")}>
          <div
            className={cx(
              fr.cx(
                "fr-grid-row",
                "fr-grid-row--gutters",
                "fr-grid-row--middle"
              ),
              classes.socialBannerContainer
            )}
          >
            <h4>Suivez-nous sur nos réseaux sociaux</h4>
            <div className={cx(classes.socialsLinks)}>
              <a
                href="https://twitter.com"
                target="_blank"
                className="twitter-button"
              >
                <span
                  className="fr-icon-twitter-x-fill fr-icon--lg"
                  aria-hidden="true"
                ></span>
              </a>
              <a href="https://linkedin.com" target="_blank">
                <span
                  className="fr-icon-linkedin-box-fill fr-icon--lg"
                  aria-hidden="true"
                ></span>
              </a>
              <a href="https://youtube.com" target="_blank">
                <span
                  className="fr-icon-youtube-fill fr-icon--lg"
                  aria-hidden="true"
                ></span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const useStyles = tss.withName(Contact.name).create(() => ({
  description: {
    p: {
      marginBottom: "0 !important",
      ...fr.typography[21].style,
    },
  },
  contactImage: {
    width: "100%",
  },
  socialBannerContainer: {
    display: "flex",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 1.25rem",
  },
  socialBannerBg: {
    background: "#f5f5fe",
    paddingTop: "2.5rem",
    paddingBottom: "2.5rem",
    h4: {
      marginBottom: 0,
    },
  },
  socialsLinks: {
    display: "flex",
    gap: 25,
    a: {
      background: "none",
    },
    "[target=_blank]::after": {
      display: "none",
    },
    span: {
      color: fr.colors.decisions.text.title.blueFrance.default,
    },
  },
}));

export default Contact;
