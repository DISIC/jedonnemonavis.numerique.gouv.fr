import { Button } from '@prisma/client';

export type ButtonCreationPayload = Omit<
	Button,
	'id' | 'created_at' | 'updated_at'
>;

export type ButtonModalType = 'install' | 'rename' | 'delete';

export const FR_THEMES = ['clair', 'sombre'] as const;

export type LinkCreationStep = 'PREVIEW' | 'CREATION' | 'COPY';
