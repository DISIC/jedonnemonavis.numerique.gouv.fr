import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react/dsfr';
import React from 'react';
import Button from '@codegouvfr/react-dsfr/Button';
import { trpc } from '@/src/utils/trpc';
import { ReviewFiltersType } from '@/src/types/custom';

interface Props {
    product_id: number,
    startDate: string,
    endDate: string,
    mustHaveVerbatims: boolean,
    search: string,
    button_id: number | undefined,
    filters: ReviewFiltersType
}

const ExportReviews = (props: Props) => {
	const { product_id, startDate, endDate, mustHaveVerbatims, search, button_id, filters } = props;
	const { cx, classes } = useStyles();
    const [exportStatus, setExportStatus] = React.useState<'idle' | 'inProgress' | 'completed'>('idle');

    const exportData = trpc.review.exportData.useMutation({
        onSuccess: result => {
            console.log('result : ', result)
        }
    })

	return (
		<> 
            <Button
                priority="tertiary"
                iconId="fr-icon-file-download-line"
                iconPosition="right"
                type="button"
                onClick={() => {
                    setExportStatus('inProgress')
                    exportData.mutate({
                        product_id,
                        startDate,
                        endDate,
                        shouldIncludeAnswers: true,
                        mustHaveVerbatims,
                        search,
                        button_id,
                        filters
                    })
                }}
            >
                Télécharger
            </Button>
		</>
	);
};

const useStyles = tss.withName(ExportReviews.name).create(() => ({
    class: {

    }
}));

export default ExportReviews;