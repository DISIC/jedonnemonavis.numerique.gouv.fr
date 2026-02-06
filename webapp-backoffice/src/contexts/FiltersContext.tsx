import { TypeAction } from '@prisma/client';
import React, { createContext, useState, useContext, ReactNode } from 'react';
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
}

const FiltersContext = createContext<FiltersContextProps | undefined>(
	undefined
);

interface FiltersContextProviderProps {
	children: ReactNode;
}

const initialState: Filters = {
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

export const FiltersContextProvider: React.FC<FiltersContextProviderProps> = ({
	children
}) => {
	const [filters, setFilters] = useState<Filters>(initialState);

	const updateFilters = (newFilters: Partial<Filters>) => {
		setFilters(prevFilters => ({
			...prevFilters,
			...newFilters
		}));
	};

	const clearFilters = () => setFilters(initialState);

	const resetSectionFilters = (
		section: keyof Pick<
			Filters,
			'productActivityLogs' | 'productReviews' | 'productStats'
		>
	) => {
		setFilters(prevFilters => ({
			...prevFilters,
			[section]: initialState[section],
			sharedFilters: {
				...initialState.sharedFilters
			},
			currentPage: 1
		}));
	};

	return (
		<FiltersContext.Provider
			value={{ filters, updateFilters, clearFilters, resetSectionFilters }}
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
