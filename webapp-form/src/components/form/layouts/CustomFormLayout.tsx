import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { tss } from "tss-react/dsfr";
import { useRouter } from "next/router";
import { FormWithoutDates } from "@/src/pages/custom/[id]";
import React, { ChangeEvent } from "react";
import {
  BlockPartialWithRelations,
  ReviewCustomWithPartialRelations,
  ReviewCustomWithRelations,
  ReviewWithPartialRelations,
} from "@/prisma/generated/zod";
import { DisplayBlocks } from "../../custom/DisplayBlocks";
import { applyLogicForm } from "@/src/utils/tools";
import { useFormContext } from "@/src/context/Formcontext";
import { trpc } from "@/src/utils/trpc";

type Props = {
  form: FormWithoutDates;
};

export const CustomFormLayout = (props: Props) => {
  const [currentStep, setCurrentStep] = React.useState<number>(0);
  const [formCompleted, setFormCompleted] = React.useState<boolean>(false);
  const { form } = props;
  const { review, setReview } = useFormContext();

  const router = useRouter();

  const { classes, cx } = useStyles();

  const divideArray = (
    blocks: BlockPartialWithRelations[],
  ): BlockPartialWithRelations[][] => {
    return blocks.reduce<BlockPartialWithRelations[][]>(
      (acc, objet) => {
        if (objet.type_bloc === "new_page") {
          acc[acc.length - 1].push(objet);
          acc.push([]);
        } else {
          acc[acc.length - 1].push(objet);
        }
        return acc;
      },
      [[]],
    );
  };

  const steps = divideArray(form.blocks);

  const logicBlocks = form.blocks.filter((b) => b.type_bloc === "logic");

  const handleChange = (
    block_id: number,
    e: ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const updatedAnswerCustom = review?.answers?.map((answer) =>
      answer.block_id === block_id
        ? { ...answer, content: e.target.value }
        : answer,
    );
    setReview((prev) => {
      if (prev) {
        return {
          ...prev,
          answers: updatedAnswerCustom,
        };
      } else {
        return prev;
      }
    });
  };

  const createBlock = trpc.reviewCustom.create.useMutation({
    onSuccess: () => {
      console.log("ok");
    },
  });

  const handleSaveReview = async (
    tmpReview: ReviewCustomWithPartialRelations,
  ) => {
    try {
      const { form_id, created_at, updated_at } = tmpReview;
      const reviewSaved = await createBlock.mutateAsync({
        reviewPayload: { form_id, created_at, updated_at },
        answersPayload:
          tmpReview.answers?.map((a) => {
            return {
              review_id: 0,
              block_id: a.block_id || 0,
              created_at: a.created_at || new Date(),
              updated_at: a.updated_at || new Date(),
              content: a.content || "",
            };
          }) ?? [],
      });
    } catch (e) {
      console.error(e);
    }
  };

  const renderActionRow = (currentStep: number) => {
    const newPageBlock = steps[currentStep].find(
      (block) => block.type_bloc === "new_page",
    );

    return (
      <div
        className={fr.cx(
          "fr-grid-row",
          "fr-my-10v",
          applyLogicForm(
            "show",
            newPageBlock?.id ?? null,
            logicBlocks,
            review ?? {},
          ) && "fr-hidden",
        )}
      >
        <div className={fr.cx("fr-col-6")}></div>
        <div className={cx(fr.cx("fr-col-6"), classes.next)}>
          <Button
            priority="primary"
            iconId="fr-icon-arrow-right-fill"
            iconPosition="right"
            disabled={applyLogicForm(
              "disable",
              newPageBlock?.id ?? null,
              logicBlocks,
              review ?? {},
            )}
          >
            {newPageBlock ? newPageBlock.content : "Envoyer"}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div>
      {formCompleted ? (
        <div className={fr.cx("fr-grid-row")}>
          <div className={fr.cx("fr-col-12", "fr-my-30v", "fr-py-30v")}>
            <h1>Merci ! </h1>
            <p>Message de fin ...</p>
          </div>
        </div>
      ) : (
        <div className={fr.cx("fr-grid-row")}>
          <div className={fr.cx("fr-col-12")}>
            {currentStep > 0 && (
              <Button
                priority="tertiary"
                size="small"
                iconId="fr-icon-arrow-left-fill"
                iconPosition="left"
                className={fr.cx("fr-mt-10v")}
                nativeButtonProps={{
                  onClick: () => {
                    setCurrentStep(currentStep - 1);
                  },
                }}
              >
                retour
              </Button>
            )}
          </div>
          <div className={fr.cx("fr-col-12")}>
            <form
              onSubmit={(e) => {
                const isLastStep = currentStep + 1 === steps.length;
                if (!isLastStep) {
                  setCurrentStep(currentStep + 1);
                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
                } else {
                  review && handleSaveReview(review);
                  setFormCompleted(true);
                }
                e.preventDefault();
              }}
            >
              {steps[currentStep]
                .filter(
                  (block) =>
                    block.type_bloc !== "new_page" &&
                    block.type_bloc !== "logic",
                )
                .map((block) => (
                  <div key={block.id}>
                    <DisplayBlocks
                      block={block}
                      logicBlocks={logicBlocks}
                      onInput={handleChange}
                    ></DisplayBlocks>
                  </div>
                ))}
              <>{renderActionRow(currentStep)}</>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const useStyles = tss
  .withName(CustomFormLayout.name)
  .withParams()
  .create(() => ({
    next: {
      display: "flex",
      justifyContent: "flex-end",
    },
  }));
