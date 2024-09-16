import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react/dsfr";
import { useRouter } from "next/router";
import { Block, BlockPartialWithRelations } from "@/prisma/generated/zod";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";

type Props = {
  block: BlockPartialWithRelations;
};

export const DisplayBlocks = (props: Props) => {
  const { block } = props;

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
        return <p key={block.id}>{block.content}</p>;
      }
      case "input_text": {
        return (
          <div key={block.id}>
            <Input label={block.content} />
          </div>
        );
      }
      case "input_text_area": {
        return (
          <div key={block.id}>
            <Input label={block.content} textArea />
          </div>
        );
      }
      case "select": {
        return (
          <div key={block.id}>
            <Select
              label={block.content}
              nativeSelectProps={{
                onChange: (e) => {
                  console.log(e);
                },
              }}
            >
              {block.options?.map((option) => {
                return (
                  <option key={option.id} value={option.value || ""}>
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
              options={(block.options ?? []).map((option) => {
                return {
                  label: option.content || "",
                  nativeInputProps: {
                    value: option.value || "",
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
              options={(block.options ?? []).map((option) => {
                return {
                  label: option.content || "",
                  nativeInputProps: {
                    value: option.value || "",
                  },
                };
              })}
            />
          </div>
        );
      }
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
    <div className={cx(fr.cx("fr-grid-row"), classes.blockContainer)}>
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
