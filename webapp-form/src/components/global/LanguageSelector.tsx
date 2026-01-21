import { fr } from '@codegouvfr/react-dsfr';
import { useRouter } from 'next/router';
import { memo } from 'react';
import { tss } from 'tss-react/dsfr';

export type Language = 'fr' | 'en' | 'ar' | 'es' | 'pt';

type Props = {
	lang: Language;
	setLang: (lang: Language) => void;
};

export const fullNameByLang: Record<Language, string> = {
	fr: 'Français',
	en: 'English',
	es: 'Español',
	ar: 'العربية',
	pt: 'Português',
};

export const languages: Language[] = ['fr', 'en', 'es'];

/**
 * The button controlling the component must specify 2 attributes
 * - "aria-controls": "translate-select",
 * - "aria-expanded": false,
 */
export const LanguageSelector = memo((props: Props) => {
	const { lang, setLang } = props;

	const { cx, classes } = useStyles();
	const router = useRouter();
	const { pathname, asPath, query } = router;

	return (
		<>
			<div className={classes.root}>
				{' '}
				<span className={classes.langShort}>{lang}</span>
				<span className={fr.cx('fr-hidden-lg')}>
					{' '}
					-{fullNameByLang[lang]}
				</span>{' '}
			</div>
			<div
				className={cx(fr.cx('fr-collapse', 'fr-menu'), classes.menuLanguage)}
				id="translate-select"
			>
				<ul className={fr.cx('fr-menu__list')}>
					{languages.map(lang_i => (
						<li key={lang_i}>
							<a
								className={fr.cx('fr-translate__language', 'fr-nav__link')}
								lang={lang_i}
								aria-current={lang_i === lang ? 'true' : undefined}
								onClick={() => setLang(lang_i)}
								hrefLang={lang_i}
								href={`/Demarches/${lang_i + router.asPath}`}
							>
								<span className={classes.langShort}>{lang_i}</span>
								&nbsp;-&nbsp;{fullNameByLang[lang_i]}
							</a>
						</li>
					))}
				</ul>
			</div>
		</>
	);
});

const useStyles = tss.withName({ LanguageSelector }).create({
	root: {
		display: 'inline-flex',
	},
	menuLanguage: {
		right: 0,
		ul: {
			display: 'flex',
			flexWrap: 'wrap',
		},
		button: {
			background: 'none',
			border: 0,
			padding: 0,
			cursor: 'pointer',
			font: 'inherit',
			textAlign: 'left',
		},
	},
	langShort: {
		textTransform: 'uppercase',
	},
});
