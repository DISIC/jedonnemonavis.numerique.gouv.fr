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
		currentStartDate: string;
		currentEndDate: string;
		dateShortcut: DateShortcutName;
		hasChanged: Boolean;
		actionType: TypeAction[];
	};
	productReviews: {
		currentStartDate: string;
		currentEndDate: string;
		dateShortcut: DateShortcutName;
		hasChanged: Boolean;
		displayNew: boolean;
		filters: ReviewFiltersType;
	};
	productStats: {
		currentStartDate: string;
		currentEndDate: string;
		dateShortcut: DateShortcutName;
		hasChanged: Boolean;
		buttonId: number | undefined;
	};
	filterEntity: { label: string; value: number }[];
	currentPage: number;
	filter: string;
	filterOnlyFavorites: boolean;
	filterOnlyArchived: boolean;
	validatedSearch: string;
};

interface FiltersContextProps {
	filters: Filters;
	updateFilters: (newFilters: Partial<Filters>) => void;
}

const FiltersContext = createContext<FiltersContextProps | undefined>(
	undefined
);

interface FiltersContextProviderProps {
	children: ReactNode;
}

export const FiltersContextProvider: React.FC<FiltersContextProviderProps> = ({
	children
}) => {
	const [filters, setFilters] = useState<Filters>({
		users: {
			entity: [],
			currentPage: 1,
			filter: 'email:asc',
			validatedSearch: '',
			filterOnlyAdmins: false
		},
		productActivityLogs: {
			currentStartDate: '',
			currentEndDate: '',
			dateShortcut: 'one-year',
			hasChanged: false,
			actionType: []
		},
		productReviews: {
			currentStartDate: '',
			currentEndDate: '',
			dateShortcut: 'one-year',
			hasChanged: false,
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
			currentStartDate: '',
			currentEndDate: '',
			dateShortcut: 'one-year',
			hasChanged: false,
			buttonId: undefined
		},
		filterEntity: [],
		currentPage: 1,
		filter: 'title',
		filterOnlyFavorites: false,
		filterOnlyArchived: false,
		validatedSearch: ''
	});

	const updateFilters = (newFilters: Partial<Filters>) => {
		setFilters(prevFilters => ({
			...prevFilters,
			...newFilters
		}));
	};

	return (
		<FiltersContext.Provider value={{ filters, updateFilters }}>
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
