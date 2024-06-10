import Head from 'next/head';
import { ReactNode } from 'react';

import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import { headerFooterDisplayItem } from '@codegouvfr/react-dsfr/Display';
import { SkipLinks } from '@codegouvfr/react-dsfr/SkipLinks';
import { Footer } from '@codegouvfr/react-dsfr/Footer';
import { Header, HeaderProps } from '@codegouvfr/react-dsfr/Header';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { tss } from 'tss-react/dsfr';

type PublicLayoutProps = { children: ReactNode; light: boolean };

export default function PublicLayout({ children, light }: PublicLayoutProps) {
	const { pathname } = useRouter();

	const { data: session } = useSession();

	const { data: userRequestsResult } = trpc.userRequest.getList.useQuery(
		{
			page: 1,
			numberPerPage: 0,
			displayProcessed: false
		},
		{
			enabled: session?.user.role === 'admin',
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

	const { classes, cx } = useStyles({
		countUserRequests: userRequestsResult.metadata.count
	});

	const quickAccessItems: HeaderProps.QuickAccessItem[] = [
		!session?.user
			? {
					iconId: 'fr-icon-account-line',
					linkProps: {
						href: '/login',
						target: '_self'
					},
					text: 'Connexion / Inscription'
				}
			: {
					iconId: 'ri-logout-circle-line',
					buttonProps: {
						onClick: () => {
							signOut();
						}
					},
					text: 'Déconnexion'
				}
	];

	const navigationItems = session?.user
		? !!userAdminEntityRights.metadata.count || session.user.role === 'admin'
			? [
					{
						text: 'Services',
						linkProps: {
							href: '/administration/dashboard/products',
							target: '_self'
						},
						isActive: pathname.startsWith('/administration/dashboard/product')
					},
					{
						text: 'Organisations',
						linkProps: {
							href: '/administration/dashboard/entities',
							target: '_self'
						},
						isActive: pathname.startsWith('/administration/dashboard/entities')
					}
				]
			: []
		: [];

	if (session?.user.role === 'admin') {
		const adminNavigationItems = [
			{
				text: 'Utilisateurs',
				linkProps: {
					href: '/administration/dashboard/users',
					target: '_self'
				},
				isActive: pathname == '/administration/dashboard/users'
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
				text: "Demandes d'accès",
				linkProps: {
					href: '/administration/dashboard/user-requests',
					target: '_self',
					id: 'fr-header-public-header-main-navigation-link-badge',
					title: `Demandes d'accès (${userRequestsResult.metadata.count} ${userRequestsResult.metadata.count > 1 ? 'demandes' : 'demande'})`,
					'aria-label': `Demandes d'accès (${userRequestsResult.metadata.count} ${userRequestsResult.metadata.count > 1 ? 'demandes' : 'demande'})`
				},
				isActive: pathname == '/administration/dashboard/user-requests'
			}
		];
		navigationItems.push(...adminNavigationItems);
	}

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
				navigation={!!navigationItems.length ? navigationItems : undefined}
				serviceTitle="Je donne mon avis"
				serviceTagline="La voix de vos usagers"
			/>
			<main id="main" role="main" tabIndex={-1}>
				{children}
			</main>
			<div id="footer" tabIndex={-1}>
				<Footer
					accessibility="partially compliant"
					bottomItems={[
						{ text: 'Données personnelles', linkProps: { href: '/cgu' } },
						{ text: 'Contact', linkProps: { href: '/contact' } }
					]}
					termsLinkProps={{
						href: '/legalNotice'
					}}
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
		navigation: countUserRequests
			? {
					'.fr-nav__link#fr-header-public-header-main-navigation-link-badge': {
						position: 'relative',
						'&::after': {
							content: `"${countUserRequests.toString()}"`, // displaying the number 2
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
					}
				}
			: {}
	}));
