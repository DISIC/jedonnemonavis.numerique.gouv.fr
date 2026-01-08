import OnboardingStepper from '@/src/components/dashboard/Onboarding/OnboardingStepper';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { Header, HeaderProps } from '@codegouvfr/react-dsfr/Header';
import SkipLinks from '@codegouvfr/react-dsfr/SkipLinks';
import { Menu, MenuItem } from '@mui/material';
import { push } from '@socialgouv/matomo-next';
import { signOut, useSession } from 'next-auth/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { tss } from 'tss-react/dsfr';

interface OnboardingLayoutProps {
	children: React.ReactNode;
	title?: string;
	isCancelable?: boolean;
	confirmText?: string;
	hideMainHintText?: boolean;
	hideBackButton?: boolean;
	onCancel?: () => void;
	onConfirm?: () => void;
	onSkip?: () => void;
	noBackground?: boolean;
	isConfirmDisabled?: boolean;
	isStepperLayout?: boolean;
	customHintText?: React.ReactNode;
	isLarge?: boolean;
	shouldDisplayLine?: boolean;
	headerActions?: React.ReactNode;
	hideTitle?: boolean;
}

const OnboardingLayout = ({
	children,
	isCancelable,
	confirmText,
	onCancel,
	onConfirm,
	onSkip,
	title,
	hideMainHintText,
	hideBackButton,
	noBackground,
	isConfirmDisabled,
	isStepperLayout,
	customHintText,
	isLarge,
	shouldDisplayLine,
	headerActions,
	hideTitle
}: OnboardingLayoutProps) => {
	const router = useRouter();
	const { data: session } = useSession();
	const { cx, classes } = useStyles({ isStepperLayout });
	const mainRef = React.useRef<HTMLElement>(null);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const menuOpen = Boolean(anchorEl);

	const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		event.stopPropagation();
		setAnchorEl(event.currentTarget);
		push(['trackEvent', 'Account', 'Open-Menu']);
	};
	const handleClose = (
		event: React.MouseEvent<HTMLButtonElement | HTMLLIElement>
	) => {
		event.preventDefault();
		event.stopPropagation();
		setAnchorEl(null);
	};

	React.useEffect(() => {
		if (mainRef.current) {
			mainRef.current.focus();
		}
	}, []);

	const quickAccessItems: (HeaderProps.QuickAccessItem | JSX.Element | null)[] =
		[
			<Button
				id="button-account"
				iconId={'fr-icon-account-circle-line'}
				title="Ouvrir le menu mon compte"
				aria-label="Ouvrir le menu mon compte"
				priority="tertiary"
				size="large"
				onClick={handleMenuClick}
			>
				Compte
			</Button>,
			<Menu
				id="option-menu"
				open={menuOpen}
				anchorEl={anchorEl}
				onClose={handleClose}
				MenuListProps={{
					'aria-labelledby': 'button-options-access-right'
				}}
			>
				<MenuItem
					style={{ pointerEvents: 'none' }}
					className={cx(classes.firstItem)}
				>
					<div className={cx(fr.cx('fr-text--bold'), classes.inMenu)}>
						{session?.user.name}
					</div>
					<div className={cx(fr.cx('fr-pb-2v'), classes.inMenu)}>
						{session?.user.email}
					</div>
				</MenuItem>
				<MenuItem
					className={cx(fr.cx('fr-p-4v'), classes.item)}
					onClick={e => {
						handleClose(e);
						router.push(
							`/administration/dashboard/user/${session?.user.id}/infos`
						);
					}}
				>
					<span
						className={fr.cx('fr-icon-user-line', 'fr-icon--sm', 'fr-mr-1-5v')}
					/>
					Informations personnelles
				</MenuItem>
				<MenuItem
					className={cx(fr.cx('fr-p-4v'), classes.item)}
					onClick={e => {
						handleClose(e);
						router.push(
							`/administration/dashboard/user/${session?.user.id}/notifications`
						);
					}}
				>
					<span
						className={fr.cx(
							'fr-icon-notification-3-line',
							'fr-icon--sm',
							'fr-mr-1-5v'
						)}
					/>
					Notifications
				</MenuItem>
				<MenuItem
					className={cx(
						fr.cx('fr-pb-2v', 'fr-pt-4v'),
						classes.item,
						classes.lastItem
					)}
				>
					<Button
						id="button-account"
						iconId={'fr-icon-logout-box-r-line'}
						title={`Déconnexion`}
						aria-label={`Déconnexion`}
						priority="tertiary"
						onClick={() => {
							signOut();
							push(['trackEvent', 'Account', 'Disconnect']);
						}}
					>
						Se déconnecter
					</Button>
				</MenuItem>
			</Menu>
		];

	return (
		<>
			<Head>
				<title>{`${title} | Je donne mon avis`}</title>
			</Head>
			<SkipLinks
				links={[
					{
						anchor: '#main',
						label: 'Contenu'
					},
					...(!isStepperLayout
						? [
								{
									anchor: '#onboarding-actions',
									label: 'Actions du parcours'
								}
						  ]
						: [])
				]}
			/>
			{isStepperLayout && (
				<Header
					brandTop={
						<>
							RÉPUBLIQUE <br /> FRANÇAISE
						</>
					}
					homeLinkProps={{
						href: !session?.user ? '/' : '/administration/dashboard/products',
						title: "Je donne mon avis, retour à l'accueil"
					}}
					quickAccessItems={quickAccessItems}
					className={classes.navigation}
					id="fr-header-public-header"
					serviceTitle="Je donne mon avis"
					serviceTagline="La voix de vos usagers"
				/>
			)}
			<main
				ref={mainRef}
				id="main"
				role="main"
				tabIndex={0}
				className={cx(classes.mainContainer, fr.cx(hideTitle && 'fr-pt-0'))}
			>
				<div
					className={cx(classes.stepContent, fr.cx(hideTitle && 'fr-pt-0'))}
					style={{
						background: noBackground ? 'transparent' : undefined,
						width:
							isLarge || isStepperLayout
								? fr.breakpoints.values.lg
								: fr.breakpoints.values.md
					}}
				>
					{isStepperLayout ? (
						<OnboardingStepper />
					) : (
						<>
							<div className={classes.contentHeader}>
								{!hideTitle && title && (
									<div>
										<h1
											className={fr.cx(
												'fr-h3',
												'fr-mb-1v',
												hideMainHintText && 'fr-mb-8v'
											)}
										>
											{title}
										</h1>
										{!hideMainHintText &&
											(customHintText || (
												<p
													className={fr.cx(
														'fr-hint-text',
														'fr-text--sm',
														'fr-mb-8v'
													)}
												>
													Les champs marqués d&apos;un{' '}
													<span className={cx(classes.asterisk)}>*</span> sont
													obligatoires
												</p>
											))}
									</div>
								)}
								{headerActions && (
									<div className={classes.headerActions}>{headerActions}</div>
								)}
							</div>
							{shouldDisplayLine && <hr className={fr.cx('fr-mb-2v')} />}
							{children}
						</>
					)}
				</div>
			</main>
			{!isStepperLayout && (
				<section
					id="onboarding-actions"
					role="region"
					aria-label="Actions d'onboarding"
					className={classes.actionsContainer}
					style={{
						justifyContent: hideBackButton ? 'flex-end' : 'space-between'
					}}
				>
					<div className={cx(classes.rightActions)}>
						{onSkip && (
							<Button
								priority="secondary"
								size="large"
								iconPosition="right"
								iconId="fr-icon-arrow-right-s-line"
								onClick={onSkip}
							>
								Passer cette étape
							</Button>
						)}
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

					{!hideBackButton && (
						<Button
							className={classes.backButton}
							priority={isCancelable ? 'secondary' : 'tertiary'}
							size="large"
							iconId={isCancelable ? undefined : 'fr-icon-arrow-left-s-line'}
							onClick={() => (onCancel ? onCancel() : router.back())}
						>
							{isCancelable ? 'Annuler' : 'Retour'}
						</Button>
					)}
				</section>
			)}
		</>
	);
};

