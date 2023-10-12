import Head from 'next/head';
import { ReactNode } from 'react';

import { Header, HeaderProps } from '@codegouvfr/react-dsfr/Header';
import { Footer } from '@codegouvfr/react-dsfr/Footer';
import { headerFooterDisplayItem } from '@codegouvfr/react-dsfr/Display';
import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react/dsfr';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';

export default function PublicLayout({ children }: { children: ReactNode }) {
	const { classes, cx } = useStyles();
	const { pathname } = useRouter();

	const { data: session } = useSession();

	const quickAccessItems: HeaderProps.QuickAccessItem[] = [
		!pathname.startsWith('/administration')
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

	const navigationItems = [];

	if (session?.user.role === 'admin') {
		const adminNavigationItems = [
			{
				text: 'Démarches',
				linkProps: {
					href: '/administration/dashboard/products',
					target: '_self'
				},
				isActive: pathname.startsWith('/administration/dashboard/product')
			},
			{
				text: 'Utilisateurs',
				linkProps: {
					href: '/administration/dashboard/users',
					target: '_self'
				},
				isActive: pathname == '/administration/dashboard/users'
			}
		];
		navigationItems.push(...adminNavigationItems);
	}

	return (
		<>
			<Head>
				<title>Je donne mon avis</title>
				<meta name="description" content="Je donne mon avis" />
			</Head>
			<Header
				brandTop={
					<>
						REPUBLIQUE <br /> FRANCAISE
					</>
				}
				homeLinkProps={{
					href: '/',
					title: 'Accueil'
				}}
				id="fr-header-public-header"
				quickAccessItems={quickAccessItems}
				navigation={navigationItems}
				serviceTitle="Je donne mon avis"
				serviceTagline="baseline - précisions sur l'organisation"
			/>
			<main id="main" role="main">
				{children}
			</main>
			<Footer
				accessibility="non compliant"
				bottomItems={[headerFooterDisplayItem]}
			/>
		</>
	);
}

const useStyles = tss
	.withName(PublicLayout.name)
	.withParams()
	.create(() => ({
		logo: {
			maxHeight: fr.spacing('11v')
		}
	}));
