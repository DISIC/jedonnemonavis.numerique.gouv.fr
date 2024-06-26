import { fr } from '@codegouvfr/react-dsfr';
import React from 'react';
import { tss } from 'tss-react/dsfr';
import { SideMenu } from '@codegouvfr/react-dsfr/SideMenu';
import { useRouter } from 'next/router';
import { Product } from '@prisma/client';
import Tag from '@codegouvfr/react-dsfr/Tag';
import Alert from '@codegouvfr/react-dsfr/Alert';
import { Toast } from '@/src/components/ui/Toast';
import Button from '@codegouvfr/react-dsfr/Button';

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

	const [displayToast, setDisplayToast] = React.useState(false);

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
			text: 'Gérer vos boutons',
			isActive:
				router.pathname === `/administration/dashboard/product/[id]/buttons`,
			linkProps: {
				href: `/administration/dashboard/product/${id}/buttons`,
				alt: 'Gérer mes boutons'
			}
		},
		{
			text: "Gérer l'accès",
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
			text: 'Gérer les clés API',
			isActive:
				router.pathname === `/administration/dashboard/product/[id]/api_keys`,
			linkProps: {
				href: `/administration/dashboard/product/${id}/api_keys`,
				alt: 'Gérer les clés API'
			}
		}
	];
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
				<h1>{product.title}</h1>
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
				<div className={fr.cx('fr-col-12', 'fr-col-md-9', 'fr-mb-20v')}>
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
	},
	tagContainer: {
		display: 'flex'
	},
	copyBtn: {
		boxShadow: 'none'
	}
});

export default ProductLayout;
