import { ResetForm } from '@/src/components/auth/ResetForm';
import { AlertObservatoire } from '@/src/components/ui/AlertObservatoire';
import { fr } from '@codegouvfr/react-dsfr';
import { Breadcrumb } from '@codegouvfr/react-dsfr/Breadcrumb';
import Head from 'next/head';
import { tss } from 'tss-react/dsfr';
import { signOut, useSession } from 'next-auth/react';

export default function Login() {
	const { classes, cx } = useStyles();
	const { data: session } = useSession();

	if (session?.user) {
		signOut();
	}

	return (
		<div className={fr.cx('fr-container')}>
			<Head>
				<title>Réinitialiser votre mot de passe | Je donne mon avis</title>
				<meta
					name="description"
					content={`Réinitialiser votre mot de passe | Je donne mon avis`}
				/>
			</Head>
			<Breadcrumb
				currentPageLabel="Réinitialiser votre mot de passe"
				homeLinkProps={{
					href: '/'
				}}
				segments={[]}
			/>
			<div className={fr.cx('fr-grid-row', 'fr-grid-row--center')}>
				<div className={fr.cx('fr-col-12', 'fr-col-md-6')}>
					<h2 className={fr.cx('fr-mb-12v')}>
						Réinitialiser votre mot de passe
					</h2>
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
							<ResetForm />
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
		}
	}));
