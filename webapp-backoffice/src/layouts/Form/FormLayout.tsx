import { fr } from '@codegouvfr/react-dsfr';
import React, { useEffect, useState } from 'react';
import { tss } from 'tss-react/dsfr';
import { SideMenu } from '@codegouvfr/react-dsfr/SideMenu';
import { useRouter } from 'next/router';
import Tag from '@codegouvfr/react-dsfr/Tag';
import { Toast } from '@/src/components/ui/Toast';
import Button from '@codegouvfr/react-dsfr/Button';
import Badge from '@codegouvfr/react-dsfr/Badge';
import { Form } from '@/prisma/generated/zod';

interface ProductLayoutProps {
	children: React.ReactNode;
	form: Form;
}

interface MenuItems {
	text: string;
	linkProps: {
		href: string;
		alt?: string;
	};
	isActive?: boolean;
}

const FormLayout = ({ children, form }: ProductLayoutProps) => {
	const { id } = form;

	const [displayToast, setDisplayToast] = useState(false);
	const [showBackToTop, setShowBackToTop] = useState(false);

	const router = useRouter();

	const { cx, classes } = useStyles();

	const menuItems: MenuItems[] = [
		{
			text: 'Builder',
			isActive:
				router.pathname === `/administration/dashboard/form/[id]/builder`,
			linkProps: {
				href: `/administration/dashboard/form/${id}/builder`,
				alt: 'Builder'
			}
		},
		{
			text: 'Tester',
			isActive:
				router.pathname === `/administration/dashboard/form/[id]/tester`,
			linkProps: {
				href: `/administration/dashboard/form/${id}/tester`,
				alt: 'Tester'
			}
		},
		{
			text: 'Informations',
			isActive: router.pathname === `/administration/dashboard/form/[id]/infos`,
			linkProps: {
				href: `/administration/dashboard/form/${id}/infos`,
				alt: 'Informations'
			}
		},
		{
			text: 'Réponses',
			isActive:
				router.pathname === `/administration/dashboard/form/[id]/answers`,
			linkProps: {
				href: `/administration/dashboard/form/${id}/answers`,
				alt: 'Réponses'
			}
		},
		{
			text: 'Stats',
			isActive: router.pathname === `/administration/dashboard/form/[id]/stats`,
			linkProps: {
				href: `/administration/dashboard/form/${id}/stats`,
				alt: 'Statistiques'
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
							navigator.clipboard.writeText(form.id.toString());
							setDisplayToast(true);
						}
					}}
				>
					Copier dans le presse-papier
				</Button>
			</div>
			<div className={cx(classes.title)}>
				<h1 className={fr.cx('fr-mb-2v')} id="product-title">
					{form.title}
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

export default FormLayout;
