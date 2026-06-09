import { Loader } from '@/src/components/ui/Loader';
import { CustomModalProps } from '@/src/types/custom';
import { fr } from '@codegouvfr/react-dsfr';
import React from 'react';
import { tss } from 'tss-react/dsfr';

const EMAIL_DESIGN_WIDTH = 640;

interface Props {
	modal: CustomModalProps;
	isOpen: boolean;
	title: string;
	iframeTitle: string;
	html?: string;
	isLoading: boolean;
}

const EmailPreviewModal = ({
	modal,
	isOpen,
	title,
	iframeTitle,
	html,
	isLoading
}: Props) => {
	const { classes } = useStyles();
	const iframeRef = React.useRef<HTMLIFrameElement>(null);

	const srcDoc = (html ?? '').replace(
		/<head([^>]*)>/i,
		`<head$1>
			<meta name="viewport" content="width=device-width, initial-scale=1">
			<style>
				*, *::before, *::after { box-sizing: border-box; }
				html, body { margin: 0; overflow: hidden; }
				body { word-wrap: break-word; overflow-wrap: break-word; }
				img { max-width: 100% !important; height: auto !important; }
			</style>`
	);

	const resizeIframe = React.useCallback(() => {
		const iframe = iframeRef.current;
		const body = iframe?.contentDocument?.body;
		if (!iframe || !body) return;

		const scale = Math.min(1, iframe.clientWidth / EMAIL_DESIGN_WIDTH);

		if (scale < 1) {
			body.style.setProperty('zoom', '');
			body.style.width = `${EMAIL_DESIGN_WIDTH}px`;
			const naturalHeight = body.scrollHeight;
			body.style.setProperty('zoom', String(scale));
			iframe.style.height = `${Math.ceil(naturalHeight * scale)}px`;
		} else {
			body.style.setProperty('zoom', '');
			body.style.width = '';
			iframe.style.height = `${body.scrollHeight}px`;
		}
	}, []);

	React.useEffect(() => {
		if (!isOpen) return;
		window.addEventListener('resize', resizeIframe);
		return () => window.removeEventListener('resize', resizeIframe);
	}, [isOpen, resizeIframe]);

	const handleIframeLoad = () => {
		resizeIframe();
		const body = iframeRef.current?.contentDocument?.body;
		if (!body || typeof ResizeObserver === 'undefined') return;
		const observer = new ResizeObserver(() => resizeIframe());
		observer.observe(body);
	};

	return (
		<modal.Component title={title} size="large" className={fr.cx('fr-my-0')}>
			<div className={classes.frame}>
				{isLoading ? (
					<div className={classes.loaderWrapper}>
						<Loader />
					</div>
				) : (
					<iframe
						ref={iframeRef}
						title={iframeTitle}
						srcDoc={srcDoc}
						sandbox="allow-same-origin"
						className={classes.iframe}
						onLoad={handleIframeLoad}
					/>
				)}
			</div>
		</modal.Component>
	);
};

const useStyles = tss.withName({ EmailPreviewModal }).create({
	frame: {
		border: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
		borderRadius: fr.spacing('1v'),
		overflow: 'hidden',
		background: '#ffffff'
	},
	loaderWrapper: {
		padding: fr.spacing('8v')
	},
	iframe: {
		width: '100%',
		border: 'none',
		display: 'block'
	}
});

export default EmailPreviewModal;
