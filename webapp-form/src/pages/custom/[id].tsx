import prisma from "@/src/utils/db";
import { GetServerSideProps } from "next/types";
import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react/dsfr";
import { Block, Form, OptionsBlock } from "@/prisma/generated/zod";
import { CustomFormLayout } from "@/src/components/form/layouts/CustomFormLayout";

export type FormWithoutDates = Omit<Form, "created_at" | "updated_at"> & {
  blocks: Omit<Block, "created_at" | "updated_at">[] &
    {
      options: Omit<OptionsBlock, "created_at" | "updated_at">[];
    }[];
};

type JDMACustumFormProps = {
  form: FormWithoutDates;
};

export default function JDMACustomForm({ form }: JDMACustumFormProps) {
  const { classes, cx } = useStyles();

  return (
    <div className={cx(fr.cx("fr-container"), classes.customFormContainer)}>
      <CustomFormLayout form={form}></CustomFormLayout>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<{
  form: FormWithoutDates;
}> = async ({ params, query, locale, res }) => {
  if (!params?.id || isNaN(parseInt(params?.id as string))) {
    return {
      notFound: true,
    };
  }

  await prisma.$connect();

  const form = await prisma.form.findUnique({
    where: {
      id: parseInt(params.id as string),
    },
    include: {
      blocks: {
        orderBy: {
          position: "asc",
        },
        include: {
          options: {
            orderBy: {
              created_at: "asc",
            },
          },
        },
      },
    },
  });

  if (form) {
    return {
      props: {
        form: {
          ...form,
          created_at: form.created_at.toISOString(),
          updated_at: form.updated_at.toISOString(),
          blocks: form.blocks.map((block) => {
            return {
              ...block,
              created_at: block.created_at.toISOString(),
              updated_at: block.created_at.toISOString(),
              options: block.options.map((option) => {
                return {
                  ...option,
                  created_at: option.created_at.toISOString(),
                  updated_at: option.created_at.toISOString(),
                };
              }),
            };
          }),
        },
      },
    };
  } else {
    return {
      notFound: true,
    };
  }
};

const useStyles = tss
  .withName(JDMACustomForm.name)
  .withParams()
  .create(() => ({
    customFormContainer: {},
  }));
