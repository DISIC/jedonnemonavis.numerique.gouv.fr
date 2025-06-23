import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode
} from 'react';
import {
	getCookiesUserSettings,
	setCookiesUserSettings,
	UserSettings
} from '../utils/cookie';
import { isEmpty } from 'lodash';

interface UserSettingsContextProps {
	settings: Partial<UserSettings>;
	setSetting: <K extends keyof UserSettings>(
		key: K,
		value: UserSettings[K]
	) => void;
	setSettings: (settings: Partial<UserSettings>) => void;
	isLoading: boolean;
}

const UserSettingsContext = createContext<UserSettingsContextProps | undefined>(
	undefined
);
const initialState: Required<UserSettings> = {
	formHelpModalSeen: false,
	newsModalSeen: false
};

export const UserSettingsProvider = ({ children }: { children: ReactNode }) => {
	const [settings, setSettingsState] = useState<UserSettings>(initialState);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const loadSettings = async () => {
			const userSettings = await getCookiesUserSettings();
			setSettingsState(isEmpty(userSettings) ? initialState : userSettings);
			setIsLoading(false);
		};
		loadSettings();
	}, []);

	const setSetting = <K extends keyof UserSettings>(
		key: K,
		value: UserSettings[K]
	) => {
		const newSettings = { ...settings, [key]: value };
		setSettingsState(newSettings);
		setCookiesUserSettings(newSettings);
	};

	const setSettings = (newSettings: Partial<UserSettings>) => {
		setSettingsState(newSettings);
		setCookiesUserSettings(newSettings);
	};

	return (
		<UserSettingsContext.Provider
			value={{ settings, setSetting, setSettings, isLoading }}
		>
			{children}
		</UserSettingsContext.Provider>
	);
};

export const useUserSettings = () => {
	const context = useContext(UserSettingsContext);
	if (!context)
		throw new Error(
			'useUserSettings must be used within a UserSettingsProvider'
		);
	return context;
};
