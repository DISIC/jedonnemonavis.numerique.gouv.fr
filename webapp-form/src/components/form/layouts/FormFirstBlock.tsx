import { primarySection } from "@/src/utils/form";
import { FormField, Opinion, Product } from "@/src/utils/types";
import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useState } from "react";
import { tss } from "tss-react/dsfr";
import { Field } from "../elements/Field";
import { SmileyInput } from "../elements/SmileyInput";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

type Props = {
  product: Product;
  opinion: Opinion;
  onSubmit: (opinion: Opinion) => void;
};

export const FormFirstBlock = (props: Props) => {
  const { onSubmit, product, opinion } = props;
  const [tmpOpinion, setTmpOpinion] = useState<Opinion>(opinion);
  const { t } = useTranslation("common");
  const router = useRouter();

  const { classes, cx } = useStyles();

  return (
    <div>
      <h1 className={cx(classes.title)}>{t("first_block.title")}</h1>
      <div className={fr.cx("fr-grid-row")}>
        <div className={cx(classes.notice, fr.cx("fr-col-12", "fr-p-10v"))}>
          <p className={fr.cx("fr-mb-0")}>
            <span>{t("first_block.subtitle_part_1")}</span>
            <span className={cx(classes.bold)}> {product.title}</span>
            <span> {t("first_block.subtitle_part_2")}</span>
          </p>
        </div>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(tmpOpinion);
          router.push({
            pathname: router.pathname,
            query: { id: product.id, step: 0 },
          });
        }}
        // TO REMOVE WHEN UNCOMMENT PRODCT NAME
        className={fr.cx("fr-mt-14v")}
      >
        {primarySection.map((field: FormField) => (
          <div key={field.name} className={cx(classes.field)}>
            <Field
              field={field}
              opinion={tmpOpinion}
              setOpinion={setTmpOpinion}
              form={primarySection}
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
    notice: {
      backgroundColor: fr.colors.decisions.background.alt.blueFrance.default,
    },
    bold: {
      fontWeight: 800,
    },
    title: {
      [fr.breakpoints.down("md")]: {
        display: "none",
      },
    },
    field: {
      marginBottom: fr.spacing("14v"),
    },
  }));
