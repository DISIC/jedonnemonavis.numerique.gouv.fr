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
 *   data-jdma-anchor         (optional)  CSS selector of the element to append the trigger into (e.g. "#my-nav") — places it in the natural tab order of that container instead of appending to <body>
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
	var currentScript = document.currentScript;

	if (!currentScript) {
		console.error(
			'[JDMA Widget] Unable to detect script element. ' +
				'This browser does not support document.currentScript.',
		);
		return;
	}

	var formUrl = currentScript.getAttribute('data-jdma-form-url');
	var buttonImage = currentScript.getAttribute('data-jdma-button-image');
	var buttonLabel =
		currentScript.getAttribute('data-jdma-button-label') || 'Je donne mon avis';
	var position =
		currentScript.getAttribute('data-jdma-position') || 'bottom-right';
	var anchorSelector = currentScript.getAttribute('data-jdma-anchor');
	var anchorEl = anchorSelector ? document.querySelector(anchorSelector) : null;
	var devMode = currentScript.hasAttribute('data-jdma-dev-mode');

	if (!formUrl) {
		console.error(
			'[JDMA Widget] Missing required attribute: data-jdma-form-url',
		);
		return;
	}

	// Generate a cryptographic nonce for postMessage verification
	var widgetNonce = (function () {
		var array = new Uint8Array(16);
		crypto.getRandomValues(array);
		var hex = '';
		for (var i = 0; i < array.length; i++) {
			hex += ('0' + array[i].toString(16)).slice(-2);
		}
		return hex;
	})();
	var separator = formUrl.indexOf('?') === -1 ? '?' : '&';
	var iframeUrl = formUrl + separator + 'mode=widget&nonce=' + widgetNonce;

	var ALLOWED_ORIGINS = [
		'https://jedonnemonavis.numerique.gouv.fr',
		'https://jdma-staging.cleverapps.io',
		'https://jdma-develop.cleverapps.io',
	];

	var iframeOrigin;
	try {
		iframeOrigin = new URL(iframeUrl).origin;
	} catch (e) {
		console.error('[JDMA Widget] Invalid data-jdma-form-url:', formUrl);
		return;
	}

	var iframeHost = new URL(iframeUrl).hostname;
	var pageHost = window.location.hostname;
	var isLocalDev =
		devMode &&
		(iframeHost === 'localhost' || iframeHost === '127.0.0.1') &&
		(pageHost === 'localhost' || pageHost === '127.0.0.1');

	if (isLocalDev) {
		console.warn(
			'[JDMA Widget] Dev mode active — local origin accepted. ' +
				'Remove data-jdma-dev-mode before deploying to production.',
		);
	}

	// Validate iframe origin against the allowlist, unless we're in local dev mode
	if (ALLOWED_ORIGINS.indexOf(iframeOrigin) === -1 && !isLocalDev) {
		console.error(
			'[JDMA Widget] Untrusted data-jdma-form-url origin:',
			iframeOrigin,
		);
		return;
	}

	// Validate buttonImage origin against the same allowlist
	if (buttonImage) {
		try {
			var imgOrigin = new URL(buttonImage).origin;
			var imgHost = new URL(buttonImage).hostname;
			var isImgLocal =
				(imgHost === 'localhost' || imgHost === '127.0.0.1') && isLocalDev;
			if (ALLOWED_ORIGINS.indexOf(imgOrigin) === -1 && !isImgLocal) {
				console.error(
					'[JDMA Widget] Untrusted data-jdma-button-image origin:',
					imgOrigin,
				);
				buttonImage = null;
			}
		} catch (e) {
			console.error(
				'[JDMA Widget] Invalid data-jdma-button-image:',
				buttonImage,
			);
			buttonImage = null;
		}
	}

	var isLeft = position === 'bottom-left';

	// ---------------------------------------------------------------------------
	// 2. Inject scoped CSS
	// ---------------------------------------------------------------------------
	var CSS = [
		/* Floating trigger button */
		'.jdma-widget-trigger {',
		'  position: fixed;',
		'  z-index: 1700;',
		'  bottom: 24px;',
		isLeft ? '  left: 24px;' : '  right: 24px;',
		'  cursor: pointer;',
		'  border: none;',
		'  background: transparent;',
		'  padding: 0;',
		'  margin: 0;',
		'  min-width: 2.75rem;',
		'  min-height: 2.75rem;',
		'  filter: drop-shadow(0 6px 18px rgba(0, 0, 18, 0.16));',
		'  transition: opacity 0.2s ease, filter 0.2s ease;',
		'  will-change: transform;',
		'}',
		'.jdma-widget-trigger:hover {',
		'  transform: scale(1.05);',
		'  filter: drop-shadow(0 8px 24px rgba(0, 0, 18, 0.22));',
		'  background: transparent!important;',
		'}',
		'.jdma-widget-trigger:active {',
		'  transform: scale(0.97) translateY(2%);',
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
		'  z-index: 1705;',
		'  bottom: 24px;',
		isLeft ? '  left: 24px;' : '  right: 24px;',
		'  width: 500px;',
		'  height: 600px;',
		'  padding: 1rem;',
		'  max-height: calc(100vh - 3rem);',
		'  max-width: calc(100vw - 3rem);',
		'  background: #fff;',
		'  box-shadow: 0 6px 18px rgba(0, 0, 18, 0.16);',
		'  overflow: hidden;',
		'  overscroll-behavior: contain;',
		'  display: flex;',
		'  flex-direction: column;',
		'}',

		/* Panel header bar */
		'.jdma-widget-header {',
		'  display: flex;',
		'  align-items: center;',
		'  justify-content: flex-end;',
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
		'  gap: 0.5rem;',
		'  padding: 4px 8px 4px 12px;',
		'  min-width: 44px;',
		'  min-height: 28px;',
		'  font-weight: 500;',
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
		'  z-index: 1;',
		'}',

		/* Close icon (SVG) */
		'.jdma-widget-close-icon {',
		'  display: inline-flex;',
		'  flex-shrink: 0;',
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

		/* Reduced motion: no animations by default */
		'@keyframes jdma-fadein {',
		'  from { opacity: 0; }',
		'  to { opacity: 1; }',
		'}',
		'@keyframes jdma-slideup {',
		'  from { opacity: 0; transform: translateY(16px) scale(0.96); }',
		'  to { opacity: 1; transform: translateY(0) scale(1); }',
		'}',

		/* Only animate when the user has no motion preference */
		'@media (prefers-reduced-motion: no-preference) {',
		'  .jdma-widget-trigger {',
		'    animation: jdma-fadein 0.4s ease;',
		'    transition: transform 0.2s ease, opacity 0.2s ease;',
		'  }',
		'  .jdma-widget-panel {',
		'    animation: jdma-slideup 0.3s ease;',
		'  }',
		'}',

		/* Responsive — on mobile, go full-screen */
		'@media (max-width: 550px) {',
		'  .jdma-widget-panel {',
		'    top: 0;',
		'    left: 0;',
		'    right: 0;',
		'    bottom: 0;',
		'    max-width: none;',
		'    max-height: none;',
		'    width: 100%;',
		'    height: 100%;',
		'    padding: 0.75rem;',
		'  }',
		'  .jdma-widget-trigger {',
		'    bottom: 16px;',
		isLeft ? '    left: 16px;' : '    right: 16px;',
		'  }',
		'  .jdma-widget-trigger img {',
		'    max-width: 160px;',
		'  }',
		'}',
	].join('\n');

	var style = document.createElement('style');
	style.setAttribute('data-jdma-widget', 'true');

	var scriptNonce = currentScript.nonce || currentScript.getAttribute('nonce');
	if (scriptNonce) {
		style.setAttribute('nonce', scriptNonce);
	}

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
	trigger.setAttribute('aria-haspopup', 'dialog');
	trigger.setAttribute('aria-expanded', 'false');

	if (buttonImage) {
		var img = document.createElement('img');
		img.src = buttonImage;
		img.alt = buttonLabel;
		trigger.appendChild(img);
	} else {
		trigger.textContent = buttonLabel;
	}

	(anchorEl || document.body).appendChild(trigger);

	// ---------------------------------------------------------------------------
	// 4. Modal open / close logic
	// ---------------------------------------------------------------------------
	var panel = null;

	// ---------------------------------------------------------------------------
	// Focus-trap helper: keeps Tab cycling within the panel
	// ---------------------------------------------------------------------------
	function trapFocus(e) {
		if (e.key !== 'Tab' && e.keyCode !== 9) return;
		if (!panel) return;

		var focusable = panel.querySelectorAll(
			'button, [href], input, select, textarea, iframe, [tabindex]:not([tabindex="-1"])',
		);
		if (focusable.length === 0) return;

		var first = focusable[0];
		var last = focusable[focusable.length - 1];

		if (e.shiftKey) {
			if (document.activeElement === first) {
				e.preventDefault();
				last.focus();
			}
		} else {
			if (document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		}
	}

	function openPanel() {
		if (panel) return;

		panel = document.createElement('div');
		panel.className = 'jdma-widget-panel';
		panel.setAttribute('role', 'dialog');
		panel.setAttribute('aria-modal', 'true');
		panel.setAttribute('aria-label', buttonLabel);

		// Header bar
		var header = document.createElement('div');
		header.className = 'jdma-widget-header';

		var closeBtn = document.createElement('button');
		closeBtn.className = 'jdma-widget-close';
		closeBtn.setAttribute('type', 'button');
		closeBtn.setAttribute('aria-label', 'Fermer');

		var closeLabelText = document.createTextNode('Fermer');
		closeBtn.appendChild(closeLabelText);

		var closeSvg = document.createElementNS(
			'http://www.w3.org/2000/svg',
			'svg',
		);
		closeSvg.setAttribute('viewBox', '0 0 24 24');
		closeSvg.setAttribute('width', '16');
		closeSvg.setAttribute('height', '16');
		closeSvg.setAttribute('fill', 'currentColor');
		closeSvg.setAttribute('aria-hidden', 'true');
		closeSvg.classList.add('jdma-widget-close-icon');
		var closePath = document.createElementNS(
			'http://www.w3.org/2000/svg',
			'path',
		);
		closePath.setAttribute(
			'd',
			'M12 10.586l4.95-4.95 1.414 1.414L13.414 12l4.95 4.95-1.414 1.414L12 13.414l-4.95 4.95-1.414-1.414L10.586 12 5.636 7.05l1.414-1.414z',
		);
		closeSvg.appendChild(closePath);
		closeBtn.appendChild(closeSvg);

		closeBtn.addEventListener('click', closePanel);
		header.appendChild(closeBtn);

		panel.appendChild(header);

		// Iframe
		var iframe = document.createElement('iframe');
		iframe.className = 'jdma-widget-iframe';
		iframe.setAttribute('src', iframeUrl);
		iframe.setAttribute('title', buttonLabel);
		iframe.setAttribute('allow', 'clipboard-write');
		iframe.setAttribute(
			'sandbox',
			'allow-scripts allow-forms allow-same-origin allow-popups',
		);
		panel.appendChild(iframe);

		document.body.appendChild(panel);

		// Update trigger state
		trigger.setAttribute('aria-expanded', 'true');

		// Focus the close button
		closeBtn.focus();

		// Keyboard handlers
		document.addEventListener('keydown', handleEscape);
		document.addEventListener('keydown', trapFocus);

		// Close when clicking outside the panel
		document.addEventListener('mousedown', handleClickOutside);
	}

	function closePanel() {
		if (!panel) return;
		document.body.removeChild(panel);
		panel = null;
		trigger.setAttribute('aria-expanded', 'false');
		document.removeEventListener('keydown', handleEscape);
		document.removeEventListener('keydown', trapFocus);
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
		if (event.data.nonce !== widgetNonce) return;

		switch (event.data.type) {
			case 'close':
				closePanel();
				break;

			case 'submitted':
				break;
		}
	});
})();
