import {
  CheckboxOption,
  Condition,
  FormField,
  Opinion
} from '@/src/utils/types';
import { Checkbox } from '@codegouvfr/react-dsfr/Checkbox';
import { RadioButtons } from '@codegouvfr/react-dsfr/RadioButtons';
import { Input } from '@codegouvfr/react-dsfr/Input';
import { useTranslation } from 'next-i18next';
import { ChangeEvent, SetStateAction, useEffect } from 'react';
import { SmileyInput } from './SmileyInput';
import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react/dsfr";
import { RadioInput } from './RadioInput';
import { CheckboxInput } from './CheckboxInput';

type Props = {
  field: FormField;
  opinion: Opinion;
  form: FormField[];
  setOpinion: (value: SetStateAction<Opinion>) => void;
};

type CheckboxOpinionKeys =
  | 'difficulties_details'
  | 'help_details'
  | 'contact_channels';

export const Field = (props: Props) => {
  const { field, opinion, setOpinion, form } = props;
  const { classes, cx } = useStyles({ nbItems: 5 });

  const { t } = useTranslation('common');

  const getChildrenResetObject = () => {
    const children = form.filter(
      f => f.conditions && f.conditions.map(c => c.name).includes(field.name)
    );

    let opinionPropsObj: {
      [key in keyof Opinion]?: any;
    } = {};

    children.forEach(cf => {
      opinionPropsObj[cf.name] = Array.isArray(opinion[cf.name])
        ? []
        : undefined;
    });

    return opinionPropsObj;
  };

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
        ...getChildrenResetObject()
      });
    } else {
      const isolatedSiblings = options
        .filter(opt => opt.isolated)
        .map(opt => opt.value);
      setOpinion({
        ...opinion,
        [key]: e.target.checked
          ? [
              ...opinion[key].filter(
                sibling => !isolatedSiblings.includes(sibling)
              ),
              parseInt(e.target.value),
            ]
          : opinion[key].filter((d) => d !== parseInt(e.target.value)),
        ...getChildrenResetObject(),
      });
    }
  };

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
    case 'smiley':
      return (
        <SmileyInput
          label={t(field.label)}
          hint={field.hint ? t(field.hint) : undefined}
          name={field.name}
          onChange={(value) => {
            setOpinion({ ...opinion, [field.name]: field.values[value] });
          }}
        />
      );
    case 'checkbox':
      return (
          <CheckboxInput field={field} opinion={opinion} form={form} setOpinion={setOpinion}></CheckboxInput>
      );
    case 'radio':
      return (
          <RadioInput field={field} opinion={opinion} form={form} setOpinion={setOpinion}></RadioInput>
      );
    case 'input-textarea':
      return (
        <Input
          hintText={field.hint ? t(field.hint) : undefined}
          label={t(field.label)}
          state="default"
          stateRelatedMessage="Text de validation / d'explication de l'erreur"
          nativeTextAreaProps={{
            value: opinion[field.name],
            onChange: e => {
              setOpinion({
                ...opinion,
                [field.name]: e.target.value
              });
            }
          }}
          textArea
        />
      );
    case 'input-text':
      return (
        <Input
          hintText={field.hint ? t(field.hint) : undefined}
          label={t(field.label)}
          state={(opinion[field.name] || '').length > 250 ? 'error' : 'default'}
          stateRelatedMessage="Maximum 250 caractères"
          nativeInputProps={{
            value: opinion[field.name] as string,
            maxLength: 250,
            onChange: e => {
              setOpinion({
                ...opinion,
                [field.name]: e.target.value
              });
            }
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
      color: fr.colors.decisions.text.disabled.grey.default
    },
    radioContainer: {
      display: 'flex',
      alignItems: 'center',
      marginTop: fr.spacing('4v'),
      ['input:checked + label']: {
        borderColor: fr.colors.decisions.background.flat.blueFrance.default
      },
      ['input:focus-visible + label']: {
        outlineOffset: '2px',
        outline: '2px solid #4D90FE'
      },
      [fr.breakpoints.down('md')]: {
        flexDirection: 'column',
      }
    },
    radioInput: {
      width: '100%',
      border: `1px solid ${fr.colors.decisions.background.alt.grey.hover}`,
      padding: fr.spacing('3v'),
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      img: {
        marginRight: fr.spacing('2v')
      },
      ['&:hover']: {
        borderColor: fr.colors.decisions.background.alt.grey.active
      },
      [fr.breakpoints.up('md')]: {
        flexDirection: 'column',
        width: '3.5rem',
        padding: fr.spacing('1v'),
        img: {
          marginTop: fr.spacing('2v'),
          marginRight: 0
        }
      }
    },
    fieldset: {
      width: '100%',
      marginLeft: fr.spacing('4v'),
      marginRight: fr.spacing('4v'),
      ul: {
        listStyle: 'none',
        ...fr.spacing('margin', { topBottom: 0, rightLeft: 0 }),
        paddingLeft: 0,
        width: '100%'
      },
      [fr.breakpoints.up('md')]: {
        width: 'initial',
        ul: {
          width: 'initial',
          columns: nbItems
        }
      }
    }
  }));
