import { doTheOnboardingFlow, login } from '../../../utils/helpers/common';
import { generateUniqueEmail } from '../../../utils/tools';

describe('jdma-onboarding', () => {
	it('lets a new agent onboard after a first ProConnect login', () => {
		login(generateUniqueEmail(), false, true, {
			firstName: 'John',
			lastName: 'Doe'
		});
		doTheOnboardingFlow('button');
	});
});
