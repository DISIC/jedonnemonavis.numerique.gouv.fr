import { getSafeCallbackUrl } from '@/src/utils/tools';
import { fr } from '@codegouvfr/react-dsfr';
import Alert from '@codegouvfr/react-dsfr/Alert';
import { ProConnectButton } from '@codegouvfr/react-dsfr/ProConnectButton';
import { push } from '@socialgouv/matomo-next';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { tss } from 'tss-react/dsfr';

const CONTACT_EMAIL = 'contact.jdma@design.numerique.gouv.fr';

interface Props {
	showSecurityNotice: boolean;
}

export const ProConnectLogin = ({ showSecurityNotice }: Props) => {
	const router = useRouter();
	const { error, callbackUrl } = router.query;
	const { classes, cx } = useStyles();

	return (
		<>
			{showSecurityNotice && (
				<div className={cx(classes.notice, fr.cx('fr-p-6v', 'fr-mb-8v'))}>
					<span className={classes.noticeIconFrame}>
						<span
							className={fr.cx('ri-login-box-line', 'fr-icon--lg')}
							aria-hidden="true"
						/>
					</span>
					<p className={cx(classes.noticeText, fr.cx('fr-mb-0'))}>
						Pour des raisons de sécurité, l’identification se fait désormais
						uniquement via le service ProConnect. Utilisez votre adresse email
						professionnelle.
						<br />
						<br />
						En cas de problème, contactez :{' '}
						<a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
					</p>
				</div>
			)}
			<div
				className={cx(
					classes.loginBox,
					fr.cx('fr-p-6v', 'fr-p-md-14v', 'fr-mb-16v')
				)}
			>
				{error === 'MFA_REQUIRED' && (
					<Alert
						severity="error"
						className={fr.cx('fr-mb-6v')}
						title="Double authentification requise"
						description="Vous ne pouvez pas accéder au service sans avoir une double authentification installée. Veuillez installer une application d'authentification et vous connecter à nouveau."
					/>
				)}
				<h2 className={fr.cx('fr-h5', 'fr-mb-6v')}>Avec ProConnect</h2>
				<p className={fr.cx('fr-text--sm', 'fr-mb-6v')}>
					ProConnect est la solution proposée par l’État qui vous identifie en
					tant que professionnel.
				</p>
				<ProConnectButton
					className={classes.button}
					onClick={() => {
						push(['trackEvent', 'BO - Auth', 'Login-ProConnect']);
						signIn('openid', { callbackUrl: getSafeCallbackUrl(callbackUrl) });
					}}
				/>
			</div>
		</>
	);
};

const useStyles = tss.withName({ ProConnectLogin }).create(() => ({
	notice: {
		display: 'flex',
		alignItems: 'center',
		gap: fr.spacing('6v'),
		backgroundColor: fr.colors.decisions.artwork.decorative.blueFrance.default
	},
	noticeText: {
		minWidth: 0,
		overflowWrap: 'anywhere'
	},
	noticeIconFrame: {
		display: 'flex',
		flexShrink: 0,
		padding: fr.spacing('2v'),
		borderRadius: '50%',
		backgroundColor: fr.colors.decisions.background.default.grey.default,
		color: fr.colors.decisions.text.title.blueFrance.default
	},
	loginBox: {
		backgroundColor: fr.colors.decisions.background.alt.grey.default
	},
	button: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center'
	}
}));
