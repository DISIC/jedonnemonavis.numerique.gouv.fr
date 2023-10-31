import React, { createContext, useState, useContext, ReactNode } from 'react';
import { FieldCode } from '../types/custom';

type StatsTotals = {
	[key in FieldCode]?: number;
};

interface StatsTotalsContextProps {
	statsTotals: StatsTotals;
	updateStatsTotals: (newStats: Partial<StatsTotals>) => void;
}

const StatsTotalsContext = createContext<StatsTotalsContextProps | undefined>(
	undefined
);

interface StatsTotalsProviderProps {
	children: ReactNode;
}

export const StatsTotalsProvider: React.FC<StatsTotalsProviderProps> = ({
	children
}) => {
	const [statsTotals, setStatsTotals] = useState<StatsTotals>({});

	const updateStatsTotals = (newStatsTotals: Partial<StatsTotals>) => {
		setStatsTotals(prevStatsTotals => ({
			...prevStatsTotals,
			...newStatsTotals
		}));
	};

	return (
		<StatsTotalsContext.Provider value={{ statsTotals, updateStatsTotals }}>
			{children}
		</StatsTotalsContext.Provider>
	);
};

export const useStats = (): StatsTotalsContextProps => {
	const context = useContext(StatsTotalsContext);
	if (!context) {
		throw new Error('useStats must be used within a StatsProvider');
	}
	return context;
};
