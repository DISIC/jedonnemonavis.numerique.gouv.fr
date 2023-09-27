import { fr } from '@codegouvfr/react-dsfr';
import Breadcrumb from '@codegouvfr/react-dsfr/Breadcrumb';
import { Product } from '@prisma/client';
import Link from 'next/link';
import React from 'react';

interface ProductLayoutProps {
	children: React.ReactNode;
	product: Product;
}

interface MenuItems {
	label: string;
	linkProps: {
		href: string;
		alt?: string;
	};
}

const ProductLayout = ({ children, product }: ProductLayoutProps) => {
	const { id } = product;

	const menuItems: MenuItems[] = [
		{
			label: 'Statistiques',
			linkProps: {
				href: `/administration/dashboard/product/${id}/stats`,
				alt: 'Statistiques'
			}
		},
		{
			label: 'Avis',
			linkProps: {
				href: `/administration/dashboard/product/${id}/reviews`,
				alt: 'Avis'
			}
		},
		{
			label: 'Gérer mes boutons',
			linkProps: {
				href: `/administration/dashboard/product/${id}/buttons`,
				alt: 'Gérer mes boutons'
			}
		},
		{
			label: "Gérer les droits d'accès",
			linkProps: {
				href: `/administration/dashboard/product/${id}/access`,
				alt: "Gérer les droits d'accès"
			}
		},
		{
			label: 'Informations',
			linkProps: {
				href: `/administration/dashboard/product/${id}/infos`,
				alt: 'Informations'
			}
		}
	];
	return (
		<div className={fr.cx('fr-container')}>
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
			<h1>{product.title}</h1>
			<div className={fr.cx('fr-grid-row', 'fr-grid-row--center')}>
				<div className={fr.cx('fr-col-12', 'fr-col-md-4')}>
					<nav className={fr.cx('fr-sidemenu')}>
						<div className={fr.cx('fr-sidemenu__inner')}>
							<ul className={fr.cx('fr-sidemenu__list')}>
								{menuItems.map((item, index) => (
									<li
										className={fr.cx(
											'fr-sidemenu__item',
											'fr-sidemenu--sticky'
										)}
										key={index}
									>
										<Link className="fr-sidemenu__link" {...item.linkProps}>
											{item.label}
										</Link>
									</li>
								))}
							</ul>
						</div>
					</nav>
				</div>
				<div className={fr.cx('fr-col-12', 'fr-col-md-8')}>{children}</div>
			</div>
		</div>
	);
};

export default ProductLayout;
