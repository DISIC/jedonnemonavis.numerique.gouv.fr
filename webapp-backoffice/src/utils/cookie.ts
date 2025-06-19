import { z } from 'zod';

export const UserSettingsSchema = z.object({
	formHelpModalSeen: z.boolean().optional()
});
export type UserSettings = z.infer<typeof UserSettingsSchema>;

const USER_SETTINGS_COOKIE =
	process.env.NEXT_PUBLIC_USER_SETTINGS_COOKIE_KEY || 'jdma-user-settings';

function setCookie(name: string, value: string, days = 365) {
	if (typeof document === 'undefined') return;
	const maxAge = days * 24 * 60 * 60;
	document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; Secure; SameSite=Lax`;
}

function getCookie(name: string) {
	if (typeof document === 'undefined') return '';
	return document.cookie.split('; ').reduce((r, v) => {
		const parts = v.split('=');
		return parts[0] === name ? decodeURIComponent(parts[1]) : r;
	}, '');
}

export async function getCookiesUserSettings(): Promise<Partial<UserSettings>> {
	const cookie = getCookie(USER_SETTINGS_COOKIE);
	if (!cookie) return {};
	try {
		const parsed = JSON.parse(cookie);
		const validated = UserSettingsSchema.safeParse(parsed);
		if (validated.success) return validated.data;
		return {};
	} catch {
		return {};
	}
}

export async function setCookiesUserSettings(
	settings: Partial<UserSettings>,
	days = 365
) {
	setCookie(USER_SETTINGS_COOKIE, JSON.stringify(settings), days);
}

export async function setCookiesUserSetting<K extends keyof UserSettings>(
	key: K,
	value: UserSettings[K],
	days = 365
) {
	const settings = await getCookiesUserSettings();
	settings[key] = value;
	await setCookiesUserSettings(settings, days);
}
