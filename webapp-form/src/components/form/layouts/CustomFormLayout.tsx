import { FormField, Opinion, Step } from "@/src/utils/types";
import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { tss } from "tss-react/dsfr";
import { useRouter } from "next/router";
import { FormWithoutDates } from "@/src/pages/custom/[id]";
import React from "react";
import {
  BlockPartialWithRelations,
  BlockWithPartialRelations,
} from "@/prisma/generated/zod";
import { DisplayBlocks } from "../../custom/DisplayBlocks";
import { applyLogicForm } from "@/src/utils/tools";

type Props = {
  form: FormWithoutDates;
};

export const CustomFormLayout = (props: Props) => {
  const [currentStep, setCurrentStep] = React.useState<number>(0);
  const [formCompleted, setFormCompleted] = React.useState<boolean>(false);
  const { form } = props;

  const router = useRouter();

  const { classes, cx } = useStyles();

  const divideArray = (
    blocks: BlockPartialWithRelations[]
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
      [[]]
    );
  };

  const steps = divideArray(form.blocks);

  const renderActionRow = (currentStep: number) => {
    const newPageBlock = steps[currentStep].find(
      (block) => block.type_bloc === "new_page"
    );

    const logicPageButton =
      (form.blocks as BlockWithPartialRelations[]).find(
        (b) =>
          b.type_bloc === "logic" &&
          b.options?.some((o) => parseInt(o.content ?? "") === newPageBlock?.id)
      ) || null;

    if (logicPageButton)
      console.log(
        "found some logic for this button next page : ",
        logicPageButton
      );

    return (
      <div className={fr.cx("fr-grid-row", "fr-my-10v")}>
        <div className={fr.cx("fr-col-6")}></div>
        <div className={cx(fr.cx("fr-col-6"), classes.next)}>
          <Button
            priority="primary"
            iconId="fr-icon-arrow-right-fill"
            iconPosition="right"
            disabled={applyLogicForm(
              (form.blocks as BlockWithPartialRelations[]).find(
                (b) =>
                  b.id ===
                  parseInt(
                    logicPageButton?.options?.find((o) => o.label === "when")
                      ?.content || ""
                  )
              ) ?? null,
              (form.blocks as BlockWithPartialRelations[]).find(
                (b) =>
                  b.id ===
                  parseInt(
                    logicPageButton?.options?.find((o) => o.label === "then")
                      ?.content || ""
                  )
              ) ?? null,
              "disable"
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
                } else setFormCompleted(true);
                e.preventDefault();
              }}
            >
              {steps[currentStep]
                .filter((block) => block.type_bloc !== "new_page")
                .map((block) => (
                  <DisplayBlocks block={block}></DisplayBlocks>
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
