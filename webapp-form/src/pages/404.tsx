import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react/dsfr";

export default function JDMA404() {
  const { classes, cx } = useStyles();

  return (
    <div className={cx(fr.cx("fr-container"), classes.root)}>
      <h1>Formulaire non trouvé</h1>
      <div className={fr.cx("fr-hint-text")}>
        Le lien est invalide ou ce formulaire n'existe plus.
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
