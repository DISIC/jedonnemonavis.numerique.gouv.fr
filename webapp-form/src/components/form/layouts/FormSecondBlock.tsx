import { secondSection } from '@/src/utils/form';
import { FormField, Opinion } from '@/src/utils/types';
import { fr } from '@codegouvfr/react-dsfr';
import { Button } from '@codegouvfr/react-dsfr/Button';
import { useState } from 'react';
import { tss } from 'tss-react/dsfr';
import { Field } from '../elements/Field';
import { SmileyInput } from '../elements/SmileyInput';
import { useTranslation } from 'next-i18next';

type Props = {
  opinion: Opinion;
  onSubmit: (opinion: Opinion) => void;
};

export const FormSecondBlock = (props: Props) => {
  const { onSubmit, opinion } = props;
  const [tmpOpinion, setTmpOpinion] = useState<Opinion>(opinion);
  const { t } = useTranslation();

  const { classes, cx } = useStyles();

  return (
    <div>
      <h1 className={cx(classes.title, fr.cx('fr-mb-14v'))}>
        {t('second_block.title')}
        <br />
        {t('second_block.subtitle')}
      </h1>
      <form
        onSubmit={e => {
          e.preventDefault();
          onSubmit(tmpOpinion);
        }}
      >
        {secondSection.map((field: FormField) => (
          <div key={field.name} className={cx(classes.field)}>
            <Field
              field={field}
              opinion={tmpOpinion}
              setOpinion={setTmpOpinion}
            />
          </div>
        ))}
        <div className={fr.cx('fr-mt-8v')}>
          <Button type="submit">{t('second_block.validate')}</Button>
        </div>
      </form>
    </div>
  );
};

const useStyles = tss
  .withName(SmileyInput.name)
  .withParams()
  .create(() => ({
    title: {
      [fr.breakpoints.down('md')]: {
        display: 'none'
      }
    },
    field: {
      marginBottom: fr.spacing('14v')
    }
  }));
