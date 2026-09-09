import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { push } from '@socialgouv/matomo-next';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { tss } from 'tss-react/dsfr';

type HeaderMobileAccountMenuProps = {
	id: string;
	userId: string;
	userName?: string | null;
	userEmail?: string | null;
};

export default function HeaderMobileAccountMenu({
	id,
	userId,
	userName,
	userEmail
}: HeaderMobileAccountMenuProps) {
	const { classes, cx } = useStyles();

	const titleId = `${id}-title`;

	return (
		<div className={cx(classes.root, fr.cx('fr-hidden-lg'))}>
			<nav id={id} aria-labelledby={titleId} className={classes.nav}>
				<p
					id={titleId}
					className={cx(fr.cx('fr-text--bold', 'fr-mb-0'), classes.title)}
				>
					Compte
				</p>
				<ul className={classes.list}>
					<li>
						<Link
							href={`/administration/dashboard/user/${userId}/infos`}
							className={cx(
								fr.cx('fr-icon-user-line', 'fr-link--icon-left'),
								classes.link
							)}
						>
							Informations personnelles
						</Link>
					</li>
					<li>
						<Link
							href={`/administration/dashboard/user/${userId}/notifications`}
							className={cx(
								fr.cx('fr-icon-notification-3-line', 'fr-link--icon-left'),
								classes.link
							)}
						>
							Notifications
						</Link>
					</li>
				</ul>
			</nav>
			<div className={classes.identity}>
				<p className={fr.cx('fr-text--bold', 'fr-mb-0')}>{userName}</p>
				<p className={cx(fr.cx('fr-text--sm', 'fr-mb-4v'), classes.email)}>
					{userEmail}
				</p>
				<Button
					className={classes.logout}
					iconId="fr-icon-logout-box-r-line"
					priority="tertiary"
					onClick={() => {
						signOut();
						push(['trackEvent', 'Account', 'Disconnect']);
					}}
				>
					Se déconnecter
				</Button>
			</div>
		</div>
	);
}

const useStyles = tss.withName({ HeaderMobileAccountMenu }).create(() => ({
	root: {
		display: 'flex',
		flexDirection: 'column',
		flex: 1
	},
	nav: {
		'.fr-nav + div > &': {
			borderTop: `1px solid ${fr.colors.decisions.border.default.grey.default}`
		}
	},
	title: {
		padding: `${fr.spacing('3v')} ${fr.spacing('4v')}`
	},
	list: {
		listStyle: 'none',
		margin: 0,
		padding: 0
	},
	link: {
		display: 'flex',
		alignItems: 'center',
		padding: `${fr.spacing('3v')} ${fr.spacing('4v')}`,
		backgroundImage: 'none',
		textDecoration: 'none',
		color: fr.colors.decisions.text.label.grey.default
	},
	identity: {
		marginTop: 'auto',
		paddingTop: fr.spacing('4v'),
		borderTop: `1px solid ${fr.colors.decisions.border.default.grey.default}`
	},
	logout: {
		width: '100%',
		justifyContent: 'center'
	},
	email: {
		color: fr.colors.decisions.text.mention.grey.default
	}
}));
