import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { push } from '@socialgouv/matomo-next';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';
import { tss } from 'tss-react/dsfr';
import { HELP_MENU_LINKS, HeaderMenuLink } from '@/src/utils/helpers';
import { stripQueryAndHash } from '@/src/utils/tools';

type HeaderMobileMenuProps = {
	id: string;
	isAdmin: boolean;
	userId: string;
	userName?: string | null;
	userEmail?: string | null;
	navigation?: ReactNode;
};

export default function HeaderMobileMenu({
	id,
	isAdmin,
	userId,
	userName,
	userEmail,
	navigation
}: HeaderMobileMenuProps) {
	const { classes, cx } = useStyles();
	const currentPath = stripQueryAndHash(useRouter().asPath);

	const helpId = `${id}-help`;
	const accountId = `${id}-account`;

	const accountLinks: HeaderMenuLink[] = [
		{
			label: 'Informations personnelles',
			href: `/administration/dashboard/user/${userId}/infos`,
			iconId: 'fr-icon-user-line',
			isExternal: false
		},
		{
			label: 'Notifications',
			href: `/administration/dashboard/user/${userId}/notifications`,
			iconId: 'fr-icon-notification-3-line',
			isExternal: false
		}
	];

	const renderLinks = (links: HeaderMenuLink[]) => (
		<ul className={classes.list}>
			{links.map(({ label, href, iconId, isExternal }) => (
				<li key={label}>
					<Link
						href={href}
						aria-current={
							!isExternal && href === currentPath ? 'page' : undefined
						}
						{...(isExternal
							? {
									target: '_blank',
									rel: 'noopener noreferrer',
									'aria-label': `${label} (nouvelle fenêtre)`
							  }
							: {})}
						className={cx(fr.cx(iconId, 'fr-link--icon-left'), classes.link)}
					>
						{label}
					</Link>
				</li>
			))}
		</ul>
	);

	return (
		<>
			{!isAdmin && (
				<nav
					id={helpId}
					aria-labelledby={`${helpId}-title`}
					className={cx(classes.helpSection, fr.cx('fr-hidden-lg'))}
				>
					<p
						id={`${helpId}-title`}
						className={cx(fr.cx('fr-text--bold', 'fr-mb-0'), classes.title)}
					>
						Aide &amp; Ressources
					</p>
					{renderLinks(HELP_MENU_LINKS)}
				</nav>
			)}
			{navigation}
			<nav
				id={accountId}
				aria-labelledby={`${accountId}-title`}
				className={cx(classes.accountSection, fr.cx('fr-hidden-lg'))}
			>
				<p
					id={`${accountId}-title`}
					className={cx(fr.cx('fr-text--bold', 'fr-mb-0'), classes.title)}
				>
					Compte
				</p>
				{renderLinks(accountLinks)}
			</nav>
			<div className={cx(classes.identity, fr.cx('fr-hidden-lg'))}>
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
		</>
	);
}

const useStyles = tss.withName({ HeaderMobileMenu }).create(() => ({
	helpSection: {
		[fr.breakpoints.down('lg')]: {
			'& + .fr-nav': {
				marginTop: fr.spacing('2v'),
				borderTop: `1px solid ${fr.colors.decisions.border.default.grey.default}`
			}
		}
	},
	accountSection: {
		paddingTop: fr.spacing('2v'),
		paddingBottom: fr.spacing('2v'),
		borderTop: `1px solid ${fr.colors.decisions.border.default.grey.default}`
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
		'--hover-tint': fr.colors.decisions.background.default.grey.hover,
		'--active-tint': fr.colors.decisions.background.default.grey.active,
		'&[aria-current="page"]': {
			color: fr.colors.decisions.text.active.blueFrance.default
		}
	},
	identity: {
		marginTop: 'auto',
		paddingTop: fr.spacing('5v'),
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
