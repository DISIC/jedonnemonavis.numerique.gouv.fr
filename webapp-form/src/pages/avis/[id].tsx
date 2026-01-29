import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next/types";
import { tss } from "tss-react/dsfr";
import prisma from "../../utils/db";
import { fr } from "@codegouvfr/react-dsfr";
import { FormWithElements } from "@/src/utils/types";
import { useState } from "react";
import { FormStepRenderer } from "@/src/components/form/layouts/FormStepRenderer";
import Button from "@codegouvfr/react-dsfr/Button";
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
    onSuccess: () => {
      console.log("Review created");
    },
    onError: (error) => {
      console.error("Error creating review:", error);
    },
  });

  const insertOrUpdateReview = trpc.review.dynamicInsertOrUpdate.useMutation({
    onSuccess: () => {
      console.log("Review updated");
    },
    onError: (error) => {
      console.error("Error updating review:", error);
    },
  });

  const handleNext = () => {
    saveCurrentStep();
    if (currentStepIndex < steps.length - 1) {
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

    console.log("Current step answers:", currentStepAnswers);
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

  const handleSubmit = () => {
    saveCurrentStep();
    localStorage.removeItem("userId");
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div
        className={cx(
          classes.container,
          fr.cx("fr-container--fluid", "fr-container"),
        )}
      >
        <div className={classes.blueSection}>
          <h1>Merci !</h1>
        </div>
        <div className={fr.cx("fr-grid-row", "fr-grid-row--center")}>
          <div className={fr.cx("fr-col-12", "fr-col-lg-9")}>
            <div className={classes.formSection}>
              <p>Votre avis a bien été pris en compte.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cx(
        classes.container,
        fr.cx("fr-container--fluid", "fr-container"),
      )}
    >
      <div className={classes.blueSection}>
        <h1>{currentStep.title}</h1>
      </div>

      <div className={fr.cx("fr-grid-row", "fr-grid-row--center")}>
        <div className={fr.cx("fr-col-12", "fr-col-lg-9")}>
          <div className={classes.formSection}>
            <FormStepRenderer
              step={currentStep}
              form={form}
              answers={answers}
              setAnswers={setAnswers}
            />

            {process.env.NODE_ENV === "development" && (
              <details className={fr.cx("fr-mt-4v")}>
                <summary>Debug: Current Answers</summary>
                <pre>{JSON.stringify(answers, null, 2)}</pre>
                <summary>Debug: Answers Array</summary>
                <pre>{JSON.stringify(getAnswersArray(), null, 2)}</pre>
              </details>
            )}

            <div className={classes.buttonsContainer}>
              {currentStepIndex > 0 ? (
                <Button
                  priority="secondary"
                  iconId="fr-icon-arrow-left-line"
                  iconPosition="left"
                  onClick={handlePrevious}
                >
                  Étape précédente
                </Button>
              ) : (
                <div />
              )}

              {currentStepIndex < steps.length - 1 ? (
                <Button
                  priority="primary"
                  iconId="fr-icon-arrow-right-line"
                  iconPosition="right"
                  onClick={handleNext}
                >
                  Étape suivante
                </Button>
              ) : (
                <Button priority="primary" onClick={handleSubmit}>
                  Envoyer
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
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
    backgroundColor: fr.colors.decisions.background.alt.blueFrance.default,
    ...fr.spacing("padding", { topBottom: "6v", rightLeft: "10v" }),
    h1: {
      textAlign: "center",
      fontSize: "2.5rem",
      margin: 0,
      color: fr.colors.decisions.background.flat.blueFrance.default,
    },
    [fr.breakpoints.up("md")]: {
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
}));
