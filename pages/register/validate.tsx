import { fr } from '@codegouvfr/react-dsfr';
import { Breadcrumb } from '@codegouvfr/react-dsfr/Breadcrumb';
import { User } from '@prisma/client';
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

	const { token } = router.query;

	const { classes, cx } = useStyles();

	const [validationStatus, setValidationStatus] = useState<
		'success' | 'error' | undefined
	>();
	const [userValidated, setUserValidated] = useState<User | undefined>();

	const validateUser = () => {
		fetch(
			`/api/auth/validate?${new URLSearchParams({ token: token as string })}`
		).then(res => {
			if (res.status === 200) {
				res.json().then(json => {
					setValidationStatus('success');
					setUserValidated(json.user);
				});
			} else {
				setValidationStatus('error');
			}
		});
	};

	useEffect(() => {
		if (token) validateUser();
	}, [token]);

	const displayContent = () => {
		if (!token) return <p>Votre lien est invalide</p>;

		if (!validationStatus) return <p>...</p>;

		if (validationStatus === 'error')
			return <p>Votre lien semble invalide ou expiré.</p>;

		return (
			<p>
				Bravo {userValidated?.firstName}!<br />
				<br /> Votre compte a été validé avec success,{' '}
				<Link className={fr.cx('fr-link')} href="/login">
					connectez-vous dès maintenant
				</Link>{' '}
				pour accéder à votre espace d&apos;administration.
			</p>
		);
	};

	return (
		<div className={fr.cx('fr-container')}>
			<Breadcrumb
				currentPageLabel="Validation du compte"
				homeLinkProps={{
					href: '/'
				}}
				segments={[
					{
						label: 'Création de compte',
						linkProps: { href: '/register' }
					}
				]}
			/>
			<div className={fr.cx('fr-grid-row', 'fr-grid-row--center')}>
				<div className={fr.cx('fr-col-12', 'fr-col-md-6')}>
					<h2 className={fr.cx('fr-mb-12v')}>Validation de votre compte</h2>
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
							{displayContent()}
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
