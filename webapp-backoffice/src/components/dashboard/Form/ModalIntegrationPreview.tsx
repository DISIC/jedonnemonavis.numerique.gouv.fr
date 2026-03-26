import { FormTemplateButtonWithVariants } from '@/src/types/prismaTypesExtended';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { useCallback, useEffect, useRef, useState } from 'react';
import { tss } from 'tss-react/dsfr';
import ImageWithFallback from '../../ui/ImageWithFallback';
import { Loader } from '../../ui/Loader';

type ModalAnimationPhase =
	| 'idle'
	| 'show-trigger'
	| 'open-panel'
	| 'close-panel';

type ModalIntegrationPreviewProps = {
	isActive: boolean;
	defaultFormTemplateButton?: FormTemplateButtonWithVariants;
	onDimmedChange: (isDimmed: boolean) => void;
	formId: number;
};

const ModalIntegrationPreview = ({
	isActive,
	defaultFormTemplateButton,
	onDimmedChange,
	formId
}: ModalIntegrationPreviewProps) => {
	const { cx, classes } = useStyles();

	const [phase, setPhase] = useState<ModalAnimationPhase>('idle');
	const [animDone, setAnimDone] = useState(false);
	const [iframeScale, setIframeScale] = useState(1);
	const [iframeLoaded, setIframeLoaded] = useState(false);
	const [iframeContentHeight, setIframeContentHeight] = useState<number | null>(
		null
	);
	const hasPlayedRef = useRef(false);
	const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
	const panelBodyRef = useRef<HTMLDivElement>(null);

	const IFRAME_VIEWPORT_WIDTH = 500;

	useEffect(() => {
		const el = panelBodyRef.current;
		if (!el) return;
		const observer = new ResizeObserver(([entry]) => {
			const containerWidth = entry.contentRect.width;
			setIframeScale(Math.min(containerWidth / IFRAME_VIEWPORT_WIDTH, 1));
		});
		observer.observe(el);
		return () => observer.disconnect();
	}, [phase]);

	// Listen for dynamic height from the iframe form
	useEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			if (
				event.data?.source === 'jdma-widget' &&
				event.data?.type === 'resize' &&
				typeof event.data.height === 'number'
			) {
				setIframeContentHeight(event.data.height);
			}
		};
		window.addEventListener('message', handleMessage);
		return () => window.removeEventListener('message', handleMessage);
	}, []);

	const clearTimers = useCallback(() => {
		timersRef.current.forEach(clearTimeout);
		timersRef.current = [];
	}, []);

	const play = useCallback(() => {
		clearTimers();
		setAnimDone(false);
		onDimmedChange(false);
		setPhase('show-trigger');

		const t1 = setTimeout(() => setPhase('open-panel'), 600);
		const t2 = setTimeout(() => setPhase('close-panel'), 10000);
		const t3 = setTimeout(() => {
			setPhase('idle');
			setAnimDone(true);
			onDimmedChange(true);
		}, 10500);

		timersRef.current = [t1, t2, t3];
	}, [clearTimers, onDimmedChange]);

	useEffect(() => {
		if (isActive && !hasPlayedRef.current) {
			hasPlayedRef.current = true;
			play();
		}
	}, [isActive, play]);

	useEffect(() => {
		if (!isActive) {
			clearTimers();
			setPhase('idle');
			setAnimDone(false);
			setIframeLoaded(false);
			setIframeContentHeight(null);
			hasPlayedRef.current = false;
			onDimmedChange(false);
		}
	}, [isActive, clearTimers, onDimmedChange]);

	useEffect(() => {
		return () => clearTimers();
	}, [clearTimers]);

	if (!isActive) return null;

	const isAnimating =
		phase === 'show-trigger' ||
		phase === 'open-panel' ||
		phase === 'close-panel';

	return (
		<>
			<div
				className={cx(classes.container, animDone && classes.containerDimmed)}
			>
				<button
					title="Je donne mon avis - nouvelle fenêtre"
					className={cx(
						classes.triggerButton,
						isAnimating && classes.triggerAnimIn
					)}
					disabled
					aria-disabled
				>
					{defaultFormTemplateButton ? (
						<ImageWithFallback
							alt={defaultFormTemplateButton.label}
							src={
								defaultFormTemplateButton.variants.find(
									v => v.style === 'ghost'
								)?.image_url || ''
							}
							fallbackSrc={`/assets/buttons/button-${defaultFormTemplateButton.slug}-ghost-light.svg`}
							width={200}
							height={85}
						/>
					) : (
						<Loader />
					)}
				</button>

				{(phase === 'open-panel' || phase === 'close-panel') && (
					<div
						className={cx(
							classes.fakePanel,
							phase === 'open-panel' && classes.panelAnimIn,
							phase === 'close-panel' && classes.panelAnimOut
						)}
					>
						<div className={classes.fakePanelHeader}>
							<span className={classes.fakeClose}>Fermer ✕</span>
						</div>
						<div
							className={classes.fakePanelBody}
							ref={panelBodyRef}
							style={
								iframeContentHeight
									? { height: iframeContentHeight * iframeScale }
									: undefined
							}
						>
							<div
								className={classes.iframeWrapper}
								style={{
									width: `${100 / iframeScale}%`,
									height: iframeContentHeight || '100%',
									transform: `scale(${iframeScale})`,
									transformOrigin: 'top left'
								}}
							>
								{!iframeLoaded && (
									<div className={classes.iframeLoader}>
										<Loader />
									</div>
								)}
								<iframe
									src={`${process.env.NEXT_PUBLIC_FORM_APP_URL}/Demarches/avis/${formId}?&mode=widget&preview=true`}
									title="Prévisualisation de la modale dépôt d'avis"
									className={classes.previewEmbedContainer}
									onLoad={() => setIframeLoaded(true)}
								/>
							</div>
						</div>
					</div>
				)}
			</div>

			{animDone && phase === 'idle' && (
				<div className={classes.replayOverlay}>
					<Button
						iconId="fr-icon-arrow-go-back-line"
						priority="tertiary no outline"
						onClick={play}
						className={classes.replayButton}
					>
						Relancer l&apos;animation
					</Button>
				</div>
			)}
		</>
	);
};

