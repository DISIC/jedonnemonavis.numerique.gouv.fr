import { Button } from '@prisma/client';

const buttons: Partial<Button>[] = [];
for (let i = 0; i < 20; i++) {
	buttons.push({
		title: `Button ${i}`,
		description: `Description ${i}`,
		isTest: i % 2 === 0
	});
}

export { buttons };
