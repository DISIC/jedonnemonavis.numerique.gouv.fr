import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react/dsfr';
import React from 'react';
import Button from '@codegouvfr/react-dsfr/Button';
import { trpc } from '@/src/utils/trpc';
import { ReviewFiltersType } from '@/src/types/custom';
import { Loader } from '../../ui/Loader';
import { Download } from "@codegouvfr/react-dsfr/Download";

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
            setExportStatus('completed')
        }
    })

	return (
		<> 
            {exportStatus === 'idle' &&
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
            }
            {exportStatus === 'inProgress' &&
                <>
                    <Loader /> <p className={cx(classes.loading)}>Export en cours... Cela peut prendre quelques minutes.</p>
                </>
            }
            {exportStatus === 'completed' &&
                <>
                    <div className={cx(classes.download)}>
                        <Download
                            details="Le fichier CSV est prêt."
                            label="Télécharger le fichier"
                            linkProps={{
                                href: `/api/export?fileName=${exportData.data?.fileName}`,
                                target: '_blank'
                            }}
                            style={{ marginBottom: '0' }}
                        />
                    </div>
                </>
            }
		</>
	);
};

const useStyles = tss.withName(ExportReviews.name).create(() => ({
    loading: {
        marginBottom: '0',
        textDecoration: 'italic',
        display: 'flex',
        alignItems: 'center',
        fontSize: '0.75rem'
    },
    download: {
        display: 'flex',
        alignItems: 'center'
    }
}));

export default ExportReviews;