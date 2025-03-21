import { LoginForm } from '@/src/components/auth/LoginForm';
import { AlertObservatoire } from '@/src/components/ui/AlertObservatoire';
import { fr } from '@codegouvfr/react-dsfr';
import { Breadcrumb } from '@codegouvfr/react-dsfr/Breadcrumb';
import Head from 'next/head';
import { tss } from 'tss-react/dsfr';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { ProconnectError } from '@/src/components/auth/ProConnectError';

export default function Login() {
	const { classes, cx } = useStyles();
	const router = useRouter();
	const { error } = router.query;

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
					<h1 className={fr.cx('fr-mb-12v')}>Connexion</h1>
					<div
						className={cx(
							classes.formContainer,
							fr.cx(
								'fr-grid-row',
								'fr-grid-row--center',
								'fr-py-16v',
								'fr-mb-16v'
							)
						)}
					>
						<div
							className={fr.cx(
								'fr-col-12',
								'fr-col-md-8',
								'fr-px-4v',
								'fr-px-md-0'
							)}
						>
							{error === 'INVALID_PROVIDER' ? (
								<ProconnectError />
							) : (
								<LoginForm />
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

const useStyles = tss
	.withName(Login.name)
	.withParams()
	.create(() => ({
		formContainer: {
			backgroundColor: fr.colors.decisions.background.alt.grey.default,
			[fr.breakpoints.down('md')]: {
				marginLeft: `-${fr.spacing('4v')}`,
				marginRight: `-${fr.spacing('4v')}`
			}
		}
	}));
