type SortField = string;

type Direction = 'asc' | 'desc';

const isDirection = (value: string): value is Direction =>
	value === 'asc' || value === 'desc';

export const buildOrderBy = (
	sort: string | undefined,
	allowedFields: readonly SortField[]
): Record<string, any> | null => {
	if (!sort) return null;
	const [rawField, rawDirection] = sort.split(':');
	if (!rawField || !rawDirection) return null;
	if (!isDirection(rawDirection)) return null;
	if (!allowedFields.includes(rawField)) return null;

	if (rawField.includes('.')) {
		const [relation, field] = rawField.split('.');
		if (!relation || !field) return null;
		return { [relation]: { [field]: rawDirection } };
	}

	return { [rawField]: rawDirection };
};
