import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react/dsfr";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Feeling } from "@/src/utils/types";
import { useTranslation } from "next-i18next";

type Props = {
  label: string;
  name: string;
  value?: number;
  hint?: string;
  onChange: (smileySelected: Feeling) => void;
};

type Smiley = {
  value: Feeling;
  img: string;
  imgSelected: string;
};

const smileys: Smiley[] = [
  {
    value: "bad",
    img: "/Demarches/assets/smileys/bad.svg",
    imgSelected: "/Demarches/assets/smileys/bad-selected.svg",
  },
  {
    value: "medium",
    img: "/Demarches/assets/smileys/medium.svg",
    imgSelected: "/Demarches/assets/smileys/medium-selected.svg",
  },
  {
    value: "good",
    img: "/Demarches/assets/smileys/good.svg",
    imgSelected: "/Demarches/assets/smileys/good-selected.svg",
  },
];

export const SmileyInput = (props: Props) => {
  const { classes, cx } = useStyles({ nbItems: smileys.length });
  const { label, name, hint, onChange, value } = props;
  const { t } = useTranslation();

  const [smileySelected, setSmileySelected] = useState<Feeling | undefined>(
    value ? smileys[value - 1].value : undefined,
  );

  useEffect(() => {
    if (!!smileySelected) onChange(smileySelected);
  }, [smileySelected]);

  return (
    <div>
      <div className={cx(classes.smileysContainer)}>
        <fieldset className={cx(classes.fieldset, fr.cx("fr-fieldset"))}>
          <legend className={fr.cx("fr-fieldset__legend")}>
            {<h3 className={fr.cx("fr-mb-2v")}>{label}</h3>}
            {hint && (
              <span className={fr.cx("fr-hint-text", "fr-my-4v")}>{hint}</span>
            )}
          </legend>
          <ul>
            {smileys.map((smiley) => (
              <li key={smiley.value}>
                <input
                  id={`radio-${name}-${smiley.value}`}
                  className={cx(classes.inputIndicator)}
                  type="radio"
                  name={name}
                  checked={smileySelected === smiley.value}
                  onChange={() => {
                    setSmileySelected(smiley.value);
                  }}
                />
                <label
                  htmlFor={`radio-${name}-${smiley.value}`}
                  className={cx(classes.smileyInput)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setSmileySelected(smiley.value);
                    }
                  }}
                >
                  <Image
                    alt={t(`smileys.${smiley.value}`)}
                    src={smiley.img}
                    width={56}
                    height={56}
                  />
                  {t(`smileys.${smiley.value}`)}
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
      </div>
    </div>
  );
};

const useStyles = tss
  .withName(SmileyInput.name)
  .withParams<{ nbItems: number }>()
  .create(({ nbItems }) => ({
    smileysContainer: {
      display: "flex",
      marginTop: fr.spacing("4v"),
      ["input:checked + label"]: {
        borderColor: fr.colors.decisions.background.flat.blueFrance.default,
      },
      ["input:focus-visible + label"]: {
        outlineOffset: "2px",
        outline: "2px solid #4D90FE",
      },
    },
    smileyInput: {
      width: "100%",
      border: `1px solid ${fr.colors.decisions.background.alt.grey.hover}`,
      padding: fr.spacing("4v"),
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      textAlign: "center",
      alignItems: "center",
      gap: fr.spacing("4v"),
      cursor: "pointer",
      ["&:hover"]: {
        borderColor: fr.colors.decisions.background.alt.grey.active,
      },
      [fr.breakpoints.up("md")]: {
        flexDirection: "column",
        padding: fr.spacing("4v"),
        paddingLeft: fr.spacing("16v"),
        paddingRight: fr.spacing("16v"),
        img: {
          marginRight: 0,
        },
      },
    },
    inputIndicator: {
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
      left: "5%",
      height: "1rem",
      width: "1rem",
      accentColor: fr.colors.decisions.background.flat.blueFrance.default,
    },
    fieldset: {
      width: "100%",
      ul: {
        listStyle: "none",
        ...fr.spacing("margin", { topBottom: 0, rightLeft: 0 }),
        paddingLeft: 0,
        width: "100%",
        li:{
          position: "relative",
          paddingBottom: 0,
          marginBottom: fr.spacing("4v"),
          ':last-child': {
            marginBottom: 0,
          },
        }
      },
      [fr.breakpoints.up("md")]: {
        ul: {
          columns: nbItems,
        },
      },
    },
  }));
