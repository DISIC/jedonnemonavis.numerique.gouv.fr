/**
 * JDMA Modal Widget — "Je donne mon avis" floating feedback form
 *
 * Usage: Drop a single <script> tag on any page:
 *
 *   <script
 *     src="https://jedonnemonavis.numerique.gouv.fr/Demarches/assets/jdma-modal-widget.js"
 *     data-jdma-form-url="https://jedonnemonavis.numerique.gouv.fr/Demarches/avis/42?button=123"
 *     data-jdma-button-image="https://jedonnemonavis.numerique.gouv.fr/Demarches/assets/buttons/button-jdma-outline-light.svg"
 *     data-jdma-button-label="Je donne mon avis"
 *     data-jdma-position="bottom-right"
 *     defer
 *   ></script>
 *
 * Configuration (data attributes on the script tag):
 *   data-jdma-form-url      (required)  Full URL of the JDMA form
 *   data-jdma-button-image   (required)  URL of the floating button image
 *   data-jdma-button-label   (optional)  Accessible label — default "Je donne mon avis"
 *   data-jdma-position       (optional)  "bottom-right" (default) | "bottom-left"
 *
 * The widget:
 *   1. Injects a minimal scoped CSS block (all rules prefixed with .jdma-*)
 *   2. Creates a floating trigger button at the chosen screen corner
 *   3. On click, opens a modal overlay that loads the form in an <iframe>
 *   4. Listens for postMessage from the iframe for close / submitted events
 *   5. On submitted, hides the trigger so citizens aren't asked twice
 */
