import {
	describeFocusTarget,
	findFocusTarget,
	FocusTargetDescriptor
} from '@/src/utils/tools';
import Router from 'next/router';
import { useEffect } from 'react';

const STORAGE_KEY = 'jdma-history-focus';
const RESTORE_TIMEOUT_MS = 5000;

type FocusTargets = Record<string, FocusTargetDescriptor>;

const readFocusTargets = (): FocusTargets => {
	try {
		return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
	} catch {
		return {};
	}
};

const writeFocusTargets = (targets: FocusTargets) => {
	try {
		sessionStorage.setItem(STORAGE_KEY, JSON.stringify(targets));
	} catch {}
};

const isFocusLost = () =>
	!document.activeElement || document.activeElement === document.body;

export const useHistoryFocusRestore = () => {
	useEffect(() => {
		let isHistoryNavigation = false;
		let stopRestoring: (() => void) | null = null;

		const restoreFocus = (descriptor: FocusTargetDescriptor) => {
			const tryFocus = () => {
				if (!isFocusLost()) return;
				findFocusTarget(descriptor)?.focus();
			};

			const observer = new MutationObserver(tryFocus);
			const stop = () => {
				observer.disconnect();
				window.clearTimeout(timeout);
				document.removeEventListener('keydown', stop, true);
				document.removeEventListener('pointerdown', stop, true);
				stopRestoring = null;
			};
			const timeout = window.setTimeout(stop, RESTORE_TIMEOUT_MS);

			observer.observe(document.body, { childList: true, subtree: true });
			document.addEventListener('keydown', stop, true);
			document.addEventListener('pointerdown', stop, true);
			stopRestoring = stop;
			tryFocus();
		};

		const onPopState = () => {
			isHistoryNavigation = true;
		};

		const onRouteChangeStart = () => {
			stopRestoring?.();
			const targets = readFocusTargets();
			const descriptor = describeFocusTarget(document.activeElement);
			if (descriptor) targets[Router.asPath] = descriptor;
			else delete targets[Router.asPath];
			writeFocusTargets(targets);
		};

		const onRouteChangeComplete = (url: string) => {
			if (!isHistoryNavigation) return;
			isHistoryNavigation = false;
			const descriptor = readFocusTargets()[url];
			if (descriptor) restoreFocus(descriptor);
		};

		window.addEventListener('popstate', onPopState);
		Router.events.on('routeChangeStart', onRouteChangeStart);
		Router.events.on('routeChangeComplete', onRouteChangeComplete);
		return () => {
			stopRestoring?.();
			window.removeEventListener('popstate', onPopState);
			Router.events.off('routeChangeStart', onRouteChangeStart);
			Router.events.off('routeChangeComplete', onRouteChangeComplete);
		};
	}, []);
};
