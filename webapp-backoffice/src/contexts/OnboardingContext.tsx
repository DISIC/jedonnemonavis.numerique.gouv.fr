import React, { createContext, useContext, useState, useCallback } from 'react';
import { AccessRight, Form, Product } from '@prisma/client';
import { FormWithElements } from '../types/prismaTypesExtended';

interface OnboardingState {
	createdProduct?: Product;
	createdForm?: FormWithElements;
	createdUserAccesses?: AccessRight[];
}

interface OnboardingContextValue extends OnboardingState {
	updateCreatedProduct: (product: Product) => void;
	updateCreatedForm: (form: FormWithElements) => void;
	updateCreatedUserAccesses: (accesses: AccessRight[]) => void;
	reset: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | undefined>(
	undefined
);

export const OnboardingProvider = ({
	children
}: {
	children: React.ReactNode;
}) => {
	const [createdProduct, setCreatedProduct] = useState<Product | undefined>();
	const [createdUserAccesses, setCreatedUserAccesses] = useState<
		AccessRight[] | undefined
	>();
	const [createdForm, setCreatedForm] = useState<
		FormWithElements | undefined
	>();

	const updateCreatedProduct = useCallback((p: Product) => {
		setCreatedProduct(p);
	}, []);

	const updateCreatedForm = useCallback((f: FormWithElements) => {
		setCreatedForm(f);
	}, []);

	const updateCreatedUserAccesses = useCallback((accesses: AccessRight[]) => {
		setCreatedUserAccesses(accesses);
	}, []);

	const reset = useCallback(() => {
		setCreatedProduct(undefined);
		setCreatedForm(undefined);
		setCreatedUserAccesses(undefined);
	}, []);

	return (
		<OnboardingContext.Provider
			value={{
				createdProduct,
				createdForm,
				createdUserAccesses,
				updateCreatedProduct,
				updateCreatedForm,
				updateCreatedUserAccesses,
				reset
			}}
		>
			{children}
		</OnboardingContext.Provider>
	);
};

export const useOnboarding = () => {
	const ctx = useContext(OnboardingContext);
	if (!ctx)
		throw new Error('useOnboarding must be used within an OnboardingProvider');
	return ctx;
};

export default OnboardingContext;
