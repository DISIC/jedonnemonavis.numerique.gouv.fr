import { Button } from '@prisma/client';

const buttons: Partial<Button>[] = [];
buttons.push({
	title: `Button 1`,
	description: `Description 1`,
	isTest: false,
	integration_type: 'button',
	button_style: 'solid'
});
buttons.push({
	title: `Button test 1`,
	description: `Description test 1`,
	isTest: true,
	integration_type: 'button',
	button_style: 'solid'
});

export { buttons };
