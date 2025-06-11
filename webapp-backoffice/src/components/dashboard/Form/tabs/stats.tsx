import { FormWithElements } from '@/src/types/prismaTypesExtended';
import { fr } from '@codegouvfr/react-dsfr';
import React, { useState } from 'react';
import { getServerSideProps } from '@/src/pages/administration/dashboard/product/[id]/forms/[form_id]';
import { tss } from 'tss-react/dsfr';
import { useDebounce } from 'usehooks-ts';

interface Props {
  form: FormWithElements;
	defaultStartDate: string;
	defaultEndDate: string;
}

const nbMaxReviews = 500000;

const StatsTab = ({form, defaultStartDate, defaultEndDate}: Props) => {
	const { classes, cx } = useStyles();

  const [tmpStartDate, setTmpStartDate] = useState<string>(defaultStartDate);
  const [tmpEndDate, setTmpEndDate] = useState<string>(defaultEndDate);

  const [startDate, setStartDate] = useState<string>(defaultStartDate);
  const [endDate, setEndDate] = useState<string>(defaultEndDate);

  const debouncedStartDate = useDebounce<string>(startDate, 200);
  const debouncedEndDate = useDebounce<string>(endDate, 200);

  const [buttonId, setButtonId] = useState<number | undefined>(undefined);

  return (
    <div>
      
    </div>
  );
};

const useStyles = tss.create({
  applyContainer: {
    paddingTop: fr.spacing('8v')
  }
});

export default StatsTab;
export { getServerSideProps };
