import prisma from "@/src/utils/db";
import { GetServerSideProps } from "next/types";
import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react/dsfr";
import {
  Block,
  BlockPartialWithRelations,
  Form,
  OptionsBlock,
} from "@/prisma/generated/zod";
import Input from "@codegouvfr/react-dsfr/Input";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import Button from "@codegouvfr/react-dsfr/Button";

type FormWithoutDates =
  | (Omit<Form, "created_at" | "updated_at"> & {
      sections: {
        number_section: number;
        blocks: Omit<Block, "created_at" | "updated_at">[] &
          {
            options: Omit<OptionsBlock, "created_at" | "updated_at">[];
          }[];
      }[];
    })
  | undefined;

type JDMACustumFormProps = {
  form: FormWithoutDates;
};

export default function JDMACustomForm({ form }: JDMACustumFormProps) {
  const { classes, cx } = useStyles();

  const displayBlock = (block: BlockPartialWithRelations) => {
    switch (block.type_bloc) {
      case "heading_1": {
        return (
          <h1 key={block.id} className={cx(fr.cx("fr-mb-6w"))}>
            {block.content}
          </h1>
        );
      }
      case "heading_2": {
        return (
          <h2 key={block.id} className={fr.cx("fr-mb-6w")}>
            {block.content}
          </h2>
        );
      }
      case "heading_3": {
        return (
          <h3 key={block.id} className={fr.cx("fr-mb-6w")}>
            {block.content}
          </h3>
        );
      }
      case "paragraph": {
        return (
          <p key={block.id} className={fr.cx("fr-mb-6w")}>
            {block.content}
          </p>
        );
      }
      case "input_text": {
        return (
          <div key={block.id} className={fr.cx("fr-mb-6w")}>
            <Input label={block.content} />
          </div>
        );
      }
      case "input_text_area": {
        return (
          <div key={block.id} className={fr.cx("fr-mb-6w")}>
            <Input label={block.content} textArea />
          </div>
        );
      }
      case "select": {
        return (
          <div key={block.id} className={fr.cx("fr-mb-6w")}>
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
          <div key={block.id} className={fr.cx("fr-mb-3w")}>
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
          <div key={block.id} className={fr.cx("fr-mb-3w")}>
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
    <div className={fr.cx("fr-container")}>
      <form className={cx(classes.formContainer)}>
        <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
          {form.blocks?.map((block) => (
            <div className={fr.cx("fr-col-12")}>{displayBlock(block)}</div>
          ))}
        </div>
        <Button onClick={() => {}} priority="primary" type="button">
          Envoyer
        </Button>
      </form>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<{
  form: FormWithoutDates;
}> = async ({ params }) => {
  if (!params?.id || isNaN(parseInt(params.id as string))) {
    return { notFound: true };
  }

  await prisma.$connect();

  const form = await prisma.form.findUnique({
    where: { id: parseInt(params.id as string) },
    include: {
      blocks: {
        orderBy: { position: "asc" },
        include: {
          options: { orderBy: { created_at: "asc" } },
        },
      },
    },
  });

  const divideArray = (
    blocks: BlockPartialWithRelations[]
  ): BlockPartialWithRelations[][] => {
    return blocks.reduce<BlockPartialWithRelations[][]>(
      (acc, block) => {
        if (block.type_bloc === "new_page") {
          acc[acc.length - 1].push(block);
          acc.push([]);
        } else {
          acc[acc.length - 1].push(block);
        }
        return acc;
      },
      [[]]
    );
  };

  if (form) {
    return {
      props: {
        form: {
          ...form,
          created_at: form.created_at?.toISOString(),
          updated_at: form.updated_at?.toISOString(),
          sections: divideArray(form.blocks).map((section, index) => {
            return {
              number_section: index,
              blocks: section.map((block) => ({
                ...block,
                created_at: block.created_at?.toISOString(),
                updated_at: block.updated_at?.toISOString(),
                options:
                  block.options?.map((option) => ({
                    ...option,
                    created_at: option.created_at?.toISOString(),
                    updated_at: option.updated_at?.toISOString(),
                  })) ?? [],
              })),
            };
          }),
        },
      },
    };
  }

  return { notFound: true };
};

const useStyles = tss
  .withName(JDMACustomForm.name)
  .withParams()
  .create(() => ({
    mainContainer: {
      overflow: "inherit",
    },
    formContainer: {
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
