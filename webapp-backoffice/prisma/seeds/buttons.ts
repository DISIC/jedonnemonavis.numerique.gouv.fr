import { Button } from '@prisma/client';

export const createButtons = (product_id: string) => {
	const buttons: Partial<Button>[] = [];
	for (let i = 1; i < 21; i++) {
		buttons.push({
			title: `Button ${i} pour ${product_id}`,
			description: `Description ${i}`
		});
	}
	return buttons;
};
