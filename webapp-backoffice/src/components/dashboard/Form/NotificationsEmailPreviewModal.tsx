import EmailPreviewModal from '@/src/components/ui/EmailPreviewModal';
import { CustomModalProps } from '@/src/types/custom';
import { trpc } from '@/src/utils/trpc';
import { NotificationFrequency } from '@prisma/client';

interface Props {
	modal: CustomModalProps;
	isOpen: boolean;
	frequency: NotificationFrequency;
	productTitle?: string;
	formTitle?: string;
}

const NotificationsEmailPreviewModal = ({
	modal,
	isOpen,
	frequency,
	productTitle,
	formTitle
}: Props) => {
	const previewQuery = trpc.user.getNotificationsEmailPreview.useQuery(
		{ frequency, productTitle, formTitle },
		{
			enabled: isOpen,
			staleTime: Infinity
		}
	);

	return (
		<EmailPreviewModal
			modal={modal}
			isOpen={isOpen}
			title="Exemple d'un e-mail de synthèse"
			iframeTitle="Aperçu de l’e-mail de synthèse"
			html={previewQuery.data?.data.html}
			isLoading={previewQuery.isLoading}
		/>
	);
};

export default NotificationsEmailPreviewModal;
