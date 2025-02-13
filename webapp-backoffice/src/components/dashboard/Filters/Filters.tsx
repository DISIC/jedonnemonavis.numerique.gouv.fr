import { Filters, useFilters } from '@/src/contexts/FiltersContext';

const dateShortcuts = [
	{
		label: '365 derniers jours',
		name: 'one-year'
	},
	{
		label: '30 derniers jours',
		name: 'one-month'
	},
	{
		label: '7 derniers jours',
		name: 'one-week'
	}
] as const;

// Type qui extrait les valeurs de `name`
export type DateShortcutName =
	| (typeof dateShortcuts)[number]['name']
	| undefined;

// Définition des clés valides
export type FilterSectionKey = keyof Pick<
	Filters,
	'productActivityLogs' | 'productReviews' | 'productStats'
>;

// Définition des props du composant
type FiltersProps<T extends FilterSectionKey> = {
	filterKey: T;
};

const GenericFilters = <T extends FilterSectionKey>({
	filterKey
}: FiltersProps<T>) => {
	// Récupère le contexte global
	const { filters, updateFilters } = useFilters();

	// Récupère la section spécifique en fonction de filterKey
	const sectionFilters = filters[filterKey];

	if ('actionType' in sectionFilters) return <></>;
};
