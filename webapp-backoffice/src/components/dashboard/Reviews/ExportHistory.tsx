import Button from '@codegouvfr/react-dsfr/Button';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import ExportHistoryModal from './ExportHistoryModal';
import { ExportWithPartialRelations } from '@/prisma/generated/zod';

interface Props {
	exports: ExportWithPartialRelations[];
}

const export_modal = createModal({
	id: 'export-history-modal',
	isOpenedByDefault: false
});

const ExportHistory = (props: Props) => {
	const { exports } = props;

	return (
		<>
			<ExportHistoryModal modal={export_modal} exports={exports} />

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
