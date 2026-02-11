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
import Notice from "@codegouvfr/react-dsfr/Notice";
import Alert from "@codegouvfr/react-dsfr/Alert";

type AvisPageProps = {
  form: FormWithElements;
  buttonId: number;
  productId: number;
  isIframe: boolean;
};

type DynamicAnswerData = {
  block_id: number;
  answer_item_id?: number;
  answer_text?: string;
};

type FormAnswers = Record<string, DynamicAnswerData | DynamicAnswerData[]>;

export default function AvisPage({
  form,
  buttonId,
  productId,
  isIframe,
}: AvisPageProps) {
  const { classes, cx } = useStyles();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<FormAnswers>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isRateLimitReached, setIsRateLimitReached] = useState<boolean>(false);
  const [reviewId, setReviewId] = useState<{
    id: number;
    created_at: Date;
  } | null>(null);

  const formConfig = form.form_configs[0];
  const allSteps = form.form_template.form_template_steps;
  const steps = allSteps.filter((step) => {
    const isHidden = formConfig?.form_config_displays?.some(
      (d) => d.kind === "step" && d.parent_id === step.id && d.hidden,
    );
    return !isHidden;
  });

  const currentStep = steps[currentStepIndex];

  const createReview = trpc.review.dynamicCreate.useMutation({
    onSuccess: (data) => {
      setReviewId({
        id: data.data.id,
        created_at: data.data.created_at,
      });
      setIsRateLimitReached(false);
    },
    onError: (error) => {
      if (error.data?.httpStatus === 429) {
        setIsRateLimitReached(true);
      }
      console.error("Error creating review:", error);
    },
  });

  const insertOrUpdateReview = trpc.review.dynamicInsertOrUpdate.useMutation({
    onError: (error) => {
      console.error("Error updating review:", error);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const isLastStep = currentStepIndex === steps.length - 1;

    try {
      await saveCurrentStep();

      if (isLastStep) {
        setIsSubmitted(true);
      } else {
        setCurrentStepIndex(currentStepIndex + 1);
      }
    } catch (error) {
      console.error("Error saving step:", error);
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

  const saveCurrentStep = async () => {
    if (isIframe) return;

    const currentStepAnswers = getAnswersArray().filter((answer) => {
      return currentStep.form_template_blocks.some((block) => {
        return block.id === answer.block_id;
      });
    });

    if (currentStepAnswers.length === 0) return;

    let userId = localStorage.getItem("userId");
    if (!userId) {
      userId = uuidv4();
      localStorage.setItem("userId", userId);
    }

    if (!reviewId) {
      await createReview.mutateAsync({
        review: {
          product_id: productId,
          button_id: buttonId,
          form_id: form.id,
          user_id: userId,
        },
        answers: currentStepAnswers,
      });
    } else {
      await insertOrUpdateReview.mutateAsync({
        review_id: reviewId.id,
        review_created_at: reviewId.created_at,
        answers: currentStepAnswers,
      });
    }
  };

  const IFrameAlert = () => (
    <Notice
      className={cx(classes.notice)}
      isClosable
      onClose={function noRefCheck() {}}
      title={
        <>
          <b>Vous prévisualisez une version non plubliée du formulaire.</b>
          <span className={fr.cx("fr-ml-2v")}>
            Vos réponses ne sont pas prises en compte.
          </span>
        </>
      }
    />
  );

  if (isSubmitted) {
    return (
      <>
        {isIframe && <IFrameAlert />}
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
      {isIframe && <IFrameAlert />}
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

                {isRateLimitReached && (
                  <Alert
                    severity="error"
                    title="Détection d'activité suspecte"
                    description="Vous semblez déposer beaucoup de réponses à la suite, vous avez été bloqué par l'anti-spam. Veuillez réessayer plus tard."
                    closable
                    onClose={() => setIsRateLimitReached(false)}
                  />
                )}

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
                      disabled={isRateLimitReached}
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
  const isIframe = query.iframe === "true";
  const buttonId = parseInt(query.button as string);
  const formConfigParam = query.formConfig as string | undefined;

  if (!isIframe && (!buttonId || isNaN(buttonId))) {
    return {
      notFound: true,
    };
  }

  await prisma.$connect();

  if (!isIframe) {
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
          title: true,
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

  let formWithConfig = JSON.parse(JSON.stringify(form));

  if (formConfigParam) {
    try {
      const parsedConfig = JSON.parse(formConfigParam);
      formWithConfig.form_configs = [
        {
          form_config_displays:
            parsedConfig.displays || parsedConfig.form_config_displays || [],
          form_config_labels:
            parsedConfig.labels || parsedConfig.form_config_labels || [],
        },
      ];
    } catch (error) {
      console.error("Failed to parse formConfig:", error);
    }
  }

  return {
    props: {
      form: formWithConfig,
      buttonId: buttonId || 0,
      productId: form.product.id,
      isIframe,
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
  notice: {
    ...fr.typography[19].style,
    p: {
      fontWeight: "normal",
    },
    ".fr-notice__title": {
      marginLeft: `-${fr.spacing("2v")}`,
      paddingTop: "1px",
    },
  },
}));
