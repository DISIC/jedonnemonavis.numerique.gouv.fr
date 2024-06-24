import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react/dsfr';
import React from 'react';
import Button from '@codegouvfr/react-dsfr/Button';
import { trpc } from '@/src/utils/trpc';
import { ReviewFiltersType } from '@/src/types/custom';
import { Download } from '@codegouvfr/react-dsfr/Download';
import { generateRandomString } from '@/src/utils/tools';
import ExportModal from './ExportModal';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { Tooltip } from '@mui/material';
import { useSession } from 'next-auth/react';
import { set } from 'zod';

interface Props {
	product_id: number;
	startDate: string;
	endDate: string;
	mustHaveVerbatims: boolean;
	search: string;
	button_id: number | undefined;
	filters: ReviewFiltersType;
	reviewsCountfiltered: number;
	reviewsCountAll: number;
}

const ExportReviews = (props: Props) => {
	const {
		product_id,
		startDate,
		endDate,
		mustHaveVerbatims,
		search,
		button_id,
		filters,
		reviewsCountfiltered,
		reviewsCountAll
	} = props;
	const { cx, classes } = useStyles();
	const { data: session } = useSession({ required: true });

	const export_modal = createModal({
		id: 'export-modal',
		isOpenedByDefault: false
	});

	const applyChoice = () => {
		export_modal.close();
	};

	const { data: exportCsv, isFetching: isLoadingExport, refetch } = trpc.export.getByUser.useQuery(
		{
			user_id: parseInt(session?.user?.id as string),
			status: ['idle', 'processing'],
			product_id: product_id
		}, 
		{
			initialData: {
				data: []
			}
		}
	);

	const exportCsvData = exportCsv?.data;

	return (
		<>
			<ExportModal
				modal={export_modal}
				counts={{
					countFiltered: reviewsCountfiltered,
					countAll: reviewsCountAll
				}}
				product_id={product_id}
				params={JSON.stringify({
					startDate,
					endDate,
					mustHaveVerbatims,
					search,
					button_id,
					filters
				})}
				hasExportsInProgress={exportCsvData?.length > 0}
				action={applyChoice}

			></ExportModal>


			<Button
				priority="tertiary"
				iconId="fr-icon-file-download-line"
				iconPosition="right"
				type="button"
				nativeButtonProps={export_modal.buttonProps}
			>
				Télécharger
			</Button>

		</>
	);
};

const useStyles = tss.withName(ExportReviews.name).create(() => ({
	progressBarWrapper: {
		width: '100%',
		minWidth: '150px',
		backgroundColor: fr.colors.decisions.border.default.grey.default
	},
	progressBar: {
		height: '12px',
		backgroundColor: fr.colors.decisions.text.default.info.default,
		textAlign: 'center',
		color: 'white'
	},
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
