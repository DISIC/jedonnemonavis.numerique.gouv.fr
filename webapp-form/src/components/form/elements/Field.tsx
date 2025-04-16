import {
  CheckboxOption,
  Condition,
  Feeling,
  FormField,
  Opinion,
  Product,
} from "@/src/utils/types";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { useTranslation } from "next-i18next";
import { ChangeEvent, SetStateAction, useEffect } from "react";
import { SmileyInput } from "./SmileyInput";
import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react/dsfr";
import { MarkInput } from "./MarkInput";
import { CheckboxInput } from "./CheckboxInput";
import { YesNoInput } from "./YesNoInput";
import { ArrayRadio } from "./ArrayRadio";

type Props = {
  field: FormField;
  opinion: Opinion;
  form: FormField[];
  formConfig?: Product["form"]["form_configs"][0];
  formTemplateStep?: Product["form"]["form_template"]["form_template_steps"][0];
  setOpinion: (value: SetStateAction<Opinion>) => void;
};

export const Field = (props: Props) => {
  const { field, opinion, setOpinion, form, formConfig, formTemplateStep } =
    props;
  const { classes, cx } = useStyles({ nbItems: 5 });

  const { t } = useTranslation("common");

  const templateField = formTemplateStep?.form_template_blocks.find(
    (ftb) => ftb.label === t(field.label, { lng: "fr" })
  );

  console.log("template field : ", templateField);

  const displayConfig = formConfig?.form_config_displays.find(
    (fcd) => fcd.kind === "block" && fcd.parent_id === templateField?.id
  );
  const labelConfig = formConfig?.form_config_labels.find(
    (fcd) => fcd.kind === "block" && fcd.parent_id === templateField?.id
  );

  if (field.conditions) {
    const showField = field.conditions.some((condition) => {
      const currentCondition = opinion[condition.name] as number[] | number;

      // Si la valeur de la source de condition n'est pas encore définie
      if (
        !currentCondition ||
        (typeof currentCondition !== "number" && !currentCondition?.length)
      )
        return false;

      // Si le champ de la source de condition est un Array et qu'il contient l'une des valeurs cibles
      if (
        Array.isArray(currentCondition) &&
        currentCondition?.some((v) => condition?.values.includes(v))
      )
        return true;

      // Si le champ de la source de condition n'est pas un Array et que la valeur est égale à l'une des valeurs cibles
      if (
        !Array.isArray(currentCondition) &&
        condition.values.includes(currentCondition)
      )
        return true;

      return false;
    });

    if (!showField) return;
  }

  switch (field.kind) {
    case "smiley":
      return (
        <SmileyInput
          label={t(field.label)}
          hint={field.hint ? t(field.hint) : undefined}
          name={field.name}
          value={opinion[field.name] as number}
          onChange={(value) => {
            setOpinion({ ...opinion, [field.name]: field.values[value] });
          }}
        />
      );
    case "array-radio":
      return (
        <ArrayRadio
          field={field}
          opinion={opinion}
          form={form}
          setOpinion={setOpinion}
        ></ArrayRadio>
      );
    case "yes-no":
      return (
        <YesNoInput
          field={field}
          opinion={opinion}
          form={form}
          setOpinion={setOpinion}
        ></YesNoInput>
      );
    case "checkbox":
      return (
        <CheckboxInput
          field={field}
          opinion={opinion}
          form={form}
          formTemplateField={templateField}
          formConfig={formConfig}
          setOpinion={setOpinion}
        ></CheckboxInput>
      );
    case "radio":
      return (
        <MarkInput
          field={field}
          opinion={opinion}
          form={form}
          setOpinion={setOpinion}
        ></MarkInput>
      );
    case "input-textarea":
      return (
        <div className={classes.inputContainer}>
          <Input
            hintText={
              templateField?.upLabel ? (
                <p
                  dangerouslySetInnerHTML={{
                    __html: templateField.upLabel,
                  }}
                ></p>
              ) : undefined
            }
            label={<h3>{t(field.label)}</h3>}
            state={
              (opinion[field.name] || "").length > 15000 ? "error" : "default"
            }
            stateRelatedMessage="Maximum 15000 caractères"
            nativeTextAreaProps={{
              value: opinion[field.name]?.slice(0, 15000),
              onChange: (e) => {
                setOpinion({
                  ...opinion,
                  [field.name]: e.target.value.slice(0, 15000),
                });
              },
            }}
            textArea
          />
          {templateField?.downLabel && (
            <p className={cx(classes.infoText, fr.cx("fr-mt-0"))}>
              <span className={fr.cx("fr-icon-info-fill", "fr-mr-1v")} />{" "}
              {templateField.downLabel}
            </p>
          )}
          <div className={cx(classes.textCount, fr.cx("fr-hint-text"))}>
            {opinion[field.name]?.length || 0} / 15000
          </div>
        </div>
      );
    case "input-text":
      return (
        <Input
          hintText={field.hint ? t(field.hint) : undefined}
          label={<h3>{t(field.label)}</h3>}
          state={(opinion[field.name] || "").length > 250 ? "error" : "default"}
          stateRelatedMessage="Maximum 250 caractères"
          nativeInputProps={{
            value: opinion[field.name] as string,
            maxLength: 250,
            onChange: (e) => {
              setOpinion({
                ...opinion,
                [field.name]: e.target.value,
              });
            },
          }}
        />
      );
  }
};

const useStyles = tss
  .withName(Field.name)
  .withParams<{ nbItems: number }>()
  .create(({ nbItems }) => ({
    smallText: {
      fontSize: "0.8rem",
      color: fr.colors.decisions.text.disabled.grey.default,
    },
    radioContainer: {
      display: "flex",
      alignItems: "center",
      marginTop: fr.spacing("4v"),
      ["input:checked + label"]: {
        borderColor: fr.colors.decisions.background.flat.blueFrance.default,
      },
      ["input:focus-visible + label"]: {
        outlineOffset: "2px",
        outline: "2px solid #4D90FE",
      },
      [fr.breakpoints.down("md")]: {
        flexDirection: "column",
      },
    },
    radioInput: {
      width: "100%",
      border: `1px solid ${fr.colors.decisions.background.alt.grey.hover}`,
      padding: fr.spacing("3v"),
      display: "flex",
      alignItems: "center",
      cursor: "pointer",
      img: {
        marginRight: fr.spacing("2v"),
      },
      ["&:hover"]: {
        borderColor: fr.colors.decisions.background.alt.grey.active,
      },
      [fr.breakpoints.up("md")]: {
        flexDirection: "column",
        width: "3.5rem",
        padding: fr.spacing("1v"),
        img: {
          marginTop: fr.spacing("2v"),
          marginRight: 0,
        },
      },
    },
    fieldset: {
      width: "100%",
      marginLeft: fr.spacing("4v"),
      marginRight: fr.spacing("4v"),
      ul: {
        listStyle: "none",
        ...fr.spacing("margin", { topBottom: 0, rightLeft: 0 }),
        paddingLeft: 0,
        width: "100%",
      },
      [fr.breakpoints.up("md")]: {
        width: "initial",
        ul: {
          width: "initial",
          columns: nbItems,
        },
      },
    },
    inputContainer: {
      display: "flex",
      flexDirection: "column",
    },
    textCount: {
      alignSelf: "flex-end",
    },
    infoText: {
      color: fr.colors.decisions.text.default.info.default,
      fontSize: "0.8rem",
      ".fr-icon-info-fill::before": {
        "--icon-size": "1rem",
      },
    },
  }));
