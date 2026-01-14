import { ReviewFiltersType } from '@/src/types/custom';
import { formatDateToFrenchString } from './tools';

export type ExportParams = Partial<{
	startDate: string;
	endDate: string;
	mustHaveVerbatims: boolean;
	search: string;
	button_id: number | string | null;
	filters: ReviewFiltersType;
}>;

export const parseExportParams = (rawParams?: string | null): ExportParams => {
	if (!rawParams) return {};

	try {
		const parsed = JSON.parse(rawParams);
		return parsed && typeof parsed === 'object' ? parsed : {};
	} catch (error) {
		return {};
	}
};

const formatDateIfPresent = (value?: string | null): string => {
	if (!value) return '';
	try {
		return formatDateToFrenchString(value);
	} catch (error) {
		return '';
	}
};

export const getExportPeriodLabel = (params: ExportParams): string => {
	const start = formatDateIfPresent(params.startDate);
	const end = formatDateIfPresent(params.endDate);

	if (start && end) return `${start} au ${end}`;
	if (start) return start;
	if (end) return end;

	return '';
};

export const getExportFiltersLabel = (params: ExportParams): string => {
	const labels: string[] = [];
	const { filters } = params;

	if (params.search) labels.push(`Recherche : ${params.search}`);
	if (filters?.needVerbatim) labels.push('Avec commentaires');
	if (params.button_id) labels.push(`Bouton ${params.button_id}`);
	if (filters?.buttonId?.length)
		labels.push(`Bouton ${filters.buttonId.join(', ')}`);
	if (filters?.satisfaction?.length)
		labels.push(`Satisfaction : ${filters.satisfaction.join(', ')}`);
	if (filters?.comprehension?.length)
		labels.push(`Compréhension : ${filters.comprehension.join(', ')}`);
	if (filters?.help?.length) labels.push(`Aide : ${filters.help.join(', ')}`);
	if (filters?.needOtherHelp) labels.push('Autre aide');
	if (filters?.needOtherDifficulties) labels.push('Autres difficultés');

	return labels.join(' · ');
};
