import { ExportWithPartialRelations } from '@/prisma/generated/zod';
import { FormWithElements } from '@/src/types/prismaTypesExtended';
import Button from '@codegouvfr/react-dsfr/Button';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { Button as ButtonModel } from '@prisma/client';
import ExportHistoryModal from './ExportHistoryModal';

interface Props {
	exports: ExportWithPartialRelations[];
	buttons: ButtonModel[];
	form: FormWithElements;
}

const export_modal = createModal({
	id: 'export-history-modal',
	isOpenedByDefault: false
});

const ExportHistory = (props: Props) => {
	const { exports, buttons, form } = props;

	return (
		<>
			<ExportHistoryModal
				modal={export_modal}
				exports={exports}
				buttons={buttons}
				form={form}
			/>

			<Button
				priority="secondary"
				type="button"
				nativeButtonProps={export_modal.buttonProps}
			>
				Voir l'historique des exports
			</Button>
		</>
	);
};

export default ExportHistory;
