import { FormFirstBlock } from "@/src/components/form/layouts/FormFirstBlock";
import { FormSecondBlock } from "@/src/components/form/layouts/FormSecondBlock";
import { FormField, Opinion, Product } from "@/src/utils/types";
import { fr } from "@codegouvfr/react-dsfr";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next/types";
import { useState } from "react";
import { tss } from "tss-react/dsfr";
import { trpc } from "../utils/trpc";
import { Prisma } from "@prisma/client";
import { firstSection, secondSection } from "../utils/form";
import Alert from "@codegouvfr/react-dsfr/Alert";

type JDMAFormProps = {
  product: Product;
};

export default function JDMAForm({ product }: JDMAFormProps) {
  const { classes, cx } = useStyles();

  const { t } = useTranslation("common");

  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

  const createReview = trpc.review.create.useMutation({
    onSuccess: () => setIsFormSubmitted(true),
  });

  const getValueLabel = (field: FormField, value: string) => {
    if (field.kind === "radio" || field.kind == "checkbox") {
      return t(
        field.options.find((option) => option.value === value)?.label as string,
        {
          lng: "fr",
        }
      );
    } else if (field.kind === "smiley") {
      return t(`smileys.${value}`, {
        lng: "fr",
      });
    } else {
      return value;
    }
  };

  const handleSubmitReview = async (opinion: Opinion) => {
    const answers: Prisma.AnswerCreateInput[] = Object.entries(opinion).flatMap(
      ([key, value], index) => {
        const fieldInSection = (
          key === "satisfaction" ? firstSection : secondSection
        ).find((field) => field.name === key) as FormField;

        let tmpAnswer = {
          answer_item_id: index + 1,
          field_code: fieldInSection.name,
          field_label: t(fieldInSection.label, {
            lng: "fr",
          }) as string,
          kind:
            fieldInSection.kind === "smiley"
              ? "radio"
              : fieldInSection.kind !== "input-text" &&
                fieldInSection.kind !== "input-textarea"
              ? fieldInSection.kind
              : "text",
          review: {},
        } as Prisma.AnswerCreateInput;

        if (typeof value == "string") {
          const valueLabel = getValueLabel(fieldInSection, value as string);
          tmpAnswer.answer_text = valueLabel;
          return tmpAnswer;
        } else if (Array.isArray(value)) {
          let tmpAnswers = [] as Prisma.AnswerCreateInput[];
          value.map((value) => {
            let currentValueLabel = getValueLabel(fieldInSection, value);
            tmpAnswer.answer_text = currentValueLabel;
            tmpAnswers.push({ ...tmpAnswer });
          });
          return tmpAnswers;
        } else {
          return [];
        }
      }
    );

    createReview.mutate({
      review: {
        product_id: product.id,
        button_id: 1,
        form_id: 1,
      },
      answers,
    });
  };

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
      <div>
        <div className={classes.blueSection}>
          {!isFormSubmitted ? (
            opinion.satisfaction ? (
              <h1>
                {t("second_block.title")}
                <br />
                {t("second_block.subtitle")}
              </h1>
            ) : (
              <h1>{t("first_block.title")}</h1>
            )
          ) : (
            <h1>{t("success_block.title")}</h1>
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
                {!isFormSubmitted ? (
                  opinion.satisfaction ? (
                    <FormSecondBlock
                      opinion={opinion}
                      onSubmit={(result) => {
                        setOpinion({ ...result });
                        handleSubmitReview(result);
                      }}
                    />
                  ) : (
                    <FormFirstBlock
                      opinion={opinion}
                      product={product}
                      onSubmit={(tmpOpinion) => setOpinion({ ...tmpOpinion })}
                    />
                  )
                ) : (
                  <div>
                    <h1 className={classes.titleSection}>
                      {t("success_block.title")}
                    </h1>
                    <div>
                      <Alert
                        severity="success"
                        description={t("success_block.alert")}
                        small
                      />
                    </div>
                  </div>
                )}
              </div>
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
    titleSection: {
      [fr.breakpoints.down("md")]: {
        display: "none",
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
