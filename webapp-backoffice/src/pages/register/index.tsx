import { RegisterForm } from '@/src/components/auth/RegisterForm';
import { AlertObservatoire } from '@/src/components/ui/AlertObservatoire';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import { Alert } from '@codegouvfr/react-dsfr/Alert';
import { Breadcrumb } from '@codegouvfr/react-dsfr/Breadcrumb';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { tss } from 'tss-react/dsfr';

type UserPresetInfos = {
	firstName?: string;
	lastName?: string;
	email?: string;
	inviteToken?: string;
};

export default function Register() {
	const router = useRouter();

	const { otp, email, inviteToken, registered, request } = router.query;

	const { classes, cx } = useStyles();

	const [userPresetInfos, setUserPresetInfos] = useState<UserPresetInfos>({
		email: email as string,
		inviteToken: inviteToken as string
	});

	const { data: getCurrentUser } = trpc.user.me.useQuery(
		{ otp: otp as string },
		{ enabled: !!otp }
	);

	useEffect(() => {
		if (getCurrentUser?.data)
			setUserPresetInfos(getCurrentUser.data as UserPresetInfos);
	}, [getCurrentUser?.data]);

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
					{!registered && !otp && !request && <AlertObservatoire />}
					{!!request && (
						<Alert
							className={fr.cx('fr-mb-16v')}
							closable
							description={
								<>
									L’outil JDMA est réservé aux établissements publics. Votre
									adresse e-mail n’est pas reconnue comme une adresse
									d’administration publique. Si vous pensez qu’il s’agit d’une
									erreur, merci de nous décrire votre situation. Nous
									reviendrons vers vous sous 48 heures.
								</>
							}
							onClose={function noRefCheck() {}}
							severity="info"
							title=""
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
								otp={otp as string | undefined}
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
