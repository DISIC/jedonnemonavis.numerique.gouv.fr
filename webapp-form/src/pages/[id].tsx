import { FormFirstBlock } from "@/src/components/form/layouts/FormFirstBlock";
import { FormSecondBlock } from "@/src/components/form/layouts/FormSecondBlock";
import { Opinion, Product } from "@/src/utils/types";
import { fr } from "@codegouvfr/react-dsfr";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next/types";
import { useState } from "react";
import { tss } from "tss-react/dsfr";

type JDMAFormProps = {
  product: Product;
};

export default function JDMAForm({ product }: JDMAFormProps) {
  const { classes, cx } = useStyles();

  const { t } = useTranslation("common");

  const [opinion, setOpinion] = useState<Opinion>({
    satisfaction: undefined,
    comprehension: undefined,
    easy: undefined,
    difficulties: undefined,
    difficulties_details: [],
    difficulties_details_verbatim: undefined,
    contact: undefined,
    contact_reached: undefined,
    contact_satisfaction: undefined,
    contact_channels: [],
    contact_channels_verbatim: undefined,
    help: undefined,
    help_details: [],
    help_details_verbatim: undefined,
    verbatim: undefined,
  });

  return (
    <div>
      <div className={classes.blueSection}>
        {opinion.satisfaction ? (
          <h1>
            {t("second_block.title")}
            <br />
            {t("second_block.subtitle")}
          </h1>
        ) : (
          <h1>{t("first_block.title")}</h1>
        )}
      </div>
      <div
        className={cx(
          classes.mainContainer,
          fr.cx("fr-container--fluid", "fr-container")
        )}
      >
        <div className={fr.cx("fr-grid-row", "fr-grid-row--center")}>
          <div className={fr.cx("fr-col-12", "fr-col-lg-8")}>
            <div className={cx(classes.formSection)}>
              {opinion.satisfaction ? (
                <FormSecondBlock
                  opinion={opinion}
                  onSubmit={(result) => setOpinion({ ...result })}
                />
              ) : (
                <FormFirstBlock
                  opinion={opinion}
                  product={product}
                  onSubmit={(tmpOpinion) => {
                    setOpinion({ ...tmpOpinion });
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<{
  product: Product;
}> = async ({ params, locale }) => {
  if (!params?.id) {
    return {
      notFound: true,
    };
  }

  const productId = params.id as string;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_WEBAPP_FORM_URL}/api/open-api/product/${productId}`
  );

  if (response.ok) {
    const { data: product } = (await response.json()) as { data: Product };

    if (!product) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        product,
        ...(await serverSideTranslations(locale ?? "fr", ["common"])),
      },
    };
  } else {
    return {
      notFound: true,
    };
  }
};

const blueSectionPxHeight = 200;
const useStyles = tss
  .withName(JDMAForm.name)
  .withParams()
  .create(() => ({
    mainContainer: {
      overflow: "inherit",
    },
    blueSection: {
      backgroundColor: fr.colors.decisions.background.alt.blueFrance.default,
      ...fr.spacing("padding", { topBottom: "6v", rightLeft: "10v" }),
      h1: {
        textAlign: "center",
        fontSize: "2.5rem",
        margin: 0,
        color: fr.colors.decisions.background.flat.blueFrance.default,
        [fr.breakpoints.up("md")]: {
          display: "none",
        },
      },
      [fr.breakpoints.up("md")]: {
        height: `${blueSectionPxHeight}px`,
      },
    },
    formSection: {
      backgroundColor: fr.colors.decisions.background.default.grey.default,
      ...fr.spacing("padding", { topBottom: "4v", rightLeft: "6v" }),
      h1: {
        textAlign: "center",
        color: fr.colors.decisions.background.flat.blueFrance.default,
        ...fr.spacing("margin", { bottom: "8v" }),
      },
      [fr.breakpoints.up("md")]: {
        transform: `translateY(-${blueSectionPxHeight / 2}px)`,
        ...fr.spacing("padding", { topBottom: "8v", rightLeft: "18v" }),
      },
    },
  }));
