import { FormWithElements } from '@/src/types/prismaTypesExtended';
import type { RouterOutputs } from '@/src/utils/trpc';
import Button from '@codegouvfr/react-dsfr/Button';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { Button as ButtonModel } from '@prisma/client';
import ExportHistoryModal from './ExportHistoryModal';

interface Props {
	exports: RouterOutputs['export']['getList']['data'];
	buttons: ButtonModel[];
	form: FormWithElements;
	isDisabled?: boolean;
}

const export_modal = createModal({
	id: 'export-history-modal',
	isOpenedByDefault: false
});

const ExportHistory = (props: Props) => {
	const { exports, buttons, form, isDisabled } = props;

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
				disabled={isDisabled}
				nativeButtonProps={export_modal.buttonProps}
			>
				Voir l'historique des exports
			</Button>
		</>
	);
};

export default ExportHistory;
