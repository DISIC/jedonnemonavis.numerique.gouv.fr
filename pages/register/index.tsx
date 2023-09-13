import { RegisterForm } from '@/components/auth/RegisterForm';
import { fr } from '@codegouvfr/react-dsfr';
import { Alert } from '@codegouvfr/react-dsfr/Alert';
import { Breadcrumb } from '@codegouvfr/react-dsfr/Breadcrumb';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { tss } from 'tss-react/dsfr';

type UserPresetInfos = {
	firstName?: string;
	lastName?: string;
	email?: string;
};

export default function Register() {
	const router = useRouter();

	const { otp_id, registered } = router.query;

	const { classes, cx } = useStyles();

	const [userPresetInfos, setUserPresetInfos] = useState<UserPresetInfos>({});

	useEffect(() => {
		if (!!otp_id) {
			fetch(
				`/api/auth/user?${new URLSearchParams({ otp_id: otp_id as string })}`
			).then(res => {
				res.json().then(json => {
					setUserPresetInfos(json.user);
				});
			});
		}
	}, [otp_id]);

	return (
		<div className={fr.cx('fr-container')}>
			<Breadcrumb
				currentPageLabel="Création de compte"
				homeLinkProps={{
					href: '/'
				}}
				segments={[]}
			/>
			<div className={fr.cx('fr-grid-row', 'fr-grid-row--center')}>
				<div className={fr.cx('fr-col-12', 'fr-col-md-6')}>
					<h2 className={fr.cx('fr-mb-12v')}>Création de compte</h2>
					{!registered && !otp_id && (
						<Alert
							className={fr.cx('fr-mb-16v')}
							closable
							description={
								<>
									Si vous avez déjà un compte sur
									https://observatoire.numerique.gouv.fr/, vous pouvez
									maintenant gérer vos démarches sur ce site.
									<br />
									<br />{' '}
									<b>Vous n’avez pas besoin de créer un nouveau compte.</b> Il
									suffit de verifier votre ancien compte{' '}
									<Link className={fr.cx('fr-link')} href="/login">
										sur la page de connexion.
									</Link>
								</>
							}
							onClose={function noRefCheck() {}}
							severity="info"
							title="Nouvel hébergement"
						/>
					)}
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
							<RegisterForm
								userPresetInfos={userPresetInfos}
								otp_id={otp_id as string | undefined}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

const useStyles = tss
	.withName(Register.name)
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