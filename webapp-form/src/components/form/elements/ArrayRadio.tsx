import {
    CheckboxOption,
    Condition,
    FormField,
    Opinion,
    RadioOption
  } from '@/src/utils/types';
  import { useTranslation } from 'next-i18next';
  import { ChangeEvent, SetStateAction, useEffect, useState } from 'react';
  import { fr } from "@codegouvfr/react-dsfr";
  import { tss } from "tss-react/dsfr";
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { BaseOptions } from 'vm';
import RadioButtons from '@codegouvfr/react-dsfr/RadioButtons';
  
  type Props = {
    field: FormField;
    opinion: Opinion;
    form: FormField[];
    setOpinion: (value: SetStateAction<Opinion>) => void;
  };
  
  export const ArrayRadio = (props: Props) => {
    const { field, opinion, setOpinion, form } = props;
    const { classes, cx } = useStyles({ nbItems: 2 });
  
    const { t } = useTranslation('common');

    function getFirstTwoWords(str: string) {
      const words = str.split(/\s+/);  // Divise la chaîne par tout espace blanc
      const firstTwoWords = words.slice(0, 2);  // Prend les deux premiers mots
      return firstTwoWords.join(' ');  // Rejoint les deux mots avec un espace
    }

    let variablePrefix = "[id]";

    function escapeRegex(string: string) {
        return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }
    
    // Création de l'expression régulière avec un préfixe variable
    let pattern = new RegExp(escapeRegex(variablePrefix) + "_17");
    
    // Fonction pour vérifier la présence d'un élément avec le motif variable suivi de "_17"
    function containsPattern(array: string[], pattern: RegExp) {
        return array.some(element => pattern.test(element));
    }
  
    if(field.kind === "array-radio") {
        return (
          <>
            {containsPattern(opinion.contact_reached, new RegExp(escapeRegex(''.toString()) + "_17")) ?
              <>
                <div className={fr.cx('fr-grid-row')}>
                  <div className={fr.cx('fr-col-12')}>
                    <h6>{t(field.label)}</h6>
                  </div>
                  <div className={fr.cx('fr-col-2')}>
    
                  </div>
                  <div className={cx(classes.header, fr.cx('fr-col-2'))}>
                    {t(field.options[0].label)}
                  </div>
                  <div className={cx(classes.header, fr.cx('fr-col-2'))}>
                    {t(field.options[1].label)}
                  </div>
                  <div className={cx(classes.header, fr.cx('fr-col-2'))}>
                    {t(field.options[2].label)}
                  </div>
                  <div className={cx(classes.header, fr.cx('fr-col-2'))}>
                    {t(field.options[3].label)}
                  </div>
                  <div className={cx(classes.header, fr.cx('fr-col-2'))}>
                    {t(field.options[4].label)}
                  </div>
                </div>
                {'options' in form[0] && form[0].options && form[0].options.map((option: RadioOption) => (
                  <div className={cx(classes.containerRadio, fr.cx('fr-grid-row', 'fr-mb-4v'))} key={option.value}>
                    {(field.needed.includes(option.value) || opinion.contact_tried.includes(option.value) && !field.excluded.includes(option.value)) &&
                      <>
                        {containsPattern(opinion.contact_reached, new RegExp(escapeRegex(option.value.toString()) + "_17")) &&
                          <>
                            <div className={fr.cx('fr-col-2')}>
                              <label className={cx(classes.label)}>{getFirstTwoWords(t(option.label))}</label>
                            </div>
                            <div className={fr.cx('fr-col-10')}>
                              <form>
                              <RadioButtons
                                legend=""
                                name="radio"
                                options={[
                                  {
                                    label: '.',
                                    nativeInputProps: {
                                      value: 'value1'
                                    }
                                  },
                                  {
                                    label: '.',
                                    nativeInputProps: {
                                      value: 'value2'
                                    }
                                  },
                                  {
                                    label: '.',
                                    nativeInputProps: {
                                      value: 'value3'
                                    }
                                  },
                                  {
                                    label: '.',
                                    nativeInputProps: {
                                      value: 'value3'
                                    }
                                  },
                                  {
                                    label: '.',
                                    nativeInputProps: {
                                      value: 'value3'
                                    }
                                  }
                                ]}
                                orientation="horizontal"
                              />
                              </form>
                            </div>
                          </>
                        }
                      </>
                    }
                  </div>
                ))}
              </>
              :
              <></>
            }
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
        color: fr.colors.decisions.text.disabled.grey.default
      },
      label: {
        fontWeight: "bold",
      },
      header: {
        textAlign: 'center'
      },
      containerRadio: {
        alignItems: 'center',
        '.fr-fieldset__content': {
          justifyContent: 'space-around',
          '.fr-label': {
            color: 'transparent'
          }
        }
      },
    }));
  