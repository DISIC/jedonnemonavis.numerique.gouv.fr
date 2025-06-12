import { ReviewFiltersType } from '@/src/types/custom';
import Button from '@codegouvfr/react-dsfr/Button';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import ExportModal from './ExportModal';

interface Props {
	product_id?: number;
	form_id?: number;
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
		form_id,
		startDate,
		endDate,
		mustHaveVerbatims,
		search,
		button_id,
		filters,
		reviewsCountfiltered,
		reviewsCountAll
	} = props;

	const export_modal = createModal({
		id: 'export-modal',
		isOpenedByDefault: false
	});

	return (
		<>
			<ExportModal
				modal={export_modal}
				counts={{
					countFiltered: reviewsCountfiltered,
					countAll: reviewsCountAll
				}}
				product_id={product_id!}
				params={JSON.stringify({
					startDate,
					endDate,
					mustHaveVerbatims,
					search,
					button_id,
					filters
				})}
			></ExportModal>

			<Button
				priority="tertiary"
				iconId="fr-icon-file-download-line"
				iconPosition="right"
				type="button"
				nativeButtonProps={export_modal.buttonProps}
			>
				Télécharger les données
			</Button>
		</>
	);
};

export default ExportReviews;
