import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next/types";
import { tss } from "tss-react/dsfr";
import prisma from "../../utils/db";
import { fr } from "@codegouvfr/react-dsfr";
import { FormWithElements } from "@/src/utils/types";
import { useState } from "react";
import { FormStepRenderer } from "@/src/components/form/layouts/FormStepRenderer";
import Button from "@codegouvfr/react-dsfr/Button";
import Success from "@codegouvfr/react-dsfr/picto/Success";
import { trpc } from "@/src/utils/trpc";
import { v4 as uuidv4 } from "uuid";

type AvisPageProps = {
  form: FormWithElements;
  buttonId: number;
  productId: number;
};

type DynamicAnswerData = {
  block_id: number;
  answer_item_id?: number;
  answer_text?: string;
};

type FormAnswers = Record<string, DynamicAnswerData | DynamicAnswerData[]>;

export default function AvisPage({ form, buttonId, productId }: AvisPageProps) {
  const { classes, cx } = useStyles();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<FormAnswers>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const steps = form.form_template.form_template_steps;
  const currentStep = steps[currentStepIndex];

  const createReview = trpc.review.dynamicCreate.useMutation({
    onError: (error) => {
      console.error("Error creating review:", error);
    },
  });

  const insertOrUpdateReview = trpc.review.dynamicInsertOrUpdate.useMutation({
    onError: (error) => {
      console.error("Error updating review:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const isLastStep = currentStepIndex === steps.length - 1;

    saveCurrentStep();

    if (isLastStep) {
      localStorage.removeItem("userId");
      setIsSubmitted(true);
    } else {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const getAnswersArray = (): DynamicAnswerData[] => {
    return Object.values(answers).flat();
  };

  const saveCurrentStep = () => {
    const currentStepAnswers = getAnswersArray().filter((answer) => {
      return currentStep.form_template_blocks.some((block) => {
        return block.id === answer.block_id;
      });
    });

    if (currentStepAnswers.length === 0) return;

    const userId = localStorage.getItem("userId");

    if (!userId) {
      const newUserId = uuidv4();
      localStorage.setItem("userId", newUserId);

      createReview.mutate({
        review: {
          product_id: productId,
          button_id: buttonId,
          form_id: form.id,
          user_id: newUserId,
        },
        answers: currentStepAnswers,
      });
    } else {
      insertOrUpdateReview.mutate({
        user_id: userId,
        product_id: productId,
        button_id: buttonId,
        answers: currentStepAnswers,
      });
    }
  };

  if (isSubmitted) {
    return (
      <>
        <div className={classes.blueSection} />
        <div
          className={cx(
            classes.container,
            fr.cx("fr-container--fluid", "fr-container"),
          )}
        >
          <div className={fr.cx("fr-grid-row", "fr-grid-row--center")}>
            <div className={fr.cx("fr-col-12", "fr-col-lg-9")}>
              <div className={cx(classes.formSection, classes.thanksSection)}>
                <Success className={fr.cx("fr-mt-6v", "fr-mb-2v")} />
                <h1>Merci beacoup !</h1>
                <p className={fr.cx("fr-mt-8v")}>
                  Merci, votre avis nous permettra d’améliorer la qualité du
                  service.
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className={classes.blueSection} />
      <div
        className={cx(
          classes.container,
          fr.cx("fr-container--fluid", "fr-container"),
        )}
      >
        <div className={fr.cx("fr-grid-row", "fr-grid-row--center")}>
          <div className={fr.cx("fr-col-12", "fr-col-lg-9")}>
            <div className={classes.formSection}>
              <form onSubmit={handleSubmit}>
                <FormStepRenderer
                  step={currentStep}
                  form={form}
                  answers={answers}
                  setAnswers={setAnswers}
                  currentStepIndex={currentStepIndex}
                  totalSteps={steps.length}
                />

                <div className={classes.buttonsContainer}>
                  {currentStepIndex > 0 ? (
                    <Button
                      priority="secondary"
                      iconId="fr-icon-arrow-left-line"
                      iconPosition="left"
                      onClick={handlePrevious}
                      type="button"
                    >
                      Précédent
                    </Button>
                  ) : (
                    <div />
                  )}

                  {currentStepIndex < steps.length - 1 ? (
                    <Button
                      priority="primary"
                      iconId="fr-icon-arrow-right-line"
                      iconPosition="right"
                      type="submit"
                    >
                      Suivant
                    </Button>
                  ) : (
                    <Button priority="primary" type="submit">
                      Envoyer mon avis
                    </Button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<AvisPageProps> = async ({
  params,
  query,
  locale,
}) => {
  if (!params?.id || isNaN(parseInt(params?.id as string))) {
    return {
      notFound: true,
    };
  }

  const formId = parseInt(params.id as string);
  const buttonId = parseInt(query.button as string);

  if (!buttonId || isNaN(buttonId)) {
    return {
      notFound: true,
    };
  }

  await prisma.$connect();

  const button = await prisma.button.findUnique({
    where: { id: buttonId },
    select: { id: true, form_id: true },
  });

  if (!button || button.form_id !== formId) {
    await prisma.$disconnect();
    return {
      notFound: true,
    };
  }

  const form = await prisma.form.findUnique({
    where: { id: formId },
    include: {
      form_template: {
        include: {
          form_template_steps: {
            include: {
              form_template_blocks: {
                include: {
                  options: true,
                },
              },
            },
          },
        },
      },
      form_configs: {
        include: {
          form_config_displays: true,
          form_config_labels: true,
        },
        orderBy: {
          created_at: "desc",
        },
        take: 1,
      },
      product: {
        select: {
          id: true,
        },
      },
    },
  });

  await prisma.$disconnect();

  if (!form) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      form: JSON.parse(JSON.stringify(form)),
      buttonId: buttonId,
      productId: form.product.id,
      ...(await serverSideTranslations(locale ?? "fr", ["common"])),
    },
  };
};

const blueSectionPxHeight = 200;

const useStyles = tss.withName(AvisPage.name).create(() => ({
  container: {
    overflow: "inherit",
    padding: `${fr.spacing("12v")} 0`,
    [fr.breakpoints.up("md")]: {
      padding: `0`,
    },
  },
  blueSection: {
    display: "none",
    backgroundColor: fr.colors.decisions.background.alt.blueFrance.default,
    ...fr.spacing("padding", { topBottom: "6v", rightLeft: "10v" }),
    h1: {
      textAlign: "center",
      fontSize: "2.5rem",
      margin: 0,
      color: fr.colors.decisions.background.flat.blueFrance.default,
    },
    [fr.breakpoints.up("md")]: {
      display: "block",
      height: `${blueSectionPxHeight}px`,
    },
  },
  formSection: {
    backgroundColor: fr.colors.decisions.background.default.grey.default,
    ...fr.spacing("padding", {
      topBottom: "auto",
      rightLeft: "6v",
    }),
    [fr.breakpoints.up("md")]: {
      transform: `translateY(-${blueSectionPxHeight / 2}px)`,
      ...fr.spacing("padding", { topBottom: "8v", rightLeft: "16v" }),
    },
  },
  buttonsContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: fr.spacing("8v"),
  },
  thanksSection: {
    textAlign: "center",
    h1: {
      color: fr.colors.decisions.background.flat.blueFrance.default,
    },
    svg: {
      width: fr.spacing("20v"),
      height: fr.spacing("20v"),
    },
  },
}));
