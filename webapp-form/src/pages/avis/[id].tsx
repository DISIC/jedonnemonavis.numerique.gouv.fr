import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next/types";
import { tss } from "tss-react/dsfr";
import prisma from "../../utils/db";
import { fr } from "@codegouvfr/react-dsfr";
import { FormWithElements } from "@/src/utils/types";

type AvisPageProps = {
  form: FormWithElements;
  buttonId: number;
};

export default function AvisPage({ form, buttonId }: AvisPageProps) {
  const { classes, cx } = useStyles();

  return (
    <div
      className={cx(
        classes.container,
        fr.cx("fr-container--fluid", "fr-container"),
      )}
    >
      <h1>Avis Page</h1>
      <pre>Form ID: {JSON.stringify(form, null, 2)}</pre>
      <p>Button ID: {buttonId}</p>
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
      ...(await serverSideTranslations(locale ?? "fr", ["common"])),
    },
  };
};

const useStyles = tss.withName(AvisPage.name).create(() => ({
  container: {},
}));
