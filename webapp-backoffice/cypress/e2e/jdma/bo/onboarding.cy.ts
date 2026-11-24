import { doTheOnboardingFlow, login } from '../../../utils/helpers/common';
import { generateUniqueEmail } from '../../../utils/tools';

const newAgentEmail = generateUniqueEmail();

describe('jdma-onboarding', () => {
	it('lets a new agent onboard after a first ProConnect login', () => {
		login(newAgentEmail, false, true, {
			firstName: 'John',
			lastName: 'Doe'
		});
		doTheOnboardingFlow('button');
	});
});
