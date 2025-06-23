import { fr } from '@codegouvfr/react-dsfr';
import Badge from '@codegouvfr/react-dsfr/Badge';
import SideMenu, { SideMenuProps } from '@codegouvfr/react-dsfr/SideMenu';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import { tss } from 'tss-react/dsfr';

interface NewsLayoutProps {
	children: React.ReactNode;
}

const NewsLayout = ({ children }: NewsLayoutProps) => {
	const router = useRouter();
	const { cx, classes } = useStyles();

	const menuItems: SideMenuProps.Item[] = [
		{
			text: (
				<>
					Dernières fonctionnalités
					<Badge
						as="span"
						severity="new"
						small
						className={cx(classes.badge, fr.cx('fr-ml-2v'))}
					>
						1
					</Badge>
				</>
			),
			isActive: router.pathname === '/administration/dashboard/news',
			linkProps: {
				href: '/administration/dashboard/news'
			}
		},
		{
			text: 'À venir',
			isActive: router.pathname === '/administration/dashboard/news/upcoming',
			linkProps: {
				href: '/administration/dashboard/news/upcoming'
			}
		}
		// {
		// 	text: 'Vos suggestions',
		// 	isActive:
		// 		router.pathname === '/administration/dashboard/news/suggestions',
		// 	linkProps: {
		// 		href: '/administration/dashboard/news/suggestions'
		// 	}
		// }
	];

	return (
		<div className={cx(fr.cx('fr-container', 'fr-my-4w'), classes.container)}>
			<Head>
				<title>{`Nouveautés | Formulaires | Je donne mon avis`}</title>
				<meta
					name="description"
					content={`Nouveautés | Formulaires | Je donne mon avis`}
				/>
			</Head>

			<div className={cx(classes.title)}>
				<h1 className={fr.cx('fr-mb-2v')} id="news-title">
					Nouveautés
				</h1>
			</div>
			<div className={cx(fr.cx('fr-grid-row'), classes.children)}>
				<div className={fr.cx('fr-col-12', 'fr-col-md-4')}>
					<div role="navigation">
						<SideMenu
							align="left"
							aria-label="Menu latéral"
							items={menuItems}
							burgerMenuButtonText="Menu"
							sticky
						/>
					</div>
				</div>
				<div className={fr.cx('fr-col-12', 'fr-col-md-8', 'fr-mb-12v')}>
					{children}
				</div>
			</div>
		</div>
	);
};

const useStyles = tss.create({
	title: {
		...fr.spacing('margin', { bottom: '12v' })
	},
	container: {
		height: '100%'
	},
	children: {
		minHeight: '40rem',
		[fr.breakpoints.down('md')]: {
			minHeight: 'auto'
		}
	},
	badge: {
		i: {
			['&::before']: {
				'--icon-size': '1rem'
			}
		}
	},
	backToTop: {
		position: 'sticky',
		bottom: fr.spacing('10v'),
		display: 'flex',
		justifyContent: 'end',
		marginTop: fr.spacing('10v'),
		'& > div': {
			backgroundColor: fr.colors.decisions.background.default.grey.default,
			borderRadius: fr.spacing('2v'),
			padding: fr.spacing('2v')
		}
	}
});

export default NewsLayout;
