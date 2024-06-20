import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react/dsfr";

export default function JDMA404() {
  const { classes, cx } = useStyles();

  return (
    <div className={cx(fr.cx("fr-container"), classes.root)}>
      <h1>Ce formulaire n'existe pas</h1>
      <div className={fr.cx("fr-hint-text")}>
        Besoin d'aide ? Une question ?<br />
        Vous pouvez contacter notre équipe à l'adresse suivante :{" "}
        <a href="mailto:support@jedonnemonavis.numerique.gouv.fr">
          support@jedonnemonavis.numerique.gouv.fr
        </a>
      </div>
    </div>
  );
}

const useStyles = tss
  .withName(JDMA404.name)
  .withParams()
  .create(() => ({
    root: {
      minHeight: "80vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
    },
  }));
