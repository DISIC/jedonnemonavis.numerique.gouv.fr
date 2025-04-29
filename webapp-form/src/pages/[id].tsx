import { FormFirstBlock } from "@/src/components/form/layouts/FormFirstBlock";
import { FormField, Opinion, Product, RadioOption } from "@/src/utils/types";
import { fr } from "@codegouvfr/react-dsfr";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next/types";
import React, { useState } from "react";
import { tss } from "tss-react/dsfr";
import { trpc } from "../utils/trpc";
import { AnswerIntention, Button, Prisma } from "@prisma/client";
import { allFields, steps_A, steps_B } from "../utils/form";
import { FormStepper } from "../components/form/layouts/FormStepper";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { Loader } from "../components/global/Loader";
import prisma from "../utils/db";
import { v4 as uuidv4 } from "uuid";
import { push } from "@socialgouv/matomo-next";

type JDMAFormProps = {
  product: Product;
};

export type FormStepNames =
  | keyof Omit<
      Opinion,
      | "contact_tried"
      | "contact_reached"
      | "contact_satisfaction"
      | "contact_tried_verbatim"
    >
  | "contact";

export default function JDMAForm({ product }: JDMAFormProps) {
  const { t } = useTranslation("common");
  const router = useRouter();

  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRateLimitReached, setIsRateLimitReached] = useState<boolean>(false);
  const currentSteps =
    process.env.NEXT_PUBLIC_AB_TESTING === "A" ? steps_A : steps_B;

  const isInIframe = router.query.iframe === "true";

  const { classes, cx } = useStyles({ isInIframe });

  const resetForm = () => {
    setIsLoading(true);
    if (router.isReady) {
      const { step, ...queryWithoutStep } = router.query;
      localStorage.removeItem("userId");
      router.replace({
        pathname: router.pathname,
        query: { ...queryWithoutStep },
      });
      setIsLoading(false);
    }
  };

  const createReview = trpc.review.create.useMutation({
    onSuccess: () => {
      setIsRateLimitReached(false);
      setIsLoading(false);
    },
    onError: (error) => {
      if (error.data?.httpStatus === 429) {
        localStorage.removeItem("userId");
        setIsRateLimitReached(true);
      }
    },
  });

  const insertOrUpdateReview = trpc.review.insertOrUpdate.useMutation({
    onSuccess: () => setIsLoading(false),
    onError: (error) => {
      if (error.data?.httpStatus === 404) resetForm();
    },
  });

  const getSelectedOption = (
    field: FormField,
    value: number | string
  ): { label: string; intention: AnswerIntention; value: number } => {
    if (field.kind === "radio" || field.kind == "checkbox") {
      const selectedOption = field.options.find(
        (option) => option.value === value
      ) as RadioOption;

      return {
        label: t(selectedOption.label as string, {
          lng: "fr",
        }),
        value: selectedOption.value,
        intention: selectedOption.intention,
      };
    } else if (field.kind === "smiley") {
      const smileyIntention =
        value === field.values.bad
          ? "bad"
          : value === field.values.medium
            ? "medium"
            : "good";
      const smileyLabel = t(`smileys.${smileyIntention}`, { lng: "fr" });
      return {
        label: smileyLabel,
        intention: smileyIntention,
        value: value as number,
      };
    } else {
      return {
        label: "",
        intention: "good",
        value: 0,
      };
    }
  };

  const formatAnswers = (
    opinion: Partial<Opinion>
  ): Prisma.AnswerCreateInput[] => {
    return Object.entries(opinion).reduce((accumulator, [key, value]) => {
      if (["contact_reached", "contact_satisfaction"].includes(key)) {
        if (Array.isArray(value)) {
          value.map((ids) => {
            const [parent_id, child_id] = ids.toString().split("_");

            const parentFieldInSection = allFields.find(
              (field) => field.name === "contact_tried"
            ) as FormField;

            const childFieldInSection = allFields.find(
              (field) => field.name === key
            ) as FormField;

            if (
              "options" in parentFieldInSection &&
              "options" in childFieldInSection
            ) {
              const parentOption = parentFieldInSection.options.find(
                (o) => o.value === parseInt(parent_id)
              );
              const childOption = childFieldInSection.options.find(
                (o) => o.value === parseInt(child_id)
              );

              if (parentOption && childOption) {
                accumulator = accumulator.map((answer) => {
                  if (answer.answer_item_id === parentOption.value) {
                    const existingChildCreations =
                      answer.child_answers?.createMany?.data;
                    return {
                      ...answer,
                      child_answers: {
                        createMany: {
                          data: [
                            ...(Array.isArray(existingChildCreations)
                              ? existingChildCreations
                              : []),
                            {
                              field_code: childFieldInSection.name,
                              field_label: t(childFieldInSection.label, {
                                lng: "fr",
                              }) as string,
                              kind: "radio",
                              review_id: -1,
                              answer_text: t(childOption.label, {
                                lng: "fr",
                              }),
                              intention: childOption.intention,
                              answer_item_id: childOption.value,
                            },
                          ],
                        },
                      },
                    };
                  }
                  return answer;
                });
              }
            }
          });
        }
      } else {
        const fieldInSection = allFields.find(
          (field) => field.name === key
        ) as FormField;

        let tmpAnswer = {
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

        if (typeof value == "number") {
          const selectedOption = getSelectedOption(fieldInSection, value);
          tmpAnswer.answer_text = selectedOption.label;
          tmpAnswer.intention = selectedOption.intention;
          tmpAnswer.answer_item_id = selectedOption.value;
          accumulator.push(tmpAnswer);
        } else if (typeof value == "string") {
          tmpAnswer.answer_text = value;
          tmpAnswer.intention = "neutral";
          tmpAnswer.answer_item_id = 0;
          accumulator.push(tmpAnswer);
        } else if (Array.isArray(value)) {
          value.map((value) => {
            let selectedOption = getSelectedOption(fieldInSection, value);
            tmpAnswer.answer_text = selectedOption.label;
            tmpAnswer.intention = selectedOption.intention;
            tmpAnswer.answer_item_id = selectedOption.value;
            accumulator.push({ ...tmpAnswer });
          });
        }
      }

      return accumulator;
    }, [] as Prisma.AnswerCreateInput[]);
  };

  const handleCreateReview = async (opinion: Partial<Opinion>) => {
    if (!isInIframe) {
      const answers = formatAnswers(opinion);

      const userIdExists = localStorage.getItem("userId");

      if (!userIdExists) {
        const userId = uuidv4();

        localStorage.setItem("userId", userId);

        await createReview.mutateAsync({
          review: {
            product_id: product.id,
            button_id: product.buttons[0].id,
            form_id: 2,
            user_id: userId,
          },
          answers,
        });
      } else {
        await handleInsertOrUpdateReview(opinion, "satisfaction");
      }
    }

    router.push({
      pathname: router.pathname,
      query: { ...router.query, step: 0 },
    });
  };

  const handleInsertOrUpdateReview = async (
    opinion: Partial<Opinion>,
    currentStepName: FormStepNames
  ) => {
    const answers = formatAnswers(opinion);

    const userId = localStorage.getItem("userId");

    if (!userId) return;

    insertOrUpdateReview.mutate({
      user_id: userId,
      product_id: product.id,
      button_id:
        parseInt(router.query.button as string) || product.buttons[0].id,
      step_name: currentStepName,
      answers,
    });
  };

  React.useEffect(() => {
    const handleRouteChange = (url: string) => {
      const queryParams = new URLSearchParams(url.split("?")[1]);
      const step = parseInt(queryParams.get("step") as string) || 0;
      setCurrentStep(step);
      const isFirefox = navigator.userAgent.includes("Firefox");
      if (isFirefox) {
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };
    router.events.on("routeChangeStart", handleRouteChange);
    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [router.events]);

  React.useEffect(() => {
    resetForm();
  }, [router.isReady]);

  React.useEffect(() => {
    if (currentStep !== 0) {
      router.push(
        {
          pathname: router.pathname,
          query: { ...router.query, step: currentStep },
        },
        undefined,
        { shallow: true }
      );
    }
  }, [currentStep]);

  const [opinion, setOpinion] = useState<Opinion>({
    satisfaction: undefined,
    comprehension: undefined,
    contact_tried: [],
    contact_tried_verbatim: undefined,
    contact_reached: [],
    contact_satisfaction: [],
    verbatim: undefined,
  });

  const displayLayout = () => {
    if (isFormSubmitted) {
      // LAST SCREEN
      return (
        <div>
          <div className={cx(classes.titleSuccess)}>
            <Image
              alt=""
              src="/Demarches/assets/icon-check.svg"
              title="Icone - Merci pour votre aide"
              width={40}
              height={40}
            />
            <h1 className={fr.cx("fr-mb-0", "fr-ml-5v")}>
              {t("success_block.title")}
            </h1>
          </div>
          <p role="status" aria-live="polite">
            {t("success_block.thanks")}
          </p>
          {/* REMOVE UNTIL WE HAVE DATA FOR CONTACTS IN PRODUCTS
                <Highlight>
                  {t('success_block.question')}<b>{` ${product.title} ?`}</b>{' '}
                  <Link className={fr.cx('fr-link')} href={'mailto:experts@design.numerique.gouv.fr'}>{t('success_block.support')}</Link>
                </Highlight>
              */}
          <div className={cx(classes.furtherSection, fr.cx("fr-grid-row"))}>
            <div className={fr.cx("fr-col-12", "fr-mt-8v")}>
              <h2>{t("success_block.further")}</h2>
            </div>
            <div className={fr.cx("fr-col-md-8", "fr-mt-4v")}>
              <p>{t("success_block.share")}</p>
              <Link
                className={fr.cx("fr-link")}
                onClick={() => {
                  push([
                    "trackEvent",
                    "Form - Sucess",
                    "Click-Share-Service-Public",
                  ]);
                }}
                href={
                  "https://www.plus.transformation.gouv.fr/experience/step_1?pk_campaign=DINUM_v2"
                }
                target="_blank"
              >
                {t("success_block.link")}
              </Link>
            </div>
            <div
              className={cx(
                classes.logoContainer,
                fr.cx("fr-col-md-4", "fr-mt-4v")
              )}
            >
              <Image
                className={classes.logo}
                alt=""
                src="/Demarches/assets/services-plus.svg"
                title="Service public + logo"
                width={830}
                height={250}
              />
            </div>
          </div>
        </div>
      );
    } else {
      return !isLoading ? (
        <>
          {router.query.step ? (
            <FormStepper
              opinion={opinion}
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              steps={currentSteps}
              onSubmit={(result, isLastStep) => {
                setOpinion({ ...result });

                const currentStepAnswerNames = currentSteps[
                  currentStep
                ].section.map((field) => field.name);

                const currentStepValues = currentStepAnswerNames.reduce(
                  (acc, name) => {
                    acc[name] = result[name];
                    return acc;
                  },
                  {} as any
                );

                handleInsertOrUpdateReview(
                  currentStepValues,
                  currentStepAnswerNames[0].split("_")[0] as FormStepNames
                );

                if (isLastStep) {
                  localStorage.removeItem("userId");
                  setIsFormSubmitted(true);
                }
              }}
            />
          ) : (
            <FormFirstBlock
              opinion={opinion}
              product={product}
              isRateLimitReached={isRateLimitReached}
              setIsRateLimitReached={setIsRateLimitReached}
              onSubmit={(tmpOpinion) => {
                setOpinion({ ...tmpOpinion });
                handleCreateReview({ satisfaction: tmpOpinion.satisfaction });
              }}
            />
          )}
        </>
      ) : (
        <div className={fr.cx("fr-mt-10v")}>
          <Loader size="md" />
        </div>
      );
    }
  };

  return (
    <div>
      <div>
        <div className={classes.blueSection}>
          {!isFormSubmitted ? (
            opinion.satisfaction ? (
              <h1>{t(`${currentSteps[currentStep].name}`)}</h1>
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
            <div className={fr.cx("fr-col-12", "fr-col-lg-9")}>
              <div className={cx(classes.formSection)}>{displayLayout()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<{
  product: Product;
}> = async ({ params, query, locale, res }) => {
  if (!params?.id || isNaN(parseInt(params?.id as string))) {
    return {
      notFound: true,
    };
  }

  const productId = params.id as string;
  const buttonId = query.button as string;
  const xwikiButtonName = query.nd_source as string;

  const isXWikiLink = !buttonId;

  await prisma.$connect();
  const product = await prisma.product.findUnique({
    where: isXWikiLink
      ? {
          xwiki_id: parseInt(productId),
          buttons: {
            some: {},
          },
        }
      : {
          id: parseInt(productId),
          buttons: {
            some: {
              id: { equals: parseInt(buttonId) },
            },
          },
        },
    include: {
      buttons: isXWikiLink
        ? true
        : {
            where: {
              id: { equals: parseInt(buttonId) },
            },
          },
    },
  });
  await prisma.$disconnect();

  if (isXWikiLink) {
    if (!product?.buttons.length)
      return {
        notFound: true,
      };

    const sameName = product.buttons.find(
      (b) => b.xwiki_title === xwikiButtonName
    );
    const nameButton = product.buttons.find((b) => b.xwiki_title === "button");

    if (sameName) product.buttons = [sameName];
    else if (nameButton) product.buttons = [nameButton];
    else product.buttons = [product.buttons[0]];
  }

  if (product && product.status !== "archived") {
    return {
      props: {
        product: {
          ...product,
          created_at: product.created_at.toString(),
          updated_at: product.updated_at.toString(),
          buttons: product.buttons.map((button: Button) => ({
            ...button,
            created_at: button.created_at.toString(),
            updated_at: button.updated_at.toString(),
          })),
        },
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
  .withParams<{ isInIframe: boolean }>()
  .create(({ isInIframe }) => ({
    mainContainer: {
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
    titleSuccess: {
      display: "flex",
      justifyContent: "center",
      marginBottom: "2rem",
      alignItems: "center",
      [fr.breakpoints.down("md")]: {
        display: "none",
      },
    },
    furtherSection: {
      h2: {
        color: fr.colors.decisions.background.flat.blueFrance.default,
      },
    },
    logoContainer: {
      display: "flex",
      alignItems: "center",
    },
    logo: {
      maxHeight: fr.spacing("11v"),
      width: "100%",
    },
    formSection: {
      backgroundColor: fr.colors.decisions.background.default.grey.default,
      ...fr.spacing("padding", {
        topBottom: "auto",
        rightLeft: "6v",
      }),
      h1: {
        textAlign: "center",
        color: fr.colors.decisions.background.flat.blueFrance.default,
        ...fr.spacing("margin", { bottom: "8v" }),
      },
      [fr.breakpoints.up("md")]: {
        transform: `translateY(-${blueSectionPxHeight / 2}px)`,
        ...fr.spacing("padding", { topBottom: "8v", rightLeft: "16v" }),
      },
    },
  }));
