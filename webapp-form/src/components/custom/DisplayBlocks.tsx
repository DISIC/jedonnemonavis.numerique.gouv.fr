import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react/dsfr";
import { useRouter } from "next/router";
import { Block, BlockPartialWithRelations } from "@/prisma/generated/zod";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { ChangeEvent } from "react";
import { useFormContext } from "@/src/context/Formcontext";
import { applyLogicForm } from "@/src/utils/tools";

type Props = {
  block: BlockPartialWithRelations;
  logicBlocks: BlockPartialWithRelations[];
  onInput: (
    block_id: number,
    e: ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>
  ) => void;
};

export const DisplayBlocks = (props: Props) => {
  const { block, logicBlocks, onInput } = props;
  const { review, setReview } = useFormContext();

  const show = applyLogicForm(
    "show",
    block?.id ?? null,
    logicBlocks,
    review ?? {}
  );

  const disable = applyLogicForm(
    "disable",
    block?.id ?? null,
    logicBlocks,
    review ?? {}
  );

  const router = useRouter();

  const { classes, cx } = useStyles();

  const displayBlock = (block: BlockPartialWithRelations) => {
    switch (block.type_bloc) {
      case "heading_1": {
        return <h1 key={block.id}>{block.content}</h1>;
      }
      case "heading_2": {
        return <h2 key={block.id}>{block.content}</h2>;
      }
      case "heading_3": {
        return <h3 key={block.id}>{block.content}</h3>;
      }
      case "paragraph": {
        return (
          <p
            key={block.id}
            dangerouslySetInnerHTML={{
              __html: block.content?.replaceAll("\n", "<br />") || "",
            }}
          ></p>
        );
      }
      case "input_text": {
        return (
          <div key={block.id}>
            <Input
              label={block.content}
              disabled={disable}
              nativeInputProps={{
                onChange: (e) => {
                  onInput(block.id || 0, e);
                },
                value: review?.answers?.find((a) => a.block_id === block.id)
                  ?.content,
              }}
            />
          </div>
        );
      }
      case "input_text_area": {
        return (
          <div key={block.id}>
            <Input
              label={block.content}
              disabled={disable}
              textArea
              nativeTextAreaProps={{
                onChange: (e) => {
                  onInput(block.id || 0, e);
                },
                value: review?.answers?.find((a) => a.block_id === block.id)
                  ?.content,
              }}
            />
          </div>
        );
      }
      case "select": {
        return (
          <div key={block.id}>
            <Select
              label={block.content}
              disabled={disable}
              nativeSelectProps={{
                onChange: (e) => {
                  onInput(block.id || 0, e);
                },
                value: review?.answers?.find((a) => a.block_id === block.id)
                  ?.content,
              }}
            >
              <option disabled hidden value=""></option>;
              {block.options?.map((option) => {
                return (
                  <option key={option.id} value={option.content || ""}>
                    {option.content}
                  </option>
                );
              })}
            </Select>
          </div>
        );
      }
      case "radio": {
        return (
          <div key={block.id}>
            <RadioButtons
              legend={block.content}
              disabled={disable}
              options={(block.options ?? []).map((option) => {
                return {
                  label: option.content || "",
                  nativeInputProps: {
                    value: option.content || "",
                    onChange: (e) => {
                      onInput(block.id || 0, e);
                    },
                  },
                };
              })}
            />
          </div>
        );
      }
      case "checkbox": {
        return (
          <div key={block.id}>
            <Checkbox
              legend={block.content}
              disabled={disable}
              options={(block.options ?? []).map((option) => {
                return {
                  label: option.content || "",
                  nativeInputProps: {
                    value: option.content || "",
                    onChange: (e) => {
                      onInput(block.id || 0, e);
                    },
                  },
                };
              })}
            />
          </div>
        );
      }
      case "logic":
      case "new_page": {
        return <></>;
      }

      default: {
        return (
          <div key={block.id} className={fr.cx("fr-mb-6w")}>
            <p>Block type {block.type_bloc} not supported yet</p>
          </div>
        );
      }
    }
  };

  return (
    <div
      className={cx(
        fr.cx("fr-grid-row"),
        classes.blockContainer,
        show && classes.notShow
      )}
    >
      <div className={fr.cx("fr-col-12")}>{displayBlock(block)}</div>
    </div>
  );
};

const useStyles = tss
  .withName(DisplayBlocks.name)
  .withParams()
  .create(() => ({
    title: {
      [fr.breakpoints.down("md")]: {
        display: "none",
      },
    },
    notShow: {
      display: "none",
    },
    blockContainer: {
      paddingTop: "2rem",
      paddingBottom: "2rem",
      ".fr-fieldset__content": {
        marginTop: "1rem",
      },
      ".fr-fieldset .fr-checkbox-group:last-child": {
        paddingTop: "0",
      },
      ".fr-label": {
        fontWeight: "bold",
      },
    },
  }));
