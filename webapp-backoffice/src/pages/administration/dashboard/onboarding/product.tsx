import OnboardingLayout from '@/src/layouts/Onboarding/OnboardingLayout';
import { useRouter } from 'next/router';
import React from 'react';

const NewProduct = () => {
	const router = useRouter();
	return (
		<OnboardingLayout
			showActions
			isCancelable
			onCancel={() => router.push('/administration/dashboard/products')}
		>
			<div>New Product</div>
		</OnboardingLayout>
	);
};

export default NewProduct;
