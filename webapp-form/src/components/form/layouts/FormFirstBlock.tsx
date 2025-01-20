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
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Loader } from "../../global/Loader";

type Props = {
  product: Product;
  opinion: Opinion;
  onSubmit: (opinion: Opinion) => void;
  isRateLimitReached: boolean;
  setIsRateLimitReached: (value: boolean) => void;
};

export const FormFirstBlock = (props: Props) => {
  const {
    onSubmit,
    product,
    opinion,
    isRateLimitReached,
    setIsRateLimitReached,
  } = props;
  const [tmpOpinion, setTmpOpinion] = useState<Opinion>(opinion);
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
          setIsLoading(true);
          onSubmit(tmpOpinion);
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
        {isRateLimitReached && (
          <div role="status">
            <Alert
              closable
              onClose={function noRefCheck() {
                setIsRateLimitReached(false);
              }}
              severity="error"
              title=""
              description="Trop de tentatives de dépôt d'avis, veuillez patienter 1h avant de pouvoir re-déposer."
            />
          </div>
        )}
        <div className={fr.cx("fr-mt-16v")}>
          {isLoading ? (
            <Button type="button" className={classes.loading}>
              <div>
                <i className={fr.cx("ri-loader-4-line")} />
              </div>
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={!tmpOpinion.satisfaction || isRateLimitReached}
            >
              {t("first_block.validate")}
            </Button>
          )}
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
    loading: {
      i: {
        display: "inline-block",
        animation: "spin 1s linear infinite;",
        color: fr.colors.decisions.background.default.grey.default,
        width: "8.5rem",
        ["&::before"]: {
          "--icon-size": "1.5rem",
        },
      },
    },
  }));
