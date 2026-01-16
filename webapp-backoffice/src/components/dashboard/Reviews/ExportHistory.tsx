import Button from '@codegouvfr/react-dsfr/Button';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import ExportHistoryModal from './ExportHistoryModal';
import { ExportWithPartialRelations } from '@/prisma/generated/zod';
import { Button as ButtonModel } from '@prisma/client';

interface Props {
	exports: ExportWithPartialRelations[];
	buttons: ButtonModel[];
}

const export_modal = createModal({
	id: 'export-history-modal',
	isOpenedByDefault: false
});

const ExportHistory = (props: Props) => {
	const { exports, buttons } = props;

	return (
		<>
			<ExportHistoryModal
				modal={export_modal}
				exports={exports}
				buttons={buttons}
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
