import { useCallback, useEffect, useState } from 'react';

/**
 * Manages the JDMA feedback widget visibility and DOM placement.
 * Hides the widget on off-admin pages and re-attaches it to the
 * #jdma-widget-anchor (inside PublicLayout) when coming back.
 * Defaults to hidden so the widget never flashes on non-admin pages.
 */
export function useJdmaWidget(isOutOfAdminLayout: boolean) {
	const [trigger, setTrigger] = useState<HTMLElement | null>(null);

	const syncWidget = useCallback(
		(el: HTMLElement) => {
			el.style.display = isOutOfAdminLayout ? 'none' : '';

			const panel = document.querySelector<HTMLElement>('.jdma-widget-panel');
			if (panel && isOutOfAdminLayout) panel.style.display = 'none';

			if (!isOutOfAdminLayout) {
				const anchor = document.getElementById('jdma-widget-anchor');
				if (anchor && el.parentElement !== anchor) {
					anchor.appendChild(el);
				}
			}
		},
		[isOutOfAdminLayout]
	);

	// Capture the widget trigger once the script creates it,
	// hide it immediately so it never flashes on non-admin pages.
	useEffect(() => {
		function capture(el: HTMLElement) {
			el.style.display = 'none';
			setTrigger(el);
		}

		const found = document.querySelector<HTMLElement>('.jdma-widget-trigger');
		if (found) {
			capture(found);
			return;
		}

		const observer = new MutationObserver(() => {
			const el = document.querySelector<HTMLElement>('.jdma-widget-trigger');
			if (el) {
				capture(el);
				observer.disconnect();
			}
		});
		observer.observe(document.body, { childList: true, subtree: true });
		return () => observer.disconnect();
	}, []);

	// Sync visibility whenever the trigger is found or layout changes
	useEffect(() => {
		if (!trigger) return;
		const rafId = requestAnimationFrame(() => syncWidget(trigger));
		return () => cancelAnimationFrame(rafId);
	}, [trigger, syncWidget]);
}
