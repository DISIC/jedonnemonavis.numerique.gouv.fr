import { CheckboxOption, FormField, Opinion } from "@/src/utils/types";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { useTranslation } from "next-i18next";
import { ChangeEvent, SetStateAction } from "react";
import { SmileyInput } from "./SmileyInput";

type Props = {
  field: FormField;
  opinion: Opinion;
  setOpinion: (value: SetStateAction<Opinion>) => void;
};

type CheckboxOpinionKeys =
  | "difficulties_details"
  | "help_details"
  | "contact_channels";

export const Field = (props: Props) => {
  const { field, opinion, setOpinion } = props;

  const { t } = useTranslation("common");

  const onChangeCheckbox = (
    key: CheckboxOpinionKeys,
    isolated: boolean,
    e: ChangeEvent<HTMLInputElement>,
    options: CheckboxOption[]
  ) => {
    if (isolated) {
      setOpinion({
        ...opinion,
        [key]: e.target.checked ? [e.target.value] : [],
        [`${key}_verbatim`]: !e.target.checked
          ? undefined
          : opinion[`${key}_verbatim`],
      });
    } else {
      const isolatedSiblings = options
        .filter((opt) => opt.isolated)
        .map((opt) => opt.value);
      setOpinion({
        ...opinion,
        [key]: e.target.checked
          ? [
              ...opinion[key].filter(
                (sibling) => !isolatedSiblings.includes(sibling)
              ),
              e.target.value,
            ]
          : opinion[key].filter((d) => d !== e.target.value),
        [`${key}_verbatim`]: !e.target.checked
          ? undefined
          : opinion[`${key}_verbatim`],
      });
    }
  };

  if (field.conditions) {
    const isOneConditionMatching = field.conditions.some((condition) => {
      // Si la valeur de la source de condition n'est pas encore définie
      if (!opinion[condition.name] || !opinion[condition.name]?.length)
        return true;

      // Si le champ de la source de condition est un Array et qu'il contient la valeur cible
      if (
        Array.isArray(opinion[condition.name]) &&
        !(opinion[condition.name] as string[])?.some(
          (v) => condition?.values.includes(v)
        )
      )
        return true;
      // Si le champ de la source de condition n'est pas un Array et que la valeur n'est pas égale
      else if (
        !Array.isArray(opinion[condition.name]) &&
        !condition.values.includes(opinion[condition.name] as string)
      )
        return true;

      return false;
    });

    if (isOneConditionMatching) return;
  }

  switch (field.kind) {
    case "smiley":
      return (
        <SmileyInput
          label={t(field.label)}
          hint={field.hint ? t(field.hint) : undefined}
          name={field.name}
          onChange={(value) => {
            setOpinion({ ...opinion, [field.name]: value });
          }}
        />
      );
    case "checkbox":
      return (
        <>
          <Checkbox
            legend={t(field.label)}
            options={field.options.map((opt, index) => ({
              label: t(opt.label),
              nativeInputProps: {
                name: opt.name || `${field.name}-${index}`,
                checked: opinion[field.name as CheckboxOpinionKeys]?.includes(
                  opt.value
                ),
                value: opt.value,
                onChange: (e) => {
                  onChangeCheckbox(
                    field.name as CheckboxOpinionKeys,
                    opt.isolated || false,
                    e,
                    field.options
                  );
                },
              },
            }))}
          />
        </>
      );
    case "radio":
      return (
        <>
          <RadioButtons
            legend={t(field.label)}
            options={field.options.map((opt, index) => ({
              label: t(opt.label),
              nativeInputProps: {
                checked: opinion[field.name] === opt.value,
                value: opt.value,
                onChange: (e) => {
                  setOpinion({
                    ...opinion,
                    [field.name]: e.target.value,
                  });
                },
              },
            }))}
          />
        </>
      );
    case "input-textarea":
      return (
        <Input
          hintText={field.hint ? t(field.hint) : undefined}
          label={t(field.label)}
          state="default"
          stateRelatedMessage="Text de validation / d'explication de l'erreur"
          nativeTextAreaProps={{
            value: opinion[field.name],
            onChange: (e) => {
              setOpinion({
                ...opinion,
                [field.name]: e.target.value,
              });
            },
          }}
          textArea
        />
      );
    case "input-text":
      return (
        <Input
          hintText={field.hint ? t(field.hint) : undefined}
          label={t(field.label)}
          state={(opinion[field.name] || "").length > 250 ? "error" : "default"}
          stateRelatedMessage="Maximum 250 caractères"
          nativeInputProps={{
            value: opinion[field.name],
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
