import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react/dsfr';
import { Breadcrumb } from '@codegouvfr/react-dsfr/Breadcrumb';
import { Alert } from '@codegouvfr/react-dsfr/Alert';
import { LoginForm } from '@/src/components/auth/LoginForm';

export default function Login() {
	const { classes, cx } = useStyles();

	return (
		<div className={fr.cx('fr-container')}>
			<Breadcrumb
				currentPageLabel="Connexion"
				homeLinkProps={{
					href: '/'
				}}
				segments={[]}
			/>
			<div className={fr.cx('fr-grid-row', 'fr-grid-row--center')}>
				<div className={fr.cx('fr-col-12', 'fr-col-md-6')}>
					<h2 className={fr.cx('fr-mb-12v')}>Connexion</h2>
					<Alert
						className={fr.cx('fr-mb-16v')}
						closable
						description={
							<>
								Si vous avez déjà un compte sur
								https://observatoire.numerique.gouv.fr/, vous pouvez maintenant
								gérer vos démarches sur ce site.
								<br />
								<br /> Taper ci-dessous le même adresse e-mail que vous avez
								utilisé sur l’Observatoire et nous vous enverrons un e-mail avec
								un mot de passe temporaire pour transférer votre compte sur ce
								site.
							</>
						}
						onClose={function noRefCheck() {}}
						severity="info"
						title="Nouvel hébergement"
					/>
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
							<LoginForm />
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