export default OnboardingLayout;

const useStyles = tss
	.withParams<{ isStepperLayout?: boolean }>()
	.create(({ isStepperLayout }) => ({
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
			minHeight: isStepperLayout ? 'auto' : '100vh',
			overflowY: 'auto',
			overflowX: 'hidden',
			backgroundColor: isStepperLayout
				? 'white'
				: fr.colors.decisions.background.alt.blueFrance.default,
			paddingTop: isStepperLayout ? fr.spacing('12v') : fr.spacing('20v'),
			paddingBottom: isStepperLayout ? fr.spacing('12v') : fr.spacing('30v'),
			'&:focus': {
				outline: 'none'
			},
			[fr.breakpoints.down('md')]: {
				paddingTop: isStepperLayout ? fr.spacing('6v') : 0,
				paddingBottom: fr.spacing('12v'),
				...fr.spacing('padding', { rightLeft: isStepperLayout ? '4v' : 0 })
			}
		},
		stepContent: {
			padding: isStepperLayout ? 0 : fr.spacing('10v'),
			backgroundColor: 'white',
			maxWidth: '100%',
			minHeight: 'fit-content',
			[fr.breakpoints.down('md')]: {
				width: '100%',
				minHeight: '100%',
				...fr.spacing('padding', {
					rightLeft: isStepperLayout ? 0 : '4v',
					bottom: isStepperLayout ? 0 : '32v'
				})
			}
		},
		contentHeader: {
			display: 'flex',
			justifyContent: 'space-between'
		},
		headerActions: {},
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
				...fr.spacing('padding', { topBottom: '6v', rightLeft: '4v' }),
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
			gap: fr.spacing('4v'),
			order: 2
		},
		backButton: {
			order: 1
		},
		asterisk: {
			color: fr.colors.decisions.text.default.error.default
		}
	}));
