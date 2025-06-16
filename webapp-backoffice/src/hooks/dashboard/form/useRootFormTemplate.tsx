import { trpc } from '@/src/utils/trpc';

export const useRootFormTemplate = () => {
	const { data, error, isLoading, refetch } =
		trpc.form.getFormTemplateBySlug.useQuery({ slug: 'root' });

	return {
		formTemplate: data?.data,
		error,
		isLoading,
		refetch
	};
};
