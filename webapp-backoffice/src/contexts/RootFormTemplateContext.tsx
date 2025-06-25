import { useRootFormTemplate } from '@/src/hooks/dashboard/form/useRootFormTemplate';
import React, { createContext, useContext } from 'react';
import { FormTemplateWithElements } from '../types/prismaTypesExtended';

interface RootFormTemplateContextType {
	formTemplate?: FormTemplateWithElements | null;
	isLoading: boolean;
	error: unknown;
	refetch: () => void;
}

const RootFormTemplateContext = createContext<
	RootFormTemplateContextType | undefined
>(undefined);

export const RootFormTemplateProvider: React.FC<{
	children: React.ReactNode;
}> = ({ children }) => {
	const { formTemplate, isLoading, error, refetch } = useRootFormTemplate();

	return (
		<RootFormTemplateContext.Provider
			value={{ formTemplate, isLoading, error, refetch }}
		>
			{children}
		</RootFormTemplateContext.Provider>
	);
};

export const useRootFormTemplateContext = () => {
	const context = useContext(RootFormTemplateContext);
	if (!context) {
		throw new Error(
			'useRootFormTemplateContext must be used within a RootFormTemplateProvider'
		);
	}
	return context;
};
