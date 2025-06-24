import { Toast } from '@/src/components/ui/Toast';
import { fr } from '@codegouvfr/react-dsfr';
import Badge from '@codegouvfr/react-dsfr/Badge';
import Breadcrumb from '@codegouvfr/react-dsfr/Breadcrumb';
import { SideMenu, SideMenuProps } from '@codegouvfr/react-dsfr/SideMenu';
import { Product, RightAccessStatus } from '@prisma/client';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { tss } from 'tss-react/dsfr';

interface ProductLayoutProps {
	children: React.ReactNode;
	product: Product;
	ownRight: Exclude<RightAccessStatus, 'removed'>;
	hideMenu?: Boolean;
}

const ProductLayout = ({
	children,
	product,
	ownRight,
	hideMenu
}: ProductLayoutProps) => {
	const { id } = product;

	const [displayToast, setDisplayToast] = useState(false);
	const [showBackToTop, setShowBackToTop] = useState(false);

	const router = useRouter();

	const { cx, classes } = useStyles();

	const breadcrumbSegments = [
		{
			label: 'Services',
			linkProps: {
				href: '/administration/dashboard/products'
			}
		}
	];

	const menuItems: SideMenuProps.Item[] = [
		{
			text: 'Formulaires',
			isActive:
				router.pathname === `/administration/dashboard/product/[id]/forms`,
			linkProps: {
				href: `/administration/dashboard/product/${id}/forms`
			}
		},
		{
			text: "Droits d'accès",
			isActive:
				router.pathname === `/administration/dashboard/product/[id]/access`,
			linkProps: {
				href: `/administration/dashboard/product/${id}/access`
			}
		},
		{
			text: 'Informations',
			isActive:
				router.pathname === `/administration/dashboard/product/[id]/infos`,
			linkProps: {
				href: `/administration/dashboard/product/${id}/infos`
			}
		},
		{
			text: ownRight && ownRight === 'carrier_admin' ? 'Clés API' : 'Clés API',
			isActive:
				router.pathname === `/administration/dashboard/product/[id]/api_keys`,
			linkProps: {
				href: `/administration/dashboard/product/${id}/api_keys`
			}
		},
		{
			text: "Historique d'activité",
			isActive:
				router.pathname === `/administration/dashboard/product/[id]/logs`,
			linkProps: {
				href: `/administration/dashboard/product/${id}/logs`
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
		<div className={cx(fr.cx('fr-container', 'fr-my-4w'), classes.container)}>
			<Breadcrumb
				currentPageLabel={'Service : ' + product.title}
				segments={breadcrumbSegments}
				className={fr.cx('fr-mb-4v')}
			/>
			<Toast
				isOpen={displayToast}
				setIsOpen={setDisplayToast}
				autoHideDuration={2000}
				severity="info"
				message="Identifiant copié dans le presse papier !"
			/>
			<div className={cx(classes.title)}>
				<h1 className={fr.cx('fr-mb-2v')} id="product-title">
					{product.title}
				</h1>
				{product.isTop250 && (
					<Badge severity="info" noIcon>
						Démarche essentielle
					</Badge>
				)}
			</div>
			<div className={cx(fr.cx('fr-grid-row'), classes.children)}>
				<div
					className={fr.cx(
						'fr-col-12',
						!hideMenu ? 'fr-col-md-3' : 'fr-hidden',
						'fr-mb-6v',
						'fr-mb-md-0'
					)}
				>
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
				<div
					className={fr.cx(
						'fr-col-12',
						!hideMenu ? 'fr-col-md-9' : 'fr-col-md-12',
						'fr-mb-12v'
					)}
				>
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

export default ProductLayout;
