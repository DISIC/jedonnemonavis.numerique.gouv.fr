import { useEffect } from 'react';

const RETURN_FOCUS_KEY = 'jdma-return-focus';

type ReturnFocusTarget = { path: string; elementId: string };

export const storeReturnFocus = (elementId: string) => {
	try {
		const target: ReturnFocusTarget = {
			path: window.location.pathname,
			elementId
		};
		sessionStorage.setItem(RETURN_FOCUS_KEY, JSON.stringify(target));
	} catch {}
};

const consumeReturnFocus = (): ReturnFocusTarget | null => {
	try {
		const stored = sessionStorage.getItem(RETURN_FOCUS_KEY);
		sessionStorage.removeItem(RETURN_FOCUS_KEY);
		return stored ? JSON.parse(stored) : null;
	} catch {
		return null;
	}
};

export const useReturnFocus = (isReady: boolean) => {
	useEffect(() => {
		if (!isReady) return;
		const target = consumeReturnFocus();
		if (target?.path !== window.location.pathname) return;
		document.getElementById(target.elementId)?.focus();
	}, [isReady]);
};
