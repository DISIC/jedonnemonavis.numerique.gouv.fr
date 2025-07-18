import { User } from '@/prisma/generated/zod';
import { Toast } from '@/src/components/ui/Toast';
import { fr } from '@codegouvfr/react-dsfr';
import Breadcrumb from '@codegouvfr/react-dsfr/Breadcrumb';
import { SideMenu, SideMenuProps } from '@codegouvfr/react-dsfr/SideMenu';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { tss } from 'tss-react/dsfr';

interface ProductLayoutProps {
	isOwn?: Boolean;
	user: User;
	children: React.ReactNode;
}

const AccountLayout = ({ children, isOwn, user }: ProductLayoutProps) => {
	const [displayToast, setDisplayToast] = useState(false);
	const [showBackToTop, setShowBackToTop] = useState(false);

	const router = useRouter();

	const { data: session } = useSession();

	const { cx, classes } = useStyles();

	const menuItems: SideMenuProps.Item[] = isOwn
		? [
				{
					text: 'Informations',
					isActive:
						router.pathname === `/administration/dashboard/user/[id]/infos`,
					linkProps: {
						href: `/administration/dashboard/user/${session?.user.id}/infos`
					}
				},
				{
					text: 'Notifications',
					isActive:
						router.pathname ===
						`/administration/dashboard/user/[id]/notifications`,
					linkProps: {
						href: `/administration/dashboard/user/${session?.user.id}/notifications`
					}
				}
			]
		: [
				{
					text: 'Compte',
					isActive:
						router.pathname === `/administration/dashboard/user/[id]/account`,
					linkProps: {
						href: `/administration/dashboard/user/${user.id}/account`
					}
				},
				{
					text: 'Accès',
					isActive:
						router.pathname === `/administration/dashboard/user/[id]/access`,
					linkProps: {
						href: `/administration/dashboard/user/${user.id}/access`
					}
				}
			];

	useEffect(() => {
		const handleScroll = () => {
			if (window.scrollY > 800) {
				setShowBackToTop(true);
			} else {
				setShowBackToTop(false);
			}
		};

		window.addEventListener('scroll', handleScroll);

		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	}, []);

	return (
		<div className={cx(fr.cx('fr-container'), classes.container)}>
			<Toast
				isOpen={displayToast}
				setIsOpen={setDisplayToast}
				autoHideDuration={2000}
				severity="info"
				message="Identifiant copié dans le presse papier !"
			/>
			<div className={cx(fr.cx('fr-mt-10v'), classes.title)}>
				{!isOwn && (
					<Breadcrumb
						currentPageLabel={`${user.firstName} ${user.lastName}`}
						segments={[
							{
								label: 'Utilisateurs',
								linkProps: {
									href: '/administration/dashboard/users'
								}
							}
						]}
						style={{ marginBottom: fr.spacing('6v') }}
					/>
				)}
				<h1 className={fr.cx('fr-mb-2v', 'fr-mt-6v')} id="account-title">
					{isOwn ? 'Compte' : `${user.firstName} ${user.lastName}`}
				</h1>
			</div>
			<div className={cx(fr.cx('fr-grid-row'), classes.children)}>
				<div className={fr.cx('fr-col-12', 'fr-col-md-3', 'fr-mb-6v')}>
					<SideMenu
						align="left"
						aria-label="Menu latéral"
						items={menuItems}
						burgerMenuButtonText="Menu"
						sticky
					/>
				</div>
				<div className={fr.cx('fr-col-12', 'fr-col-md-9', 'fr-mb-12v')}>
					{children}
					{router.pathname.includes('/stats') && showBackToTop && (
						<div className={cx(classes.backToTop)}>
							<div>
								<a
									className={fr.cx(
										'fr-link',
										'fr-icon-arrow-up-fill',
										'fr-link--icon-left'
									)}
									href="#product-title"
								>
									Haut de page
								</a>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

const useStyles = tss.create({
	title: {
		...fr.spacing('margin', { bottom: '6v' })
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

export default AccountLayout;
