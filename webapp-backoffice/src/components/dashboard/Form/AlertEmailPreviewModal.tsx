import EmailPreviewModal from '@/src/components/ui/EmailPreviewModal';
import { CustomModalProps } from '@/src/types/custom';
import { trpc } from '@/src/utils/trpc';

interface Props {
	modal: CustomModalProps;
	isOpen: boolean;
	productTitle?: string;
	formTitle?: string;
}

const AlertEmailPreviewModal = ({
	modal,
	isOpen,
	productTitle,
	formTitle
}: Props) => {
	const previewQuery = trpc.formAlert.getAlertEmailPreview.useQuery(
		{ productTitle, formTitle },
		{
			enabled: isOpen,
			staleTime: Infinity
		}
	);

	return (
		<EmailPreviewModal
			modal={modal}
			isOpen={isOpen}
			title="Exemple d'un e-mail d'alerte"
			iframeTitle="Aperçu de l’e-mail d’alerte"
			html={previewQuery.data?.data.html}
			isLoading={previewQuery.isLoading}
		/>
	);
};

export default AlertEmailPreviewModal;
