import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { useRouter } from 'next/router';
import React from 'react';
import { tss } from 'tss-react/dsfr';

interface OnboardingLayoutProps {
	children: React.ReactNode;
	title?: string;
	hideActions?: boolean;
	isCancelable?: boolean;
	confirmText?: string;
	hideMainHintText?: boolean;
	hideBackButton?: boolean;
	onCancel?: () => void;
	onConfirm?: () => void;
	noBackground?: boolean;
	isConfirmDisabled?: boolean;
}

const OnboardingLayout = ({
	children,
	hideActions,
	isCancelable,
	confirmText,
	onCancel,
	onConfirm,
	title,
	hideMainHintText,
	hideBackButton,
	noBackground,
	isConfirmDisabled
}: OnboardingLayoutProps) => {
	const router = useRouter();
	const { cx, classes } = useStyles({ hasActions: !hideActions });

	return (
		<>
			<main
				id="main"
				role="main"
				tabIndex={-1}
				className={classes.mainContainer}
			>
				<div
					className={classes.stepContent}
					style={{ background: noBackground ? 'transparent' : undefined }}
				>
					{title && (
						<>
							<h1
								className={fr.cx(
									'fr-h3',
									'fr-mb-1v',
									hideMainHintText && 'fr-mb-8v'
								)}
							>
								{title}
							</h1>
							{!hideMainHintText && (
								<p className={fr.cx('fr-hint-text', 'fr-text--sm', 'fr-mb-8v')}>
									Les champs marqués d&apos;un{' '}
									<span className={cx(classes.asterisk)}>*</span> sont
									obligatoires
								</p>
							)}
						</>
					)}
					{children}
				</div>
			</main>
			{!hideActions && (
				<section
					id="onboarding-actions"
					role="region"
					aria-label="Actions d'onboarding"
					className={classes.actionsContainer}
					style={{
						justifyContent: hideBackButton ? 'flex-end' : 'space-between'
					}}
				>
					{!hideBackButton && (
						<Button
							priority={isCancelable ? 'secondary' : 'tertiary'}
							size="large"
							iconId={isCancelable ? undefined : 'fr-icon-arrow-left-s-line'}
							onClick={() => (onCancel ? onCancel() : router.back())}
						>
							{isCancelable ? 'Annuler' : 'Retour'}
						</Button>
					)}

					<div className={cx(classes.rightActions)}>
						{/* <Button
							priority="secondary"
							size="large"
							iconPosition="right"
							iconId="fr-icon-arrow-right-s-line"
						>
							Passer cette étape
						</Button> */}
						<Button
							size="large"
							iconPosition="right"
							iconId="fr-icon-arrow-right-s-line"
							onClick={onConfirm}
							disabled={isConfirmDisabled}
						>
							{confirmText ? confirmText : 'Continuer'}
						</Button>
					</div>
				</section>
			)}
		</>
	);
};

export default OnboardingLayout;

const useStyles = tss
	.withParams<{ hasActions?: boolean }>()
	.create(({ hasActions }) => ({
		navigation: {
			span: {
				color: fr.colors.decisions.background.default.grey.default,
				backgroundColor:
					fr.colors.decisions.background.flat.redMarianne.default,
				borderRadius: '50%',
				width: fr.spacing('4v'),
				height: fr.spacing('4v'),
				display: 'inline-block',
				textAlign: 'center',
				lineHeight: fr.spacing('4v'),
				marginLeft: '8px',
				position: 'relative',
				bottom: '2px',
				fontSize: '10px',
				fontWeight: 'bold'
			}
		},
		firstItem: {
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'flex-start',
			WebkitAlignItems: 'flex-start'
		},
		lastItem: {
			display: 'flex',
			flexDirection: 'column'
		},
		item: {
			borderTop: `solid ${fr.colors.decisions.border.default.grey.default} 1px`
		},
		inMenu: {
			display: 'block',
			'&:nth-of-type(2)': {
				fontSize: '0.8rem',
				color: fr.colors.decisions.text.disabled.grey.default
			}
		},
		mainContainer: {
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			width: '100%',
			height: hasActions ? `calc(100vh - ${fr.spacing('20v')})` : '100vh',
			overflowY: 'auto',
			backgroundColor: fr.colors.decisions.background.alt.blueFrance.default,
			paddingTop: fr.spacing('20v'),
			paddingBottom: fr.spacing('10v'),
			[fr.breakpoints.down('md')]: {
				padding: 0
			}
		},
		stepContent: {
			padding: fr.spacing('10v'),
			backgroundColor: 'white',
			width: fr.breakpoints.values.md,
			[fr.breakpoints.down('md')]: {
				width: '100%',
				height: '100%'
			}
		},
		actionsContainer: {
			position: 'fixed',
			bottom: 0,
			left: 0,
			right: 0,
			zIndex: 1000,
			display: 'flex',
			justifyContent: 'space-between',
			width: '100%',
			height: fr.spacing('20v'),
			backgroundColor: 'white',
			borderTop: `solid 1px ${fr.colors.decisions.border.default.grey.default}`,
			...fr.spacing('padding', { topBottom: '4v', rightLeft: '10v' }),
			[fr.breakpoints.down('sm')]: {
				borderTop: 'none',
				flexDirection: 'column',
				height: 'auto',
				gap: fr.spacing('4v'),
				button: {
					width: '100%',
					justifyContent: 'center',
					fontSize: '1rem',
					lineHeight: '1.5rem',
					minHeight: fr.spacing('8v')
				}
			}
		},
		rightActions: {
			display: 'flex',
			gap: fr.spacing('4v')
		},
		asterisk: {
			color: fr.colors.decisions.text.default.error.default
		}
	}));
