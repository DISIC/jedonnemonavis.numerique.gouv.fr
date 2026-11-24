import { trpc } from '@/src/utils/trpc';

/**
 * Récupère un lien de téléchargement signé à la demande : l'URL pré-signée
 * n'est jamais exposée dans les réponses de listing.
 */
export const useExportDownload = () => {
	const getDownloadLink = trpc.export.getDownloadLink.useMutation();

	const downloadExport = async (id: number) => {
		const { data } = await getDownloadLink.mutateAsync({ id });
		window.location.href = data.link;
	};

	return { downloadExport, isDownloading: getDownloadLink.isLoading };
};
