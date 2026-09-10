import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { push } from '@socialgouv/matomo-next';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
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
	const { asPath } = useRouter();

	const titleId = `${id}-title`;
	const currentPath = asPath.split(/[?#]/)[0];

	const links = [
		{
			href: `/administration/dashboard/user/${userId}/infos`,
			icon: 'fr-icon-user-line' as const,
			text: 'Informations personnelles'
		},
		{
			href: `/administration/dashboard/user/${userId}/notifications`,
			icon: 'fr-icon-notification-3-line' as const,
			text: 'Notifications'
		}
	];

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
					{links.map(({ href, icon, text }) => (
						<li key={href}>
							<Link
								href={href}
								aria-current={currentPath === href ? 'page' : undefined}
								className={cx(fr.cx(icon, 'fr-link--icon-left'), classes.link)}
							>
								{text}
							</Link>
						</li>
					))}
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
		color: fr.colors.decisions.text.label.grey.default,
		'&[aria-current]': {
			color: fr.colors.decisions.text.active.blueFrance.default,
			boxShadow: `inset 2px 0 0 0 ${fr.colors.decisions.background.active.blueFrance.default}`
		}
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
