import { OTPForm } from '@/components/auth/OTPForm';
import { fr } from '@codegouvfr/react-dsfr';
import { Breadcrumb } from '@codegouvfr/react-dsfr/Breadcrumb';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { tss } from 'tss-react/dsfr';

export default function OTP() {
	const router = useRouter();
	const { email } = router.query;

	const { classes, cx } = useStyles();

	useEffect(() => {
		if (!email) router.push('/login');
	}, [email]);

	return (
		<div className={fr.cx('fr-container')}>
			<Breadcrumb
				currentPageLabel="Validation de compte"
				homeLinkProps={{
					href: '/'
				}}
				segments={[
					{
						label: 'Connexion',
						linkProps: { href: '/login' }
					}
				]}
			/>
			<div className={fr.cx('fr-grid-row', 'fr-grid-row--center')}>
				<div className={fr.cx('fr-col-12', 'fr-col-md-6')}>
					<div className={fr.cx('fr-mb-10v')}>
						<h2>Valider votre compte</h2>
						<p>
							Vous recevrez un courriel dans quelques instants à l&apos;adresse
							e-mail saisie avec un mot de passe temporaire afin de valider
							votre compte et le transférer sur le nouveau site Je donne mon
							avis.
						</p>
					</div>
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
							<OTPForm email={email as string} />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

const useStyles = tss
	.withName(OTP.name)
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
