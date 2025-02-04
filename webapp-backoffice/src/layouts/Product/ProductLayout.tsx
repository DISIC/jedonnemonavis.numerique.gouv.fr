import { fr } from '@codegouvfr/react-dsfr';
import React, { useEffect, useState } from 'react';
import { tss } from 'tss-react/dsfr';
import { SideMenu } from '@codegouvfr/react-dsfr/SideMenu';
import { useRouter } from 'next/router';
import { Product, RightAccessStatus } from '@prisma/client';
import Tag from '@codegouvfr/react-dsfr/Tag';
import { Toast } from '@/src/components/ui/Toast';
import Button from '@codegouvfr/react-dsfr/Button';
import Badge from '@codegouvfr/react-dsfr/Badge';

interface ProductLayoutProps {
	children: React.ReactNode;
	product: Product;
	ownRight: Exclude<RightAccessStatus, 'removed'>;
}

interface MenuItems {
	text: string;
	linkProps: {
		href: string;
		alt?: string;
	};
	isActive?: boolean;
}

const ProductLayout = ({ children, product, ownRight }: ProductLayoutProps) => {
	const { id } = product;

	const [displayToast, setDisplayToast] = useState(false);
	const [showBackToTop, setShowBackToTop] = useState(false);

	const router = useRouter();

	const { cx, classes } = useStyles();

	const menuItems: MenuItems[] = [
		{
			text: 'Statistiques',
			isActive:
				router.pathname === `/administration/dashboard/product/[id]/stats`,
			linkProps: {
				href: `/administration/dashboard/product/${id}/stats`,
				alt: 'Statistiques'
			}
		},
		{
			text: 'Avis',
			isActive:
				router.pathname === `/administration/dashboard/product/[id]/reviews`,
			linkProps: {
				href: `/administration/dashboard/product/${id}/reviews`,
				alt: 'Avis'
			}
		},
		{
			text:
				ownRight && ownRight === 'carrier_admin'
					? 'Gérer les boutons'
					: 'Voir les boutons',
			isActive:
				router.pathname === `/administration/dashboard/product/[id]/buttons`,
			linkProps: {
				href: `/administration/dashboard/product/${id}/buttons`,
				alt: 'Gérer mes boutons'
			}
		},
		{
			text:
				ownRight && ownRight === 'carrier_admin'
					? "Gérer l'accès"
					: "Voir l'accès",
			isActive:
				router.pathname === `/administration/dashboard/product/[id]/access`,
			linkProps: {
				href: `/administration/dashboard/product/${id}/access`,
				alt: "Gérer les droits d'accès"
			}
		},
		{
			text: 'Informations',
			isActive:
				router.pathname === `/administration/dashboard/product/[id]/infos`,
			linkProps: {
				href: `/administration/dashboard/product/${id}/infos`,
				alt: 'Informations'
			}
		},
		{
			text:
				ownRight && ownRight === 'carrier_admin'
					? 'Gérer les clés API'
					: 'Voir les clés API',
			isActive:
				router.pathname === `/administration/dashboard/product/[id]/api_keys`,
			linkProps: {
				href: `/administration/dashboard/product/${id}/api_keys`,
				alt: 'Gérer les clés API'
			}
		},
		{
			text: "Historique d'activité",
			isActive:
				router.pathname === `/administration/dashboard/product/[id]/logs`,
			linkProps: {
				href: `/administration/dashboard/product/${id}/logs`,
				alt: "Consulter l'historique d'activité"
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
			<div className={cx(fr.cx('fr-mt-4w', 'fr-mb-5v'), classes.tagContainer)}>
				<Tag id="product-id" small>
					{`# ${id}`}
				</Tag>
				<Button
					priority="tertiary"
					type="button"
					className={cx(classes.copyBtn)}
					nativeButtonProps={{
						title: `Copier l’identifiant du service « ${id} » dans le presse-papier`,
						'aria-label': `Copier l’identifiant du service « ${id} » dans le presse-papier`,
						onClick: () => {
							navigator.clipboard.writeText(product.id.toString());
							setDisplayToast(true);
						}
					}}
				>
					Copier dans le presse-papier
				</Button>
			</div>
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
				<div className={fr.cx('fr-col-12', 'fr-col-md-3')}>
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
	tagContainer: {
		display: 'flex'
	},
	copyBtn: {
		boxShadow: 'none'
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
