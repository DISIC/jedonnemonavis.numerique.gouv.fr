import Button from '@codegouvfr/react-dsfr/Button';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import ExportHistoryModal from './ExportHistoryModal';

interface Props {
	product_id?: number;
	form_id?: number;
}

const ExportHistory = (props: Props) => {
	const { product_id, form_id } = props;

	const export_modal = createModal({
		id: 'export-history-modal',
		isOpenedByDefault: false
	});

	return (
		<>
			<ExportHistoryModal
				modal={export_modal}
				product_id={product_id!}
				form_id={form_id!}
			/>

			<Button
				priority="tertiary"
				type="button"
				nativeButtonProps={export_modal.buttonProps}
			>
				Voir l'historique des exports
			</Button>
		</>
	);
};

export default ExportHistory;
