import {
	fullNameByLang,
	Language,
	languages,
	LanguageSelector,
} from '@/src/components/global/LanguageSelector';
import { fr } from '@codegouvfr/react-dsfr';
import { Footer } from '@codegouvfr/react-dsfr/Footer';
import { Header, HeaderProps } from '@codegouvfr/react-dsfr/Header';
import { i18n, useTranslation } from 'next-i18next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { SkipLinks } from '@codegouvfr/react-dsfr/SkipLinks';
import { ReactElement, ReactNode } from 'react';
import { tss } from 'tss-react/dsfr';

const isReactElement = (element: ReactNode): element is ReactElement => {
	return typeof element === 'object' && element !== null && 'props' in element;
};

export default function PublicLayout({ children }: { children: ReactNode }) {
	const { classes, cx } = useStyles();
	const router = useRouter();
	const { t } = useTranslation('common');

	const headerId = 'fr-header-public-header';

	const [isMobile, setIsMobile] = useState(false);

	const onToggleLanguageClick = (newLocale: Language) => {
		const { pathname, asPath, query } = router;
		router.push({ pathname, query }, asPath, { locale: newLocale });
	};

	const isInIframe = router.query.iframe;
	const getProductTitle = () => {
		if (isReactElement(children) && children.props?.product?.title) {
			return children.props.product.title;
		}
		return '';
	};

	const getStepTitle = (step: string | string[] | undefined) => {
		const titles: { [key: string]: string } = {
			'0': 'Clarté (étape 1 sur 3) |',
			'1': 'Aides (étape 2 sur 3) |',
			'2': 'Informations complémentaires (étape 3 sur 3) |',
		};
		return titles[step as string] || '';
	};

	const lang = (i18n?.language || 'fr') as Language;
	const quickAccesItems: HeaderProps.QuickAccessItem[] | ReactNode[] = isMobile
		? languages.map(lang_i => ({
				buttonProps: {
					lang: lang_i,
					'aria-current': lang_i === lang ? 'true' : undefined,
					onClick: e => {
						e.preventDefault();
						onToggleLanguageClick(lang_i);
					},
					className: cx(
						classes.langButton,
						fr.cx('fr-translate__language', 'fr-nav__link'),
					),
				},
				iconId: 'fr-icon-translate-2',
				text: (
					<>
						<span className={classes.langShort}>{lang_i}</span>
						&nbsp;-&nbsp;{fullNameByLang[lang_i]}
					</>
				),
		  }))
		: [
				{
					buttonProps: {
						'aria-controls': 'translate-select',
						'aria-expanded': false,
						title: t('Sélectionner une langue'),
						className: fr.cx('fr-btn--tertiary', 'fr-translate', 'fr-nav'),
					},
					iconId: 'fr-icon-translate-2',
					text: (
						<LanguageSelector lang={lang} setLang={onToggleLanguageClick} />
					),
				},
		  ];

	useEffect(() => {
		setIsMobile(window.innerWidth <= fr.breakpoints.getPxValues().md);
	}, []);

	useEffect(() => {
		// Workaround for DSFR Header menu modal markup:
		// axe flags `aria-labelledby` on a <div> without a valid role.
		// This element is a modal dialog (mobile menu), so ensuring role/aria-modal is appropriate.
		const ensureHeaderMenuModalA11y = () => {
			const modalId = `header-menu-modal-${headerId}`;
			const modal = document.getElementById(modalId);

			if (!modal) return;

			if (!modal.getAttribute('role')) {
				modal.setAttribute('role', 'dialog');
			}

			if (!modal.getAttribute('aria-modal')) {
				modal.setAttribute('aria-modal', 'true');
			}
		};

		// Run after paint to avoid racing with DSFR/react-dsfr hydration.
		const raf = window.requestAnimationFrame(ensureHeaderMenuModalA11y);
		return () => window.cancelAnimationFrame(raf);
	}, [headerId]);

	return (
		<>
			<Head>
				<title>
					{`${getStepTitle(
						router.query.step,
					)} Je donne mon avis sur la démarche "${getProductTitle()}"`}
				</title>
				<meta name="description" content="Je donne mon avis" />
			</Head>
			<SkipLinks
				links={[
					{
						anchor: '#main',
						label: 'Contenu',
					},
					{
						anchor: '#footer',
						label: 'Pied de page',
					},
				]}
			/>
			<Header
				brandTop={
					<>
						République
						<br />
						française
					</>
				}
				homeLinkProps={{
					href: '#',
					title: 'Accueil - Je donne mon avis (Services publics +)',
				}}
				id={headerId}
				serviceTitle={'Je donne mon avis'}
				quickAccessItems={quickAccesItems}
				serviceTagline="La voix de vos usagers"
			/>
			<main id="main" role="main">
				{children}
			</main>
			<Footer
				id="footer"
				accessibility="non compliant"
				accessibilityLinkProps={{
					href: '/accessibility',
				}}
				bottomItems={[
					{ text: 'Données personnelles', linkProps: { href: '/cgu' } },
					{
						text: 'Modalités d’utilisation',
						linkProps: { href: '/termsOfUse' },
					},
					{ text: 'Contact', linkProps: { href: '/contact' } },
				]}
				termsLinkProps={{
					href: '/legalNotice',
				}}
				license={
					<>
						Le{' '}
						<a
							href="https://github.com/DISIC/jedonnemonavis.numerique.gouv.fr"
							target="_blank"
							rel="noopener noreferrer"
						>
							code source
						</a>{' '}
						est disponible en licence libre.
					</>
				}
			/>
		</>
	);
}

const useStyles = tss
	.withName(PublicLayout.name)
	.withParams()
	.create(() => ({
		logo: {
			maxHeight: fr.spacing('11v'),
			width: '100%',
		},
		langButton: {
			'&::before': {
				display: 'none',
			},
		},
		langShort: {
			textTransform: 'uppercase',
		},
	}));
