import { TypeAction } from '@prisma/client';
import { isEqual } from 'lodash';
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { getDatesByShortCut } from '../utils/tools';
import { DateShortcutName } from '../components/dashboard/Filters/Filters';
import { ReviewFiltersType } from '../types/custom';

export type Filters = {
	users: {
		entity: { label: string; value: number }[];
		currentPage: number;
		filter: string;
		validatedSearch: string;
		filterOnlyAdmins: boolean;
	};
	productActivityLogs: {
		actionType: TypeAction[];
	};
	productReviews: {
		displayNew: boolean;
		filters: ReviewFiltersType;
	};
	productStats: {
		buttonId: number | undefined;
	};
	sharedFilters: {
		currentStartDate: string;
		currentEndDate: string;
		dateShortcut: DateShortcutName;
		hasChanged: Boolean;
	};
	filterEntity: { label: string; value: number }[];
	currentPage: number;
	filter: string;
	view: 'all' | 'favorites' | 'archived';
	filterOnlyFavorites: boolean;
	filterOnlyArchived: boolean;
	validatedSearch: string;
};

interface FiltersContextProps {
	filters: Filters;
	updateFilters: (newFilters: Partial<Filters>) => void;
	clearFilters: () => void;
	resetSectionFilters: (
		section: keyof Pick<
			Filters,
			'productActivityLogs' | 'productReviews' | 'productStats'
		>
	) => void;
	/**
	 * Marks the filters as scoped to a given form. If the stored scope differs
	 * from the incoming `formId`, the form-scoped slices (productReviews /
	 * productStats) are reset to defaults. Shared filters (dates) survive.
	 * Safe to call on every render — no-ops when scope already matches.
	 */
	scopeToForm: (formId: number) => void;
}

const FiltersContext = createContext<FiltersContextProps | undefined>(
	undefined
);

interface FiltersContextProviderProps {
	children: ReactNode;
}

export const initialFilterState: Filters = {
	users: {
		entity: [],
		currentPage: 1,
		filter: 'email:asc',
		validatedSearch: '',
		filterOnlyAdmins: false
	},
	productActivityLogs: {
		actionType: []
	},
	productReviews: {
		displayNew: false,
		filters: {
			needVerbatim: false,
			needOtherDifficulties: false,
			needOtherHelp: false,
			buttonId: [],
			fields: []
		}
	},
	productStats: {
		buttonId: undefined
	},
	sharedFilters: {
		currentStartDate: '',
		currentEndDate: '',
		dateShortcut: 'one-year',
		hasChanged: false
	},
	filterEntity: [],
	currentPage: 1,
	filter: 'title',
	view: 'all',
	filterOnlyFavorites: false,
	filterOnlyArchived: false,
	validatedSearch: ''
};

/**
 * Checks whether any of the filter slices that affect dashboard results
 * differ from their defaults. Ignores `sharedFilters.hasChanged` itself
 * (it's a derived flag) and UI-only state like pagination / search text.
 *
 * Only `dateShortcut` is compared for shared filters — `currentStartDate`
 * / `currentEndDate` are derived from it on mount (see the useEffect in
 * Filters.tsx), so they are filled in even in the default state.
 */
export const hasAnyFilterChanged = (filters: Filters): boolean => {
	const sharedDatesChanged =
		filters.sharedFilters.dateShortcut !==
		initialFilterState.sharedFilters.dateShortcut;

	return (
		sharedDatesChanged ||
		!isEqual(filters.productReviews, initialFilterState.productReviews) ||
		!isEqual(filters.productStats, initialFilterState.productStats) ||
		!isEqual(
			filters.productActivityLogs,
			initialFilterState.productActivityLogs
		)
	);
};

export const FiltersContextProvider: React.FC<FiltersContextProviderProps> = ({
	children
}) => {
	const [filters, setFilters] = useState<Filters>(initialFilterState);
	const [scopedFormId, setScopedFormId] = useState<number | undefined>(
		undefined
	);

	const updateFilters = (newFilters: Partial<Filters>) => {
		setFilters(prevFilters => ({
			...prevFilters,
			...newFilters
		}));
	};

	const clearFilters = () => setFilters(initialFilterState);

	const resetSectionFilters = (
		section: keyof Pick<
			Filters,
			'productActivityLogs' | 'productReviews' | 'productStats'
		>
	) => {
		const defaultShortcut = initialFilterState.sharedFilters.dateShortcut;
		const { startDate, endDate } = defaultShortcut
			? getDatesByShortCut(defaultShortcut)
			: { startDate: '', endDate: '' };
		setFilters(prevFilters => ({
			...prevFilters,
			[section]: initialFilterState[section],
			sharedFilters: {
				...initialFilterState.sharedFilters,
				currentStartDate: startDate,
				currentEndDate: endDate
			},
			currentPage: 1
		}));
	};

	const scopeToForm = (formId: number) => {
		if (scopedFormId === formId) return;
		setScopedFormId(formId);
		// Only reset the form-scoped slices; keep shared filters (dates) intact.
		setFilters(prevFilters => ({
			...prevFilters,
			productReviews: initialFilterState.productReviews,
			productStats: initialFilterState.productStats
		}));
	};

	return (
		<FiltersContext.Provider
			value={{
				filters,
				updateFilters,
				clearFilters,
				resetSectionFilters,
				scopeToForm
			}}
		>
			{children}
		</FiltersContext.Provider>
	);
};

export const useFilters = (): FiltersContextProps => {
	const context = useContext(FiltersContext);
	if (!context) {
		throw new Error('useStats must be used within a FiltersContextProvider');
	}
	return context;
};
