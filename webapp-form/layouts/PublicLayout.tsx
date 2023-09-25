import Head from 'next/head';
import { ReactNode } from 'react';
import Image from 'next/image';
import { Footer } from '@codegouvfr/react-dsfr/Footer';
import { Header } from '@codegouvfr/react-dsfr/Header';
import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react/dsfr';

export default function PublicLayout({ children }: { children: ReactNode }) {
	const { classes, cx } = useStyles();

	return (
		<>
			<Head>
				<title>Je donne mon avis</title>
				<meta name="description" content="Je donne mon avis" />
			</Head>
			<Header
				brandTop={
					<>
						REPUBLIQUE
						<br />
						FRANCAISE
					</>
				}
				homeLinkProps={{
					href: '/',
					title: 'Accueil'
				}}
				id="fr-header-public-header"
				serviceTitle={
					<>
						<Image
							className={classes.logo}
							alt="Service public +"
							src="/assets/services-plus.svg"
							title="Service public + logo"
							width={830}
							height={250}
						/>
					</>
				}
				serviceTagline=""
			/>
			<main id="main" role="main">
				{children}
			</main>
			<Footer accessibility="non compliant" />
		</>
	);
}

const useStyles = tss
	.withName(PublicLayout.name)
	.withParams()
	.create(() => ({
		logo: {
			maxHeight: fr.spacing('11v'),
			width: '100%'
		}
	}));
