import { fr } from '@codegouvfr/react-dsfr';
import React from 'react';
import { tss } from 'tss-react/dsfr';
import { SideMenu } from '@codegouvfr/react-dsfr/SideMenu';
import { useRouter } from 'next/router';
import { Product } from '@prisma/client';
import Tag from '@codegouvfr/react-dsfr/Tag';
import { Toast } from '@/src/components/ui/Toast';
import { useSession } from 'next-auth/react';

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
	const { data: session } = useSession();

	const [displayToast, setDisplayToast] = React.useState(false);

	const router = useRouter();

	const { cx, classes } = useStyles();

	let menuItems: MenuItems[] = [
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
		}
	];

	if (session?.user?.role === 'user' || session?.user?.role === 'admin') {
		menuItems = [
			...menuItems,
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
	}

	return (
		<div className={cx(fr.cx('fr-container'), classes.container)}>
			<Toast
				isOpen={displayToast}
				setIsOpen={setDisplayToast}
				autoHideDuration={2000}
				severity="info"
				message="Identifiant copié dans le presse papier !"
			/>
			<div className={fr.cx('fr-mt-4w', 'fr-mb-5v')}>
				<Tag
					id="product-id"
					small
					nativeButtonProps={{
						onClick: () => {
							navigator.clipboard.writeText(product.id.toString());
							setDisplayToast(true);
						}
					}}
				>
					{`#${id}`}
				</Tag>
			</div>
			<div className={cx(classes.title)}>
				<h1>{product.title}</h1>
			</div>
			<div
				className={cx(
					fr.cx('fr-grid-row', 'fr-grid-row--center'),
					classes.children
				)}
			>
				<div className={fr.cx('fr-col-12', 'fr-col-md-4')}>
					<SideMenu
						align="left"
						items={menuItems}
						burgerMenuButtonText="Menu"
					/>
				</div>
				<div className={fr.cx('fr-col-12', 'fr-col-md-8', 'fr-mb-20v')}>
					{children}
				</div>
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
	},
	children: {
		minHeight: '40rem'
	}
});

export default ProductLayout;
