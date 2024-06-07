import { FormField, Opinion, RadioOption } from "@/src/utils/types";
import { useTranslation } from "next-i18next";
import { SetStateAction } from "react";
import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react/dsfr";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";

type Props = {
  field: FormField;
  opinion: Opinion;
  form: FormField[];
  setOpinion: (value: SetStateAction<Opinion>) => void;
};

export const ArrayRadio = (props: Props) => {
  const { field, opinion, setOpinion, form } = props;
  const { classes, cx } = useStyles({ nbItems: 2 });

  const { t } = useTranslation("common");

  function getFirstTwoWords(str: string) {
    const words = str.split(/\s+/); // Divise la chaîne par tout espace blanc
    const firstTwoWords = words.slice(0, 2); // Prend les deux premiers mots
    return firstTwoWords.join(" "); // Rejoint les deux mots avec un espace
  }

  let variablePrefix = "[id]";

  function escapeRegex(string: string) {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  }

  // Création de l'expression régulière avec un préfixe variable
  let pattern = new RegExp(escapeRegex(variablePrefix) + "_17");

  // Fonction pour vérifier la présence d'un élément avec le motif variable suivi de "_17"
  function containsPattern(array: string[], pattern: RegExp) {
    return array.some((element) => pattern.test(element));
  }

  if (field.kind === "array-radio") {
    return (
      <>
        {containsPattern(
          opinion.contact_reached,
          new RegExp(escapeRegex("".toString()) + "_17")
        ) ? (
          <>
            <div className={cx(fr.cx("fr-col-12"), classes.reviewContainer)}>
              <div className={fr.cx("fr-col-12")}>
                <h6>{t(field.label)}</h6>
              </div>
              <table
                className={cx(fr.cx("fr-table"), classes.mainTable)}
                cellSpacing={1}
                cellPadding={1}
              >
                <thead className={cx(classes.bgWhite)}>
                  <tr>
                    <th />
                    {field.options.map((option) => (
                      <>
                        <th scope="col" className={cx(classes.headerLabels)}>
                          {t(option.label)}
                        </th>
                      </>
                    ))}
                  </tr>
                </thead>
                <tbody className={cx(classes.bgWhite)}>
                  {"options" in form[0] &&
                    form[0].options &&
                    form[0].options.map(
                      (option: RadioOption, index: number) => (
                        <tr
                          className={cx(classes.optionRow)}
                          key={option.value}
                        >
                          {(field.needed.includes(option.value) ||
                            (opinion.contact_tried.includes(option.value) &&
                              !field.excluded.includes(option.value))) && (
                            <>
                              {containsPattern(
                                opinion.contact_reached,
                                new RegExp(
                                  escapeRegex(option.value.toString()) + "_17"
                                )
                              ) && (
                                <>
                                  <td>
                                    <label className={cx(classes.label)}>
                                      {getFirstTwoWords(t(option.label))}
                                    </label>
                                  </td>
                                  <td
                                    className={cx(classes.radioWrapper)}
                                    colSpan={6}
                                  >
                                    <div className={cx(classes.containerRadio)}>
                                      <RadioButtons
                                        legend=""
                                        name={`radio-${index}`}
                                        options={field.options.map(
                                          (opt, index) => ({
                                            label: `${getFirstTwoWords(t(option.label))}, ${t(field.options[index].label)}`,
                                            nativeInputProps: {
                                              value: `value${index}`,
                                              checked:
                                                opinion.contact_satisfaction.includes(
                                                  escapeRegex(
                                                    option.value.toString()
                                                  ) +
                                                    "_" +
                                                    opt.value
                                                ),
                                              onChange: (event) => {
                                                setOpinion({
                                                  ...opinion,
                                                  contact_satisfaction: [
                                                    ...opinion.contact_satisfaction.filter(
                                                      (cs) =>
                                                        !cs.includes(
                                                          escapeRegex(
                                                            option.value.toString()
                                                          )
                                                        )
                                                    ),
                                                    escapeRegex(
                                                      option.value.toString()
                                                    ) +
                                                      "_" +
                                                      opt.value,
                                                  ],
                                                });
                                              },
                                            },
                                          })
                                        )}
                                        orientation="horizontal"
                                      />
                                    </div>
                                  </td>
                                </>
                              )}
                            </>
                          )}
                        </tr>
                      )
                    )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <></>
        )}
      </>
    );
  }
};

const useStyles = tss
  .withName(ArrayRadio.name)
  .withParams<{ nbItems: number }>()
  .create(({ nbItems }) => ({
    smallText: {
      fontSize: "0.8rem",
      color: fr.colors.decisions.text.disabled.grey.default,
    },

    bgWhite: {
      background: "white !important",
    },

    headerLabels: {
      fontWeight: "normal !important",
      ...fr.typography[17].style,
      "&:last-child": {
        paddingLeft: "3rem",
      },
    },
    label: {
      fontWeight: "bold",
      ...fr.typography[19].style,
    },
    radioWrapper: {
      padding: "0 !important",
    },
    containerRadio: {
      alignItems: "center",
      fieldset: {
        padding: 0,
      },
      ".fr-fieldset__content": {
        justifyContent: "space-between",
        margin: 0,
        ".fr-label": {
          color: "transparent",
          width: 0,
          height: 0,
          overflow: "hidden",
          paddingLeft: "1.5rem",
          paddingBottom: "2.3rem",
        },
      },
      ".fr-radio-group": {
        marginRight: "0 !important",
        width: "calc((100% - 10rem) / 5)",
        maxWidth: "initial !important",
        display: "flex",
        justifyContent: "center",
        alignContent: "center",
        "&:last-child": {
          width: "10rem",
        },
      },
      ".fr-radio-group:last-child": {
        paddingLeft: "2rem",
      },
    },
    reviewContainer: {
      overflow: "auto",
    },
    optionRow: {
      background: "white !important",
    },
    mainTable: {
      width: "100%",
      borderCollapse: "collapse",
      tableLayout: "fixed",
      "th, tr": {
        borderBottom: "1px solid lightgray",
      },
      th: {
        textAlign: "center",
        "&:last-child": {
          // paddingLeft: "3rem",
        },
      },
      "th:first-child, td:first-child": {
        width: "10rem",
      },
      "th:last-child, td:last-child": {
        width: "10rem",
      },
      "th:not(:first-child):not(:last-child)": {
        width: "calc((100% - 20rem) / 6)",
      },
    },
  }));
