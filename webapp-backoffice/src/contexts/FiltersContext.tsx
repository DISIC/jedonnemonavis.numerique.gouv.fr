import { TypeAction } from '@prisma/client';
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { DateShortcutName } from '../components/dashboard/Filters/Filters';

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
		actionType: TypeAction[];
	};
	productReviews: {
		currentStartDate: string;
		currentEndDate: string;
		dateShortcut: DateShortcutName;
	};
	productStats: {
		currentStartDate: string;
		currentEndDate: string;
		dateShortcut: DateShortcutName;
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
			dateShortcut: undefined,
			actionType: []
		},
		productReviews: {
			currentStartDate: '',
			currentEndDate: '',
			dateShortcut: undefined
		},
		productStats: {
			currentStartDate: '',
			currentEndDate: '',
			dateShortcut: undefined
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
