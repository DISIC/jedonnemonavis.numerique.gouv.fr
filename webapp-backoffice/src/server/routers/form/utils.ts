import { Prisma } from '@prisma/client';

type FormWritePayload =
	| Prisma.FormUncheckedCreateInput
	| Prisma.FormUncheckedUpdateInput;

export const withoutVisibilityFlags = <T extends FormWritePayload>(
	payload: T
): Omit<T, 'isPublic' | 'isTop250'> => {
	const { isPublic, isTop250, ...rest } = payload;
	return rest;
};
