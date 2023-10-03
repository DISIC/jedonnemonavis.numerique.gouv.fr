import { Button } from '@prisma/client';

const buttons: Partial<Button>[] = [];
for (let i = 0; i < 20; i++) {
	buttons.push({
		title: `Button ${i}`,
		description: `Description ${i}`
	});
}

export { buttons };
