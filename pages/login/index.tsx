import { fr } from '@codegouvfr/react-dsfr';
import { makeStyles } from '@codegouvfr/react-dsfr/tss';
import { Breadcrumb } from '@codegouvfr/react-dsfr/Breadcrumb';
import { Alert } from '@codegouvfr/react-dsfr/Alert';
import { Input } from '@codegouvfr/react-dsfr/Input';
import { Button } from '@codegouvfr/react-dsfr/Button';

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
							classes.loginContainer,
							fr.cx(
								'fr-grid-row',
								'fr-grid-row--center',
								'fr-py-16v',
								'fr-mb-16v'
							)
						)}
						style={{
							backgroundColor: fr.colors.decisions.background.alt.grey.default
						}}
					>
						<div
							className={fr.cx(
								'fr-col-12',
								'fr-col-md-8',
								'fr-px-4v',
								'fr-px-md-0'
							)}
						>
							<h4>Connexion</h4>
							<h5>Se connecter avec son compte</h5>
							<Input
								hintText="Format attendu : nom@domaine.fr"
								label="Adresse email"
								state="default"
								stateRelatedMessage="Text de validation / d'explication de l'erreur"
							/>
							<Button
								style={{ width: '100%', justifyContent: 'center' }}
								onClick={function noRefCheck() {}}
							>
								Continuer
							</Button>
							<hr className={fr.cx('fr-mt-8v', 'fr-mb-2v')} />
							<h5>Vous n&apos;avez pas de compte ?</h5>
							<Button
								style={{ width: '100%', justifyContent: 'center' }}
								onClick={function noRefCheck() {}}
								priority="secondary"
							>
								Créer un compte
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

const useStyles = makeStyles()(theme => ({
	loginContainer: {
		backgroundColor: theme.decisions.background.alt.grey.default,
		[fr.breakpoints.down('md')]: {
			marginLeft: `-${fr.spacing('4v')}`,
			marginRight: `-${fr.spacing('4v')}`
		}
	}
}));
