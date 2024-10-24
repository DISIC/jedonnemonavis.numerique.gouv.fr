import { FormField, Opinion } from "@/src/utils/types";
import { useTranslation } from "next-i18next";
import { SetStateAction, useEffect } from "react";
import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react/dsfr";

type Props = {
  field: FormField;
  opinion: Opinion;
  form: FormField[];
  setOpinion: (value: SetStateAction<Opinion>) => void;
};

export const MarkInput = (props: Props) => {
  const { field, opinion, setOpinion, form } = props;
  const { classes, cx } = useStyles({ nbItems: 5 });

  const { t } = useTranslation("common");

  if (field.kind === "radio") {
    return (
      <div className={fr.cx("fr-grid-row")}>
        <div className={fr.cx("fr-col-12")}>
          <h3>{t(field.label)}</h3>
        </div>
        <div className={fr.cx("fr-col-12")}>
          <div className={cx(classes.radioContainer)}>
            <div>{t(field.hintLeft ?? "")}</div>
            <fieldset className={cx(classes.fieldset, fr.cx("fr-fieldset"))}>
              <legend>
                <p className={cx(classes.smallText)}>{t(field.hint ?? "")}</p>
              </legend>
              <ul>
                {field.options.map((f) => (
                  <li key={f.value}>
                    <input
                      id={`radio-${f.label}-${f.value}`}
                      className={fr.cx("fr-sr-only")}
                      type="radio"
                      name={f.value.toString()}
                      checked={opinion.comprehension === f.value}
                      onChange={() => {
                        setOpinion((prevOpinion) => ({
                          ...prevOpinion,
                          [field.name]: f.value,
                        }));
                      }}
                      onClick={() => {
                        setOpinion((prevOpinion) => ({
                          ...prevOpinion,
                          [field.name]: f.value,
                        }));
                      }}
                    />
                    <label
                      htmlFor={`radio-${f.label}-${f.value}`}
                      className={cx(classes.radioInput)}
                    >
                      {t(f.label)}
                    </label>
                  </li>
                ))}
              </ul>
            </fieldset>
            <div>{t(field.hintRight ?? "")}</div>
          </div>
        </div>
      </div>
    );
  }
};

const useStyles = tss
  .withName(MarkInput.name)
  .withParams<{ nbItems: number }>()
  .create(({ nbItems }) => ({
    smallText: {
      fontSize: "0.8rem",
      margin: "0 0 10px 0",
      color: fr.colors.decisions.text.disabled.grey.default,
    },
    radioContainer: {
      position: "relative",
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
      position: "initial",
      justifyContent: "center",
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
      legend: {
        position: "absolute",
        left: 0,
        bottom: "35px",
      },
    },
  }));