const useStyles = tss.withName(ModalIntegrationPreview.name).create(() => ({
	container: {
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
		transition: 'opacity 0.4s ease'
	},
	containerDimmed: {
		pointerEvents: 'none',
		'&::after': {
			content: '""',
			position: 'absolute',
			top: 0,
			left: 0,
			width: '100%',
			height: '100%',
			background: 'rgba(255, 255, 255, 0.6)',
			zIndex: 2
		}
	},
	triggerButton: {
		display: 'flex',
		position: 'absolute',
		padding: 0,
		bottom: fr.spacing('6v'),
		right: fr.spacing('6v'),
		zIndex: 1,
		cursor: 'default',
		border: 'none',
		background: 'transparent',
		filter: 'drop-shadow(0 6px 18px rgba(0, 0, 18, 0.16))',
		img: {
			maxWidth: '200px',
			width: 'auto',
			height: 'auto'
		},
		transition: 'opacity 0.4s ease'
	},
	triggerAnimIn: {
		animation: 'modalTriggerFadeIn 0.4s ease forwards'
	},
	fakePanel: {
		position: 'absolute',
		bottom: fr.spacing('6v'),
		right: fr.spacing('6v'),
		padding: fr.spacing('4v'),
		width: '50%',
		maxWidth: '760px',
		background: '#fff',
		boxShadow: '0 6px 18px rgba(0, 0, 18, 0.16)',
		display: 'flex',
		flexDirection: 'column',
		overflow: 'hidden',
		overscrollBehavior: 'contain',
		transformOrigin: 'bottom right',
		zIndex: 6
	},
	iframeLoader: {
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		background: '#fff',
		zIndex: 1
	},
	iframeWrapper: {
		position: 'absolute',
		top: 0,
		left: 0,
		display: 'flex',
		width: '100%',
		height: '100%',
		pointerEvents: 'none'
	},
	previewEmbedContainer: {
		width: '100%',
		height: '100%',
		border: 'none',
		display: 'block'
	},
	panelAnimIn: {
		animation: 'modalPanelSlideIn 0.35s ease forwards'
	},
	panelAnimOut: {
		animation: 'modalPanelSlideOut 0.35s ease forwards'
	},
	fakePanelHeader: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'flex-end',
		flexShrink: 0
	},
	fakeClose: {
		fontSize: fr.spacing('3v'),
		color: '#000091',
		fontWeight: 500
	},
	fakePanelBody: {
		position: 'relative',
		overflow: 'hidden',
		transition: 'height 0.2s ease',
		minHeight: '200px'
	},
	replayOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		animation: 'modalReplayFadeIn 0.4s ease forwards',
		zIndex: 10
	},
	replayButton: {
		':hover': {
			backgroundColor:
				fr.colors.decisions.background.default.grey.active + ' !important'
		}
	}
}));

export default ModalIntegrationPreview;
