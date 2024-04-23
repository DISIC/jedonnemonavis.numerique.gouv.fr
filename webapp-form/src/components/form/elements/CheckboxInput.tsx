import {
  CheckboxOption,
  Condition,
  FormField,
  Opinion,
} from "@/src/utils/types";
import { useTranslation } from "next-i18next";
import { ChangeEvent, SetStateAction, useEffect } from "react";
import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react/dsfr";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";

type Props = {
  field: FormField;
  opinion: Opinion;
  form: FormField[];
  setOpinion: (value: SetStateAction<Opinion>) => void;
};

export const CheckboxInput = (props: Props) => {
  const { field, opinion, setOpinion, form } = props;
  const { classes, cx } = useStyles({ nbItems: 5 });

  const { t } = useTranslation("common");

  const getChildrenResetObject = () => {
    const children = form.filter(
      (f) =>
        f.conditions && f.conditions.map((c) => c.name).includes(field.name)
    );

    let opinionPropsObj: {
      [key in keyof Opinion]?: any;
    } = {};

    children.forEach((cf) => {
      opinionPropsObj[cf.name] = Array.isArray(opinion[cf.name])
        ? []
        : undefined;
    });

    return opinionPropsObj;
  };

  type CheckboxOpinionKeys = "contact_tried";

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
        ...getChildrenResetObject(),
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
              parseInt(e.target.value),
            ]
          : opinion[key].filter((d) => d !== parseInt(e.target.value)),
        ...getChildrenResetObject(),
      });
    }
  };

  if (field.kind === "checkbox") {
    return (
      <div className={fr.cx("fr-grid-row")}>
        <div className={fr.cx("fr-col-12")}>
          <>
            <Checkbox
              legend={t(field.label)}
              hintText={t(field.hint ?? "")}
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
        </div>
      </div>
    );
  }
};

const useStyles = tss
  .withName(CheckboxInput.name)
  .withParams<{ nbItems: number }>()
  .create(({ nbItems }) => ({
    smallText: {
      fontSize: "0.8rem",
      color: fr.colors.decisions.text.disabled.grey.default,
    },
  }));
