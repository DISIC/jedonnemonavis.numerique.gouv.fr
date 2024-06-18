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
import { areArrayEquals } from "@/src/utils/tools";

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

  const getChildrenResetObject = (value?: number) => {
    let opinionPropsObj: {
      [key in keyof Opinion]?: any;
    } = {};

    const children = form.filter(
      (f) =>
        f.conditions && f.conditions.map((c) => c.name).includes(field.name)
    );

    children.forEach((c) => {
      const subChildren = form.filter(
        (f) => f.name !== c.name && areArrayEquals(f.needed, c.needed)
      );

      subChildren.forEach((sc) => {
        opinionPropsObj[sc.name] = Array.isArray(opinion[sc.name])
          ? value
            ? (opinion[sc.name] as any[]).filter(
                (field) => !field.startsWith(value + "_")
              )
            : []
          : undefined;
      });
    });

    children.forEach((cf) => {
      opinionPropsObj[cf.name] = Array.isArray(opinion[cf.name])
        ? value
          ? (opinion[cf.name] as any[]).filter(
              (field) => !field.startsWith(value + "_")
            )
          : []
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
    const value = parseInt(e.target.value);

    if (isolated) {
      setOpinion({
        ...opinion,
        [key]: e.target.checked ? [value] : [],
        ...getChildrenResetObject(),
      });
    } else {
      const isolatedSiblings = options
        .filter((option) => !option.isolated)
        .map((opt) => opt.value);

      if (e.target.checked) {
        setOpinion({
          ...opinion,
          [key]: [
            ...opinion[key].filter((sibling) =>
              isolatedSiblings.includes(sibling)
            ),
            value,
          ],
        });
      } else {
        setOpinion({
          ...opinion,
          [key]: opinion[key].filter((d) => d !== value),
          ...getChildrenResetObject(value),
        });
      }
    }
  };

  if (field.kind === "checkbox") {
    return (
      <div className={fr.cx("fr-grid-row")}>
        <div className={cx(fr.cx("fr-col-12"), classes.checkboxContainer)}>
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
    checkboxContainer: {
      ".fr-fieldset__content": {
        paddingTop: "1.5rem !important",
      },
    },
  }));
