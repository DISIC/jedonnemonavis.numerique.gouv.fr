import React, {
	createContext,
	useContext,
	useState,
	useCallback,
	useEffect
} from 'react';
import { AccessRight, Form, Product } from '@prisma/client';
import { FormWithElements } from '../types/prismaTypesExtended';
import { onboardingStepsContent, StepContent } from '../utils/content';

interface OnboardingState {
	createdProduct?: Product;
	createdForm?: FormWithElements;
	createdUserAccesses?: AccessRight[];
	steps: StepContent[];
}

interface OnboardingContextValue extends OnboardingState {
	updateCreatedProduct: (product: Product) => void;
	updateCreatedForm: (form: FormWithElements) => void;
	updateCreatedUserAccesses: (accesses: AccessRight[]) => void;
	updateSteps: (newSteps: StepContent[]) => void;
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
	const [steps, setSteps] = useState<StepContent[]>(onboardingStepsContent);

	const getSlugValues = (
		stepSlug: string
	): { isCompleted: boolean; url: string } => {
		switch (stepSlug) {
			case 'product':
				return {
					isCompleted: Boolean(createdProduct),
					url: '/administration/dashboard/product/new'
				};
			case 'access':
				return {
					isCompleted: Boolean(
						createdUserAccesses && createdUserAccesses.length > 0
					),
					url: `/administration/dashboard/product/${createdProduct?.id}/access/new`
				};
			case 'form':
				return {
					isCompleted: Boolean(createdForm),
					url: `/administration/dashboard/product/${createdProduct?.id}/forms/new`
				};
			case 'link':
				return {
					isCompleted: false,
					url: `/administration/dashboard/product/${createdProduct?.id}/forms/${createdForm?.id}/new-link`
				};
			default:
				return {
					isCompleted: false,
					url: '/administration/dashboard/product/new'
				};
		}
	};

	useEffect(() => {
		setSteps(
			steps.map(step => ({
				...step,
				isCompleted: getSlugValues(step.slug).isCompleted,
				url: getSlugValues(step.slug).url
			}))
		);
	}, [createdProduct, createdUserAccesses, createdForm]);

	const updateCreatedProduct = useCallback((p: Product) => {
		setCreatedProduct(p);
	}, []);

	const updateCreatedForm = useCallback((f: FormWithElements) => {
		setCreatedForm(f);
	}, []);

	const updateCreatedUserAccesses = useCallback((accesses: AccessRight[]) => {
		setCreatedUserAccesses(accesses);
	}, []);

	const updateSteps = useCallback((newSteps: StepContent[]) => {
		setSteps(newSteps);
	}, []);

	const reset = useCallback(() => {
		setCreatedProduct(undefined);
		setCreatedForm(undefined);
		setCreatedUserAccesses(undefined);
		setSteps(onboardingStepsContent);
	}, []);

	return (
		<OnboardingContext.Provider
			value={{
				createdProduct,
				createdForm,
				createdUserAccesses,
				steps,
				updateCreatedProduct,
				updateCreatedForm,
				updateCreatedUserAccesses,
				updateSteps,
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
