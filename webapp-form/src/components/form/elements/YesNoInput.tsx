import { FormField, Opinion, RadioOption } from "@/src/utils/types";
import { fr } from "@codegouvfr/react-dsfr";
import { useTranslation } from "next-i18next";
import { SetStateAction } from "react";
import { tss } from "tss-react/dsfr";

type Props = {
  field: FormField;
  opinion: Opinion;
  form: FormField[];
  setOpinion: (value: SetStateAction<Opinion>) => void;
};

export const YesNoInput = (props: Props) => {
  const { field, opinion, setOpinion, form } = props;
  const { classes, cx } = useStyles({ nbItems: 2 });

  const { t } = useTranslation("common");

  function containsSpecificVariableNumberPattern(
    array: string[],
    variable: string
  ) {
    let escapedVariable = variable.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");

    let pattern = new RegExp("^" + escapedVariable + "_\\d+$");

    return array.some((element) => pattern.test(element));
  }

  if (field.kind === "yes-no") {
    return (
      <div className={fr.cx("fr-grid-row")}>
        {opinion.contact_tried.some(
          (element) => "options" in form[0] && field.needed.includes(element)
        ) && (
          <div className={fr.cx("fr-col-12")}>
            <h6>{t(field.label)}</h6>
          </div>
        )}
        {"options" in form[0] &&
          form[0].options.map((option: RadioOption, index) => (
            <div className={fr.cx("fr-col-12")} key={option.value}>
              {opinion.contact_tried.includes(option.value) &&
                !field.excluded.includes(option.value) && (
                  <div>
                    <label className={cx(classes.label)}>
                      {t(option.label)}
                    </label>
                    <div className={cx(classes.radioContainer)}>
                      <fieldset
                        id={`fieldset-${option.label}-${index}`}
                        className={cx(classes.fieldset, fr.cx("fr-fieldset"))}
                      >
                        <ul>
                          {field.options.map((f, fIndex) => (
                            <li key={`${option.name}_${f.value}_${index}`}>
                              <input
                                id={`radio-${index}-${fIndex}-${f.label}-${option.label}-${f.value}`}
                                className={fr.cx("fr-sr-only")}
                                type="radio"
                                name={`${f.value.toString()}-${index}`}
                                checked={opinion.contact_reached.includes(
                                  `${option.value}_${f.value}`
                                )}
                                onChange={() => {
                                  setOpinion((currentOpinion) => {
                                    const key = `${option.value}_${f.value}`;
                                    let newContactReached;
                                    if (
                                      currentOpinion.contact_reached.includes(
                                        key
                                      )
                                    ) {
                                      newContactReached =
                                        currentOpinion.contact_reached.filter(
                                          (item) => item !== key
                                        );
                                    } else {
                                      if (
                                        containsSpecificVariableNumberPattern(
                                          currentOpinion.contact_reached,
                                          `${option.value}`
                                        )
                                      ) {
                                        newContactReached = [
                                          ...currentOpinion.contact_reached.filter(
                                            (item) =>
                                              !item.includes(`${option.value}_`)
                                          ),
                                          key,
                                        ];
                                      } else {
                                        newContactReached = [
                                          ...currentOpinion.contact_reached,
                                          key,
                                        ];
                                      }
                                    }
                                    return {
                                      ...currentOpinion,
                                      contact_reached: newContactReached,
                                    };
                                  });
                                }}
                              />
                              <label
                                htmlFor={`radio-${index}-${fIndex}-${f.label}-${option.label}-${f.value}`}
                                className={cx(classes.radioInput)}
                              >
                                {t(f.label)}
                              </label>
                            </li>
                          ))}
                        </ul>
                      </fieldset>
                    </div>
                  </div>
                )}
            </div>
          ))}
      </div>
    );
  }
};

const useStyles = tss
  .withName(YesNoInput.name)
  .withParams<{ nbItems: number }>()
  .create(({ nbItems }) => ({
    smallText: {
      fontSize: "0.8rem",
      color: fr.colors.decisions.text.disabled.grey.default,
    },
    label: {
      fontWeight: "bold",
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
      color: fr.colors.decisions.text.label.blueFrance.default,
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
      marginBottom: fr.spacing("4v"),
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
  }));
