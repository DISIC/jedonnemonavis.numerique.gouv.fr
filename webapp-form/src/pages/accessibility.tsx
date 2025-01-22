import { fr } from "@codegouvfr/react-dsfr";
import Head from "next/head";
import React from "react";
import { tss } from "tss-react/dsfr";
import { Accessibility as A11E } from "../utils/content";

const LegalNotice = () => {
  const { cx, classes } = useStyles();

  return (
    <>
      <Head>
        <title>Accessibilité | Je donne mon avis</title>
        <meta
          name="description"
          content={`Accessibilité | Je donne mon avis`}
        />
      </Head>
      <div
        className={fr.cx(
          "fr-container",
          "fr-col-lg-10",
          "fr-col-xl-8",
          "fr-py-20v",
        )}
      >
        <div
          className={fr.cx(
            "fr-grid-row",
            "fr-grid-row--gutters",
            "fr-grid-row--middle",
          )}
        >
          <div className={"fr-col-lg-12"}>
            <h1 className={fr.cx("fr-mb-12v")}>Déclaration d'accessibilité</h1>
            {Object.keys(A11E).map((key) => (
              <div key={key} className={cx(classes.blockWrapper)}>
                {A11E[key].title !== "En savoir plus" &&
                  A11E[key].title !== "" && (
                    <h2 className={fr.cx("fr-mt-8v")}>{A11E[key].title}</h2>
                  )}
                <div>
                  {A11E[key].content.map((line, index) => {
                    const isLink =
                      typeof line === "object" && line.type === "link";
                    const isMailto =
                      typeof line === "object" && line.type === "mailto";
                    const isList =
                      typeof line === "object" && line.type === "list";
                    const isBold =
                      typeof line === "object" && line.type === "bold";
                    return (
                      <React.Fragment key={index}>
                        {isLink ? (
                          <span>
                            <a
                              href={line.href}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {line.text}
                            </a>
                          </span>
                        ) : isMailto ? (
                          <a href={line.href}>{line.text}</a>
                        ) : isList ? (
                          <ul>
                            <li>{line.text}</li>
                          </ul>
                        ) : typeof line === "string" ? (
                          <span>{line}</span>
                        ) : isBold ? (
                          <span className={fr.cx("fr-text--bold")}>
                            {line.text}
                          </span>
                        ) : (
                          <span className={fr.cx()}>{line.text}</span>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

const useStyles = tss.withName(LegalNotice.name).create(() => ({
  blockWrapper: {
    display: "inline-block",
    flexDirection: "column",
    marginBottom: "2rem",

    a: {
      width: "fit-content",
    },
  },
  noSpacesParagraph: {
    marginBottom: "0 !important",
  },
  inLine: {
    display: "inline-flex",
  },
}));

export default LegalNotice;
