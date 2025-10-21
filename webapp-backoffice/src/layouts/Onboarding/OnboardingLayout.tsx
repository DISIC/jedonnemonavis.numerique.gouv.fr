import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { HeaderProps } from '@codegouvfr/react-dsfr/Header';
import { Menu, MenuItem } from '@mui/material';
import { push } from '@socialgouv/matomo-next';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { tss } from 'tss-react/dsfr';

interface OnboardingLayoutProps {
	children: React.ReactNode;
	title?: string;
	showActions?: boolean;
	isSkippable?: boolean;
	isCancelable?: boolean;
	confirmText?: string;
	onCancel?: () => void;
	onConfirm?: () => void;
}

const OnboardingLayout = ({
	children,
	showActions = true,
	isSkippable,
	isCancelable,
	confirmText,
	onCancel,
	onConfirm,
	title
}: OnboardingLayoutProps) => {
	const router = useRouter();
	const { cx, classes } = useStyles({ hasActions: showActions });
	const { data: session } = useSession();
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

	const quickAccessItems: (HeaderProps.QuickAccessItem | JSX.Element | null)[] =
		!session?.user
			? [
					{
						iconId: 'fr-icon-account-line',
						linkProps: {
							href: '/login',
							target: '_self'
						},
						text: 'Connexion / Inscription'
					}
				]
			: [
					<Button
						id="button-account"
						iconId={'fr-icon-account-circle-line'}
						title={`Ouvrir le menu mon compte`}
						aria-label={`Ouvrir le menu mon compte`}
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
								className={fr.cx(
									'fr-icon-user-line',
									'fr-icon--sm',
									'fr-mr-1-5v'
								)}
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
			<main
				id="main"
				role="main"
				tabIndex={-1}
				className={classes.mainContainer}
			>
				<div className={classes.stepContent}>
					<h1 className={fr.cx('fr-h3', 'fr-mb-1v')}>{title}</h1>
					<p className={fr.cx('fr-hint-text', 'fr-text--sm', 'fr-mb-8v')}>
						Les champs marqués d&apos;un{' '}
						<span className={cx(classes.asterisk)}>*</span> sont obligatoires
					</p>
					{children}
				</div>
			</main>
			{showActions && (
				<section
					id="onboarding-actions"
					role="region"
					aria-label="Actions d'onboarding"
					className={classes.actionsContainer}
				>
					{isCancelable ? (
						<Button priority="secondary" size="large" onClick={onCancel}>
							Annuler
						</Button>
					) : (
						<Button
							priority="tertiary"
							size="large"
							iconId="fr-icon-arrow-left-s-line"
						>
							Retour
						</Button>
					)}

					<div className={cx(classes.rightActions)}>
						{isSkippable && (
							<Button
								priority="secondary"
								size="large"
								iconPosition="right"
								iconId="fr-icon-arrow-right-s-line"
							>
								Passer cette étape
							</Button>
						)}
						<Button
							size="large"
							iconPosition="right"
							iconId="fr-icon-arrow-right-s-line"
							onClick={onConfirm}
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
