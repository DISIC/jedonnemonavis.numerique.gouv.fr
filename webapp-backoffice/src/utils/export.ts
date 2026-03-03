import { ReviewFiltersType } from '@/src/types/custom';
import { formatDateToFrenchString } from './tools';
import { displayIntention } from './stats';
import { Button } from '@prisma/client';

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

	return 'Depuis le début';
};

export function getExportFiltersLabel(
	params: ExportParams,
	asArray?: boolean,
	buttons?: Button[]
): string | string[] {
	const labels: string[] = [];
	const { filters } = params;

	const addLabel = (condition: boolean, label: string) => {
		if (condition) labels.push(label);
	};

	addLabel(!!params.search, `Recherche : ${params.search}`);
	addLabel(!!filters?.needVerbatim, 'Avec commentaires');
	addLabel(!!params.button_id, `Bouton ${params.button_id}`);

	if (filters?.buttonId?.length) {
		const sources = filters.buttonId
			.map(b => buttons?.find(button => button.id === parseInt(b))?.title || b)
			.join(', ');
		addLabel(true, `Source :  ${sources}`);
	}

	if (filters?.fields?.length) {
		filters.fields.forEach(field => {
			if (field.values?.length) {
				const fieldLabel =
					field.field_code.charAt(0).toUpperCase() + field.field_code.slice(1);
				const values = field.values.join(', ');
				addLabel(true, `${fieldLabel} : ${values}`);
			}
		});
	}

	addLabel(!!filters?.needOtherHelp, 'Autre aide');
	addLabel(!!filters?.needOtherDifficulties, 'Autres difficultés');

	return asArray ? labels : labels.join('; ');
}
