import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react/dsfr";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Feeling } from "@/utils/types";
import { useTranslation } from "next-i18next";

type Props = {
  label: string;
  name: string;
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
    img: "/assets/smileys/bad.svg",
    imgSelected: "/assets/smileys/bad-selected.svg",
  },
  {
    value: "medium",
    img: "/assets/smileys/medium.svg",
    imgSelected: "/assets/smileys/medium-selected.svg",
  },
  {
    value: "good",
    img: "/assets/smileys/good.svg",
    imgSelected: "/assets/smileys/good-selected.svg",
  },
];

export const SmileyInput = (props: Props) => {
  const { classes, cx } = useStyles({ nbItems: smileys.length });
  const { label, name, hint, onChange } = props;
  const { t } = useTranslation();

  const [smileySelected, setSmileySelected] = useState<Feeling | undefined>(
    undefined
  );

  useEffect(() => {
    if (!!smileySelected) onChange(smileySelected);
  }, [smileySelected]);

  return (
    <div>
      <div className={cx(classes.smileysContainer)}>
        <fieldset className={cx(classes.fieldset, fr.cx("fr-fieldset"))}>
          <legend className={fr.cx("fr-fieldset__legend")}>
            {label}
            {hint && (
              <span className={fr.cx("fr-hint-text", "fr-mt-2v")}>{hint}</span>
            )}
          </legend>
          <ul>
            {smileys.map((smiley) => (
              <li key={smiley.value}>
                <input
                  id={`radio-${name}-${smiley.value}`}
                  className={fr.cx("fr-sr-only")}
                  type="radio"
                  name={name}
                  onClick={() => {
                    setSmileySelected(smiley.value);
                  }}
                />
                <label
                  htmlFor={`radio-${name}-${smiley.value}`}
                  className={cx(classes.smileyInput)}
                >
                  <Image
                    alt={t(`smileys.${smiley.value}`)}
                    src={
                      smileySelected === smiley.value
                        ? smiley.imgSelected
                        : smiley.img
                    }
                    width={38}
                    height={38}
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
        width: "8rem",
        padding: fr.spacing("1v"),
        img: {
          marginTop: fr.spacing("2v"),
          marginRight: 0,
        },
      },
    },
    fieldset: {
      width: "100%",
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
