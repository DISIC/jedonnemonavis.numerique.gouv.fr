import {
	fullNameByLang,
	Language,
	languages,
	LanguageSelector
} from '@/src/components/global/LanguageSelector';
import { useIsMobile } from '@/src/hooks/useIsMobile';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { Footer } from '@codegouvfr/react-dsfr/Footer';
import { Header, HeaderProps } from '@codegouvfr/react-dsfr/Header';
import { SkipLinks } from '@codegouvfr/react-dsfr/SkipLinks';
import { i18n, useTranslation } from 'next-i18next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ReactElement, ReactNode, useEffect } from 'react';
import { tss } from 'tss-react/dsfr';

const isReactElement = (element: ReactNode): element is ReactElement => {
	return typeof element === 'object' && element !== null && 'props' in element;
};

export default function PublicLayout({ children }: { children: ReactNode }) {
	const { classes, cx } = useStyles();
	const router = useRouter();
	const { t } = useTranslation('common');

	const headerId = 'fr-header-public-header';

	const { isMobile, isHydrated } = useIsMobile('lg');

	const onToggleLanguageClick = (newLocale: Language) => {
		const { pathname, asPath, query } = router;
		router.push({ pathname, query }, asPath, { locale: newLocale });
	};

	const getProductTitle = () => {
		if (isReactElement(children) && children.props?.product?.title) {
			return children.props.product.title;
		}
		if (isReactElement(children) && children.props?.form?.product?.title) {
			return children.props.form.product.title;
		}
		return '';
	};

	const getStepTitle = (step: string | string[] | undefined) => {
		const titles: { [key: string]: string } = {
			'0': t('global.step_titles.0'),
			'1': t('global.step_titles.1'),
			'2': t('global.step_titles.2')
		};
		return titles[step as string] || '';
	};

	const lang = (i18n?.language || 'fr') as Language;
	const shouldShowLanguageSelector = !router.asPath.startsWith('/avis');

	const desktopQuickAccessItems: ReactNode[] = shouldShowLanguageSelector
		? [
				<div style={{ position: 'relative' }}>
					<Button
						key="lang-button"
						nativeButtonProps={{
							'aria-controls': 'translate-select',
							'aria-expanded': false,
							title: t('global.select_language')
						}}
						priority="tertiary"
						className={cx(
							classes.uppercase,
							classes.langTrigger,
							fr.cx('fr-translate', 'fr-nav', 'fr-pr-2v')
						)}
						iconId="fr-icon-translate-2"
					>
						{lang}
						<i
							className={fr.cx(
								'fr-icon-arrow-down-s-line',
								'fr-icon--sm',
								'fr-ml-2v'
							)}
						/>
					</Button>
					<LanguageSelector
						key="lang-selector"
						lang={lang}
						setLang={onToggleLanguageClick}
					/>
				</div>
		  ]
		: [];

	const mobileQuickAccessItems: HeaderProps.QuickAccessItem[] =
		shouldShowLanguageSelector
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
							fr.cx('fr-translate__language', 'fr-nav__link')
						)
					},
					iconId: 'fr-icon-translate-2',
					text: (
						<>
							<span className={classes.uppercase}>{lang_i}</span>
							&nbsp;-&nbsp;{fullNameByLang[lang_i]}
						</>
					)
			  }))
			: [];

	const quickAccesItems = (
		isHydrated
			? isMobile
				? mobileQuickAccessItems
				: desktopQuickAccessItems
			: []
	) as HeaderProps.QuickAccessItem[];

	useEffect(() => {
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
					{`${getStepTitle(router.query.step)} ${t('global.page_title', {
						product: getProductTitle()
					})}`}
				</title>
				<meta name="description" content="Je donne mon avis" />
			</Head>
			<SkipLinks
				links={[
					{
						anchor: '#main',
						label: t('global.skip_content')
					},
					{
						anchor: '#footer',
						label: t('global.skip_footer')
					}
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
					href: router.asPath,
					title: t('global.home_link_title')
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
					href: '/accessibility'
				}}
				bottomItems={[
					{
						text: t('global.footer.legal_notice'),
						linkProps: { href: '/legalNotice' }
					},
					{
						text: t('global.footer.personal_data'),
						linkProps: { href: '/cgu' }
					},
					{
						text: t('global.footer.terms_of_use'),
						linkProps: { href: '/termsOfUse' }
					},
					{ text: t('global.footer.contact'), linkProps: { href: '/contact' } }
				]}
				license={
					<>
						{t('global.footer.license_before')}
						<a
							href="https://github.com/DISIC/jedonnemonavis.numerique.gouv.fr"
							target="_blank"
							rel="noopener noreferrer"
						>
							{t('global.footer.license_link')}
						</a>
						{t('global.footer.license_after')}
					</>
				}
			/>
		</>
	);
}

const useStyles = tss
	.withName({ PublicLayout })
	.withParams()
	.create(() => ({
		logo: {
			maxHeight: fr.spacing('11v'),
			width: '100%'
		},
		langButton: {
			'&::before': {
				display: 'none'
			}
		},
		langTrigger: {
			'& i': {
				transition: 'transform 0.3s ease'
			},
			'&[aria-expanded="true"] i': {
				transform: 'rotate(180deg)'
			}
		},
		uppercase: {
			textTransform: 'uppercase'
		}
	}));
