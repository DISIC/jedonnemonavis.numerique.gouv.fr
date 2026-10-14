import { ProConnectLogin } from '@/src/components/auth/ProConnectLogin';
import { isProConnectNoticeVisible } from '@/src/utils/proconnect';
import { fr } from '@codegouvfr/react-dsfr';
import { Breadcrumb } from '@codegouvfr/react-dsfr/Breadcrumb';
import Head from 'next/head';

interface Props {
	showSecurityNotice: boolean;
}

export default function Login({ showSecurityNotice }: Props) {
	return (
		<div className={fr.cx('fr-container')}>
			<Head>
				<title>Login | Je donne mon avis</title>
				<meta name="description" content="Login | Je donne mon avis" />
			</Head>
			<Breadcrumb
				currentPageLabel="Connexion"
				homeLinkProps={{
					href: '/'
				}}
				segments={[]}
			/>
			<div className={fr.cx('fr-grid-row', 'fr-grid-row--center')}>
				<div className={fr.cx('fr-col-12', 'fr-col-md-6')}>
					<h1 className={fr.cx('fr-mb-8v')}>Se connecter</h1>
					<ProConnectLogin showSecurityNotice={showSecurityNotice} />
				</div>
			</div>
		</div>
	);
}

export const getServerSideProps = () => ({
	props: { showSecurityNotice: isProConnectNoticeVisible() }
});
