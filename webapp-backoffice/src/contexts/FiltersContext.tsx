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
			satisfaction: [],
			comprehension: [],
			needVerbatim: false,
			needOtherDifficulties: false,
			needOtherHelp: false,
			help: [],
			buttonId: []
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

	return (
		<FiltersContext.Provider value={{ filters, updateFilters, clearFilters }}>
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
