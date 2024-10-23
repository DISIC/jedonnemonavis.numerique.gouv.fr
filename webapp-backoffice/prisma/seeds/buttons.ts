import { Button } from '@prisma/client';

const buttons: Partial<Button>[] = [];
buttons.push({
	title: `Button 1`,
	description: `Description 1`,
	isTest: false
});
buttons.push({
	title: `Button test 1`,
	description: `Description test 1`,
	isTest: true
});

export { buttons };
