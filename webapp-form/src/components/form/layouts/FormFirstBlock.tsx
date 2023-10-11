import { firstSection } from "@/src/utils/form";
import { FormField, Opinion, Product } from "@/src/utils/types";
import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useState } from "react";
import { tss } from "tss-react/dsfr";
import { Field } from "../elements/Field";
import { SmileyInput } from "../elements/SmileyInput";
import { useTranslation } from "next-i18next";

type Props = {
  product: Product;
  opinion: Opinion;
  onSubmit: (opinion: Opinion) => void;
};

export const FormFirstBlock = (props: Props) => {
  const { onSubmit, product, opinion } = props;
  const [tmpOpinion, setTmpOpinion] = useState<Opinion>(opinion);
  const { t } = useTranslation("common");

  const { classes, cx } = useStyles();

  return (
    <div>
      <h1 className={cx(classes.title)}>{t("first_block.title")}</h1>
      <h2 className={fr.cx("fr-mt-4v", "fr-mt-md-14v", "fr-mb-10v")}>
        {t("first_block.product")} :{" "}
        <span className={fr.cx("fr-text--regular")}>{product.title}</span>
      </h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(tmpOpinion);
        }}
      >
        {firstSection.map((field: FormField) => (
          <div key={field.name} className={cx(classes.field)}>
            <Field
              field={field}
              opinion={tmpOpinion}
              setOpinion={setTmpOpinion}
            />
          </div>
        ))}
        <div className={fr.cx("fr-mt-16v")}>
          <Button type="submit" disabled={!tmpOpinion.satisfaction}>
            {t("first_block.validate")}
          </Button>
        </div>
      </form>
    </div>
  );
};

const useStyles = tss
  .withName(SmileyInput.name)
  .withParams()
  .create(() => ({
    title: {
      [fr.breakpoints.down("md")]: {
        display: "none",
      },
    },
    field: {
      marginBottom: fr.spacing("14v"),
    },
  }));
