import { ReviewFiltersType } from '@/src/types/custom';
import { FormWithElements } from '@/src/types/prismaTypesExtended';
import { Button } from '@prisma/client';
import { capitalizeFirstLetter, formatDateToFrenchString } from './tools';

export const EXPORT_LINK_TTL_SECONDS = 604800;

type FilterableBlock =
	FormWithElements['form_template']['form_template_steps'][number]['form_template_blocks'][number];

const FILTERABLE_BLOCK_TYPES = [
	'mark_input',
	'smiley_input',
	'select',
	'radio',
	'checkbox'
];

export const getFilterableBlocks = (
	form: FormWithElements
): FilterableBlock[] =>
	form.form_template.form_template_steps
		.flatMap(step => step.form_template_blocks)
		.filter(block => FILTERABLE_BLOCK_TYPES.includes(block.type_bloc));

const getFilterFieldName = (
	fieldCode: string,
	filterableBlocks: FilterableBlock[]
): string => {
	if (fieldCode === 'buttonId') return 'Source';
	const block = filterableBlocks.find(b => b.field_code === fieldCode);
	return block?.alias || block?.label || fieldCode;
};

const getFilterValueLabel = (
	fieldCode: string,
	value: string,
	filterableBlocks: FilterableBlock[],
	buttons?: Button[]
): string => {
	if (fieldCode === 'buttonId') {
		return buttons?.find(b => b.id === parseInt(value))?.title || value;
	}
	const block = filterableBlocks.find(b => b.field_code === fieldCode);
	return capitalizeFirstLetter(
		block?.options?.find(o => o.value === value)?.alias || value
	);
};

export const renderFilterFieldLabel = (
	fieldCode: string,
	value: string,
	filterableBlocks: FilterableBlock[],
	buttons?: Button[]
): string => {
	const block = filterableBlocks.find(b => b.field_code === fieldCode);
	if (!block && fieldCode !== 'buttonId') return value;

	return `${getFilterFieldName(
		fieldCode,
		filterableBlocks
	)} : ${getFilterValueLabel(fieldCode, value, filterableBlocks, buttons)}`;
};

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
	buttons?: Button[],
	filterableBlocks: FilterableBlock[] = []
): string | string[] {
	const labels: string[] = [];
	const { filters } = params;

	const addLabel = (condition: boolean, label: string) => {
		if (condition) labels.push(label);
	};

	addLabel(!!params.search, `Recherche : ${params.search}`);
	addLabel(!!filters?.needVerbatim, 'Réponse avec commentaire');
	addLabel(!!params.button_id, `Bouton ${params.button_id}`);

	const addGroupedLabel = (fieldCode: string, values: string[]) => {
		if (!values.length) return;
		const valueLabels = values.map(value =>
			getFilterValueLabel(fieldCode, value, filterableBlocks, buttons)
		);
		addLabel(
			true,
			`${getFilterFieldName(fieldCode, filterableBlocks)} : ${valueLabels.join(
				', '
			)}`
		);
	};

	if (filters?.buttonId?.length) addGroupedLabel('buttonId', filters.buttonId);

	filters?.fields?.forEach(field => {
		addGroupedLabel(field.field_code, field.values ?? []);
	});

	addLabel(!!filters?.needOtherHelp, 'Autre aide');
	addLabel(!!filters?.needOtherDifficulties, 'Autres difficultés');

	return asArray ? labels : labels.join('; ');
}

export const getExportSummaryLabels = (
	params: ExportParams,
	buttons?: Button[],
	filterableBlocks: FilterableBlock[] = []
): string[] => [
	`Période : ${getExportPeriodLabel(params)}`,
	...(getExportFiltersLabel(
		params,
		true,
		buttons,
		filterableBlocks
	) as string[])
];
