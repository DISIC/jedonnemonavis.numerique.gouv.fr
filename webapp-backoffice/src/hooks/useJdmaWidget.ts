import { useEffect, useRef } from 'react';

/**
 * Manages the JDMA feedback widget visibility and DOM placement.
 * Hides the widget on off-admin pages and re-attaches it to the
 * #jdma-widget-anchor (inside PublicLayout) when coming back.
 */
export function useJdmaWidget(isOutOfAdminLayout: boolean) {
	const triggerRef = useRef<HTMLElement | null>(null);

	// Capture the widget trigger once the script creates it
	useEffect(() => {
		if (triggerRef.current) return;

		const found = document.querySelector<HTMLElement>('.jdma-widget-trigger');
		if (found) {
			triggerRef.current = found;
			return;
		}

		const observer = new MutationObserver(() => {
			const el = document.querySelector<HTMLElement>('.jdma-widget-trigger');
			if (el) {
				triggerRef.current = el;
				observer.disconnect();
			}
		});
		observer.observe(document.body, { childList: true, subtree: true });
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		const trigger = triggerRef.current;

		function syncWidget() {
			if (!trigger) return;

			trigger.style.display = isOutOfAdminLayout ? 'none' : '';

			const panel = document.querySelector<HTMLElement>(
				'.jdma-widget-panel'
			);
			if (panel && isOutOfAdminLayout) panel.style.display = 'none';

			if (!isOutOfAdminLayout) {
				const anchor = document.getElementById('jdma-widget-anchor');
				if (anchor && trigger.parentElement !== anchor) {
					anchor.appendChild(trigger);
				}
			}
		}

		const rafId = requestAnimationFrame(syncWidget);
		return () => cancelAnimationFrame(rafId);
	}, [isOutOfAdminLayout]);
}
