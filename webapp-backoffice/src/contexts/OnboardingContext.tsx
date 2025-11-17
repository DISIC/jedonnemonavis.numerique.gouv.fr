import React, { createContext, useContext, useState, useCallback } from 'react';
import { Product } from '@prisma/client';

interface OnboardingState {
	createdProduct?: Product;
}

interface OnboardingContextValue extends OnboardingState {
	updateCreatedProduct: (product: Product) => void;
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

	const updateCreatedProduct = useCallback((p: Product) => {
		setCreatedProduct(p);
	}, []);

	const reset = useCallback(() => {
		setCreatedProduct(undefined);
	}, []);

	return (
		<OnboardingContext.Provider
			value={{ createdProduct, updateCreatedProduct, reset }}
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
