interface MemoryStorage {
	[key: string]: number | undefined;
}

let memoryStorage: MemoryStorage = {};

export const buildUserScopedKey = (
	userId: number | string | undefined | null,
	key: string
): string => `u${userId ?? 'anon'}:${key}`;

export const setMemoryValue = (key: string, value: number) => {
	memoryStorage[key] = value;
};

export const getMemoryValue = (key: string) => {
	return memoryStorage[key];
};

export const deleteMemoryValue = (key: string) => {
	delete memoryStorage[key];
};
