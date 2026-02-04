import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Badge from '@codegouvfr/react-dsfr/Badge';
import Button from '@codegouvfr/react-dsfr/Button';
import { Footer } from '@codegouvfr/react-dsfr/Footer';
import { Header, HeaderProps } from '@codegouvfr/react-dsfr/Header';
import { Notice } from '@codegouvfr/react-dsfr/Notice';
import { SkipLinks } from '@codegouvfr/react-dsfr/SkipLinks';
import { Menu, MenuItem } from '@mui/material';
import { push } from '@socialgouv/matomo-next';
import { signOut, useSession } from 'next-auth/react';
import router, { useRouter } from 'next/router';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { tss } from 'tss-react/dsfr';
import UserDetailsForm from '../components/auth/UserDetailsForm';
import { useUserSettings } from '../contexts/UserSettingsContext';

type PublicLayoutProps = { children: ReactNode; light: boolean };
type NavigationItem = {
	text: string | React.ReactElement;
	linkProps: {
		href: string;
		target: string;
		id?: string;
		title?: string;
		'aria-label'?: string;
	};
	isActive: boolean;
};

export default function PublicLayout({ children, light }: PublicLayoutProps) {
	const { pathname } = useRouter();
	const { settings } = useUserSettings();

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

	const { data: session, status } = useSession();

	const { data: userRequestsResult } = trpc.userRequest.getList.useQuery(
		{
			page: 1,
			numberPerPage: 0,
			displayProcessed: false
		},
		{
			enabled: session?.user?.role?.includes('admin') ?? false,
			initialData: {
				data: [],
				metadata: {
					count: 0
				}
			}
		}
	);

	const {
		data: userAdminEntityRights,
		isLoading: isUserAdminEntityRightsLoading
	} = trpc.adminEntityRight.getUserList.useQuery(
		{
			page: 1,
			numberPerPage: 0
		},
		{
			enabled: !!session?.user,
			initialData: {
				data: [],
				metadata: {
					count: 0
				}
			}
		}
	);

	const { data: userAccessRights, isLoading: isUserAccessRightsLoading } =
		trpc.accessRight.getUserList.useQuery(
			{
				page: 100,
				numberPerPage: 0
			},
			{
				enabled: !!session?.user,
				initialData: {
					data: [],
					metadata: {
						count: 0
					}
				}
			}
		);

	const {
		data: userDetails,
		refetch: refetchUserDetails,
		isLoading: isUserDetailsLoading
	} = trpc.userDetails.getByUser.useQuery(undefined, {
		enabled: session?.user?.id !== undefined
	});

	const userHasDetails = useMemo(() => {
		return !!userDetails?.data;
	}, [userDetails?.data]);

	const { classes, cx } = useStyles({
		countUserRequests: userRequestsResult.metadata.count
	});

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
						PaperProps={{
							component: 'nav'
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

	const navigationItems: NavigationItem[] = [];

	if (session?.user) {
		if (
			userAccessRights.metadata.count ||
			userAdminEntityRights.metadata.count ||
			session.user.role.includes('admin')
		) {
			navigationItems.push({
				text: 'Services',
				linkProps: {
					href: '/administration/dashboard/products',
					target: '_self'
				},
				isActive: pathname.startsWith('/administration/dashboard/product')
			});
		}

		if (
			userAdminEntityRights.metadata.count ||
			session.user.role.includes('admin')
		) {
			navigationItems.push({
				text: 'Organisations',
				linkProps: {
					href: '/administration/dashboard/entities',
					target: '_self'
				},
				isActive: pathname.startsWith('/administration/dashboard/entities')
			});
		}
	}

	if (session?.user.role.includes('admin')) {
		const adminNavigationItems: NavigationItem[] = [
			{
				text: 'Utilisateurs',
				linkProps: {
					href: '/administration/dashboard/users',
					target: '_self'
				},
				isActive: pathname.startsWith('/administration/dashboard/users')
			},
			{
				text: 'Liste blanche des noms de domaines',
				linkProps: {
					href: '/administration/dashboard/domains',
					target: '_self'
				},
				isActive: pathname == '/administration/dashboard/domains'
			},
			{
				text: (
					<div>
						Demandes d'accès
						<Badge
							severity="warning"
							noIcon
							small={true}
							className={cx(classes.badgeAccess, fr.cx('fr-ml-2v'))}
						>
							<i
								className={fr.cx(
									'fr-icon-notification-3-line',
									'fr-mr-1v',
									'fr-p-1v'
								)}
							/>
							{` ${userRequestsResult.metadata.count}`}
						</Badge>
					</div>
				),
				linkProps: {
					href: '/administration/dashboard/user-requests',
					target: '_self',
					id: 'fr-header-public-header-main-navigation-link-badge',
					title: `Demandes d'accès (${userRequestsResult.metadata.count} ${
						userRequestsResult.metadata.count > 1 ? 'demandes' : 'demande'
					})`,
					'aria-label': `Demandes d'accès (${
						userRequestsResult.metadata.count
					} ${userRequestsResult.metadata.count > 1 ? 'demandes' : 'demande'})`
				},
				isActive: pathname == '/administration/dashboard/user-requests'
			}
		];
		navigationItems.push(...adminNavigationItems);
	}

	if (
		userAccessRights.metadata.count ||
		userAdminEntityRights.metadata.count ||
		session?.user.role.includes('admin')
	) {
		navigationItems.push({
			text: (
				<>
					Nouveautés
					{!settings.newsPageSeen && (
						<Badge
							severity="new"
							small
							className={cx(classes.badgeAccess, fr.cx('fr-ml-2v'))}
						>
							1
						</Badge>
					)}
				</>
			),
			linkProps: {
				href: '/administration/dashboard/news',
				target: '_self'
			},
			isActive: pathname.startsWith('/administration/dashboard/news')
		});
	}

	let mainContent = children;
	if (
		status !== 'loading' &&
		session !== null &&
		!isUserDetailsLoading &&
		!userHasDetails
	) {
		mainContent = <UserDetailsForm onCreated={() => refetchUserDetails()} />;
	}

	useEffect(() => {
		if (!session?.user) return;
		const existingUserId = window._mtm?.find(item => 'user_id' in item);
		if (!existingUserId) {
			push(['setUserId', session.user.id]);
			window._mtm?.push({ user_id: session.user.id });
		}
	}, [session]);

	return (
		<>
			<SkipLinks
				links={[
					{
						anchor: '#main',
						label: 'Contenu'
					},
					{
						anchor: '#footer',
						label: 'Pied de page'
					}
				]}
			/>
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
				className={classes.navigation}
				id="fr-header-public-header"
				quickAccessItems={light ? undefined : quickAccessItems}
				navigation={
					!!navigationItems.length && !pathname.startsWith('/public')
						? navigationItems
						: undefined
				}
				serviceTitle="Je donne mon avis"
				serviceTagline="La voix de vos usagers"
			/>

			<main id="main" role="main" tabIndex={-1}>
				{!!session?.user && (
					<Notice
						isClosable
						onClose={function noRefCheck() {}}
						style={{
							marginBottom: '-1rem'
						}}
						className={classes.notice}
						title={
							<>
								Aidez-nous à améliorer cet outil ! Faites-nous part de vos
								retours en remplissant{' '}
								<a
									title="Formulaire de retour (nouvelle fenêtre)"
									href={
										process.env.NEXT_PUBLIC_FEEDBACK_FORM_URL ||
										'https://tally.so/r/m6kyyB'
									}
									target="_blank"
								>
									ce court formulaire.
								</a>{' '}
							</>
						}
					/>
				)}
				{mainContent}
			</main>
			<div id="footer" tabIndex={-1}>
				<Footer
					accessibility="non compliant"
					accessibilityLinkProps={{
						href: '/public/accessibility'
					}}
					bottomItems={[
						{
							text: 'Données personnelles',
							linkProps: { href: '/public/cgu' }
						},
						{
							text: 'Modalités d’utilisation',
							linkProps: { href: '/public/termsOfUse' }
						},
						{
							text: 'Roadmap',
							linkProps: { href: '/public/roadmap' }
						},
						{ text: 'Contact', linkProps: { href: '/public/contact' } }
					]}
					termsLinkProps={{
						href: '/public/legalNotice'
					}}
					license={
						<>
							Le{' '}
							<a
								href="https://github.com/DISIC/jedonnemonavis.numerique.gouv.fr"
								target="_blank"
							>
								code source
							</a>{' '}
							est disponible en licence libre.
						</>
					}
				/>
			</div>
		</>
	);
}

const useStyles = tss
	.withName(PublicLayout.name)
	.withParams<{ countUserRequests: number }>()
	.create(({ countUserRequests }) => ({
		logo: {
			maxHeight: fr.spacing('11v')
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
		badgeAccess: {
			i: {
				['&::before']: {
					'--icon-size': '1rem'
				}
			}
		},
		inMenu: {
			display: 'block',
			'&:nth-of-type(2)': {
				fontSize: '0.8rem',
				color: fr.colors.decisions.text.disabled.grey.default
			}
		},
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
		notice: {
			'.fr-notice__body': {
				alignItems: 'center'
			}
		}
	}));
