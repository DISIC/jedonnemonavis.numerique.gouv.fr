import { fr } from '@codegouvfr/react-dsfr';
import React, { useEffect, useState } from 'react';
import { tss } from 'tss-react/dsfr';
import { SideMenu } from '@codegouvfr/react-dsfr/SideMenu';
import { useRouter } from 'next/router';
import { Toast } from '@/src/components/ui/Toast';
import { User } from '@/prisma/generated/zod';
import { useSession } from 'next-auth/react';

interface ProductLayoutProps {
	children: React.ReactNode;
	user: User;
}

interface MenuItems {
	text: string;
	linkProps: {
		href: string;
		alt?: string;
	};
	isActive?: boolean;
}

const AccountLayout = ({ children, user }: ProductLayoutProps) => {
	const { id } = user;

	const [displayToast, setDisplayToast] = useState(false);
	const [showBackToTop, setShowBackToTop] = useState(false);

	const router = useRouter();

	const { data: session } = useSession();

	const { cx, classes } = useStyles();

	const menuItems: MenuItems[] = [
		{
			text: 'Informations',
			isActive:
				router.pathname === `/administration/dashboard/account/[id]/infos`,
			linkProps: {
				href: `/administration/dashboard/account/${session?.user.id}/infos`,
				alt: 'Informations'
			}
		},
		{
			text: 'Notifications',
			isActive:
				router.pathname ===
				`/administration/dashboard/account/[id]/notifications`,
			linkProps: {
				href: `/administration/dashboard/account/${session?.user.id}/notifications`,
				alt: 'Notifications'
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
			<div className={cx(classes.title)}>
				<h1 className={fr.cx('fr-mb-2v', 'fr-mt-8v')} id="product-title">
					Compte
				</h1>
			</div>
			<div className={cx(fr.cx('fr-grid-row'), classes.children)}>
				<div className={fr.cx('fr-col-12', 'fr-col-md-3')}>
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
		...fr.spacing('margin', { bottom: '7w' })
	},
	container: {
		height: '100%'
	},
	children: {
		minHeight: '40rem'
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