(function () {
	'use strict';

	// ---------------------------------------------------------------------------
	// 1. Read configuration from the <script> tag's data attributes
	// ---------------------------------------------------------------------------
	var currentScript =
		document.currentScript ||
		(function () {
			var scripts = document.getElementsByTagName('script');
			return scripts[scripts.length - 1];
		})();

	var formUrl = currentScript.getAttribute('data-jdma-form-url');
	var buttonImage = currentScript.getAttribute('data-jdma-button-image');
	var buttonLabel =
		currentScript.getAttribute('data-jdma-button-label') || 'Je donne mon avis';
	var position =
		currentScript.getAttribute('data-jdma-position') || 'bottom-right';

	if (!formUrl) {
		console.error(
			'[JDMA Widget] Missing required attribute: data-jdma-form-url',
		);
		return;
	}

	// Append mode=widget to the form URL so the form app renders without chrome
	var separator = formUrl.indexOf('?') === -1 ? '?' : '&';
	var iframeUrl = formUrl + separator + 'mode=widget';
	var iframeOrigin = new URL(iframeUrl).origin;

	var isLeft = position === 'bottom-left';

	// ---------------------------------------------------------------------------
	// 2. Inject scoped CSS
	// ---------------------------------------------------------------------------
	var CSS = [
		/* Floating trigger button */
		'.jdma-widget-trigger {',
		'  position: fixed;',
		'  z-index: 999990;',
		'  bottom: 24px;',
		isLeft ? '  left: 24px;' : '  right: 24px;',
		'  cursor: pointer;',
		'  border: none;',
		'  background: transparent;',
		'  padding: 0;',
		'  margin: 0;',
		'  transition: transform 0.2s ease, opacity 0.2s ease;',
		'  animation: jdma-fadein 0.4s ease;',
		'}',
		'.jdma-widget-trigger:hover {',
		'  transform: scale(1.05);',
		'  background: transparent!important;',
		'}',
		'.jdma-widget-trigger:focus-visible {',
		'  outline: 3px solid #000091;',
		'  outline-offset: 4px;',
		'}',
		'.jdma-widget-trigger img {',
		'  display: block;',
		'  max-width: 200px;',
		'  height: auto;',
		'}',

		/* Chatbot-style floating panel — anchored above the trigger */
		'.jdma-widget-panel {',
		'  position: fixed;',
		'  z-index: 999995;',
		'  bottom: 75px;',
		isLeft ? '  left: 24px;' : '  right: 24px;',
		'  width: 500px;',
		'  height: 550px;',
		'  max-height: calc(100vh - 130px);',
		'  background: #fff;',
		'  border-radius: 12px;',
		'  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18), 0 2px 8px rgba(0, 0, 0, 0.08);',
		'  overflow: hidden;',
		'  display: flex;',
		'  flex-direction: column;',
		'  animation: jdma-slideup 0.3s ease;',
		'}',

		/* Panel header bar */
		'.jdma-widget-header {',
		'  display: flex;',
		'  align-items: center;',
		'  justify-content: flex-end;',
		'  padding: 8px 12px;',
		'  flex-shrink: 0;',
		'}',

		/* Close button */
		'.jdma-widget-close {',
		'  border: none;',
		'  border-radius: 0.3em;',
		'  background: none;',
		'  cursor: pointer;',
		'  display: inline-flex;',
		'  align-items: center;',
		'  gap: 4px;',
		'  padding: 4px;',
		'  font-family: "Marianne", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;',
		'  font-size: 14px;',
		'  line-height: 1.5;',
		'  color: #000091;',
		'  text-underline-offset: 4px;',
		'  flex-shrink: 0;',
		'}',
		'.jdma-widget-close:hover {',
		'  color: #1212ff;',
		'}',
		'.jdma-widget-close:active {',
		'  color: #000091;',
		'}',
		'.jdma-widget-close:focus-visible {',
		'  outline: 3px solid #000091;',
		'  outline-offset: 2px;',
		'}',

		/* Close cross icon */
		'.jdma-widget-close-cross {',
		'  display: inline-flex;',
		'  align-items: center;',
		'  justify-content: center;',
		'  width: 28px;',
		'  height: 28px;',
		'  font-size: 14px;',
		'  font-weight: bold;',
		'  line-height: 1;',
		'}',

		/* Iframe fills the rest of the panel */
		'.jdma-widget-iframe {',
		'  flex: 1;',
		'  width: 100%;',
		'  border: none;',
		'}',

		/* Hidden state */
		'.jdma-widget-hidden {',
		'  display: none !important;',
		'}',

		/* Animations */
		'@keyframes jdma-fadein {',
		'  from { opacity: 0; }',
		'  to { opacity: 1; }',
		'}',
		'@keyframes jdma-slideup {',
		'  from { opacity: 0; transform: translateY(16px) scale(0.96); }',
		'  to { opacity: 1; transform: translateY(0) scale(1); }',
		'}',

		/* Responsive — on mobile, go full-screen */
		'@media (max-width: 500px) {',
		'  .jdma-widget-panel {',
		'    top: 0;',
		'    left: 0;',
		'    right: 0;',
		'    bottom: 0;',
		'    width: 100%;',
		'    height: 100%;',
		'    border-radius: 0;',
		'  }',
		'  .jdma-widget-trigger img {',
		'    max-width: 160px;',
		'  }',
		'}',
	].join('\n');

	var style = document.createElement('style');
	style.setAttribute('data-jdma-widget', 'true');
	style.textContent = CSS;
	document.head.appendChild(style);

	// ---------------------------------------------------------------------------
	// 3. Create the floating trigger button
	// ---------------------------------------------------------------------------
	var trigger = document.createElement('button');
	trigger.className = 'jdma-widget-trigger';
	trigger.setAttribute('type', 'button');
	trigger.setAttribute(
		'title',
		buttonLabel + ' - ouvre le formulaire dans une fenêtre flottante',
	);
	trigger.setAttribute('aria-label', buttonLabel);

	if (buttonImage) {
		var img = document.createElement('img');
		img.src = buttonImage;
		img.alt = buttonLabel;
		trigger.appendChild(img);
	} else {
		trigger.textContent = buttonLabel;
	}

	document.body.appendChild(trigger);

	// ---------------------------------------------------------------------------
	// 4. Modal open / close logic
	// ---------------------------------------------------------------------------
	var panel = null;

	function openPanel() {
		if (panel) return;

		panel = document.createElement('div');
		panel.className = 'jdma-widget-panel';
		panel.setAttribute('role', 'dialog');
		panel.setAttribute('aria-label', buttonLabel);

		// Header bar
		var header = document.createElement('div');
		header.className = 'jdma-widget-header';

		var closeBtn = document.createElement('button');
		closeBtn.className = 'jdma-widget-close';
		closeBtn.setAttribute('type', 'button');
		closeBtn.setAttribute('aria-label', 'Réduire / Fermer');

		var closeLabelText = document.createTextNode('Réduire / Fermer');
		closeBtn.appendChild(closeLabelText);

		var crossSpan = document.createElement('span');
		crossSpan.className = 'jdma-widget-close-cross';
		crossSpan.setAttribute('aria-hidden', 'true');
		crossSpan.textContent = '\u2715';
		closeBtn.appendChild(crossSpan);

		closeBtn.addEventListener('click', closePanel);
		header.appendChild(closeBtn);

		panel.appendChild(header);

		// Iframe
		var iframe = document.createElement('iframe');
		iframe.className = 'jdma-widget-iframe';
		iframe.setAttribute('src', iframeUrl);
		iframe.setAttribute('title', buttonLabel);
		iframe.setAttribute('allow', 'clipboard-write');
		panel.appendChild(iframe);

		document.body.appendChild(panel);

		// Focus the close button
		closeBtn.focus();

		// ESC key handler
		document.addEventListener('keydown', handleEscape);

		// Close when clicking outside the panel
		document.addEventListener('mousedown', handleClickOutside);
	}

	function closePanel() {
		if (!panel) return;
		document.body.removeChild(panel);
		panel = null;
		document.removeEventListener('keydown', handleEscape);
		document.removeEventListener('mousedown', handleClickOutside);
		trigger.focus();
	}

	function handleEscape(e) {
		if (e.key === 'Escape' || e.keyCode === 27) {
			closePanel();
		}
	}

	function handleClickOutside(e) {
		if (panel && !panel.contains(e.target) && !trigger.contains(e.target)) {
			closePanel();
		}
	}

	trigger.addEventListener('click', function () {
		if (panel) {
			closePanel();
		} else {
			openPanel();
		}
	});

	// ---------------------------------------------------------------------------
	// 5. Listen for postMessage from the iframe
	// ---------------------------------------------------------------------------
	window.addEventListener('message', function (event) {
		if (event.origin !== iframeOrigin) return;
		if (!event.data || typeof event.data !== 'object') return;
		if (event.data.source !== 'jdma-widget') return;

		switch (event.data.type) {
			case 'close':
				closePanel();
				break;

			case 'submitted':
				// closePanel();
				break;
		}
	});
})();
