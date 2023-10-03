import { fr } from '@codegouvfr/react-dsfr';
import Breadcrumb from '@codegouvfr/react-dsfr/Breadcrumb';
import { Product } from '@prisma/client';
import React from 'react';
import { tss } from 'tss-react/dsfr';
import { SideMenu } from '@codegouvfr/react-dsfr/SideMenu';
import { useRouter } from 'next/router';

interface ProductLayoutProps {
	children: React.ReactNode;
	product: Product;
}

interface MenuItems {
	text: string;
	linkProps: {
		href: string;
		alt?: string;
	};
	isActive?: boolean;
}

const ProductLayout = ({ children, product }: ProductLayoutProps) => {
	const { id } = product;

	const router = useRouter();

	console.log(router.pathname);

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
			text: 'Gérer mes boutons',
			isActive:
				router.pathname === `/administration/dashboard/product/[id]/buttons`,
			linkProps: {
				href: `/administration/dashboard/product/${id}/buttons`,
				alt: 'Gérer mes boutons'
			}
		},
		{
			text: "Gérer les droits d'accès",
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
		}
	];
	return (
		<div className={cx(fr.cx('fr-container'), classes.container)}>
			<Breadcrumb
				currentPageLabel={product.title}
				segments={[
					{
						label: 'Tableau de bord',
						linkProps: {
							href: '/'
						}
					}
				]}
			/>
			<div className={cx(classes.title)}>
				<h1>{product.title}</h1>
			</div>
			<div className={fr.cx('fr-grid-row', 'fr-grid-row--center')}>
				<div className={fr.cx('fr-col-12', 'fr-col-md-4')}>
					<SideMenu
						align="left"
						items={menuItems}
						burgerMenuButtonText="Menu"
					/>
				</div>
				<div className={fr.cx('fr-col-12', 'fr-col-md-8')}>{children}</div>
			</div>
		</div>
	);
};

const useStyles = tss.create({
	title: {
		...fr.spacing('margin', { bottom: '6w' })
	},
	container: {
		height: '100%'
	}
});

export default ProductLayout;
