import { useEffect } from 'react';

const DISCLOSE_EVENT = 'dsfr.disclose';
const CONCEAL_EVENT = 'dsfr.conceal';
const MODAL_SELECTOR = '.fr-modal';
// A modal opened right after another one closed (e.g. a search modal that
// opens a details modal) inherits the trigger of the modal that just closed.
const CHAINED_MODAL_DELAY_MS = 1000;

const isFocusable = (el: HTMLElement) =>
	el.isConnected &&
	!el.closest('[inert], [aria-hidden="true"], .fr-hidden') &&
	el.getClientRects().length > 0;

/**
 * Restores focus to the element that opened a DSFR modal once it is closed
 * (RGAA 7.1 / 12.8).
 *
 * Modals opened with `modal.open()` are disclosed through react-dsfr's hidden
 * control button, so on close DSFR moves focus to that hidden button and the
 * keyboard user loses their position. We record the focused element when a
 * modal opens and give focus back to it after DSFR's own focus handling.
 */
export const useModalFocusRestore = () => {
	useEffect(() => {
		const triggers = new Map<HTMLElement, HTMLElement>();
		let lastConcealed: { trigger: HTMLElement; at: number } | null = null;

		const getModal = (event: Event) => {
			const target = event.target;
			return target instanceof HTMLElement && target.matches(MODAL_SELECTOR)
				? target
				: null;
		};

		const onDisclose = (event: Event) => {
			const modal = getModal(event);
			if (!modal) return;

			const active = document.activeElement;
			let trigger: HTMLElement | null =
				active instanceof HTMLElement &&
				active !== document.body &&
				!modal.contains(active) &&
				isFocusable(active)
					? active
					: null;

			const inheritsFromPrevious =
				lastConcealed &&
				Date.now() - lastConcealed.at < CHAINED_MODAL_DELAY_MS &&
				(!trigger || trigger.closest(MODAL_SELECTOR));
			if (inheritsFromPrevious) trigger = lastConcealed!.trigger;

			if (trigger) triggers.set(modal, trigger);
		};

		const onConceal = (event: Event) => {
			const modal = getModal(event);
			if (!modal) return;

			const trigger = triggers.get(modal);
			triggers.delete(modal);
			if (!trigger) return;

			lastConcealed = { trigger, at: Date.now() };

			// DSFR focuses its own control button right after dispatching the
			// conceal event: wait for it, then move focus back to the trigger.
			window.setTimeout(() => {
				const active = document.activeElement;
				const focusMovedElsewhere =
					active instanceof HTMLElement &&
					active !== document.body &&
					!modal.contains(active) &&
					!active.matches('[aria-controls="' + modal.id + '"]');
				const anotherModalOpen = document.querySelector(
					`${MODAL_SELECTOR}[open]`
				);
				if (focusMovedElsewhere || anotherModalOpen) return;
				if (isFocusable(trigger)) trigger.focus();
			}, 0);
		};

		document.addEventListener(DISCLOSE_EVENT, onDisclose);
		document.addEventListener(CONCEAL_EVENT, onConceal);
		return () => {
			document.removeEventListener(DISCLOSE_EVENT, onDisclose);
			document.removeEventListener(CONCEAL_EVENT, onConceal);
		};
	}, []);
};
