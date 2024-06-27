import PublicLayout from '@/src/layouts/PublicLayout';
import { trpc } from '@/src/utils/trpc';
import MuiDsfrThemeProvider from '@codegouvfr/react-dsfr/mui';
import { createNextDsfrIntegrationApi } from '@codegouvfr/react-dsfr/next-pagesdir';
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';
import { createEmotionSsrAdvancedApproach } from 'tss-react/next';
import { AuthProvider } from '../contexts/AuthContext';
import { StatsTotalsProvider } from '../contexts/StatsContext';
import '../utils/global.css';
import '../utils/keyframes.css';
import { FiltersContextProvider } from '../contexts/FiltersContext';
import React from 'react';
import { init } from '@socialgouv/matomo-next';

declare module '@codegouvfr/react-dsfr/next-pagesdir' {
	interface RegisterLink {
		Link: typeof Link;
	}
}

const { withDsfr, dsfrDocumentApi } = createNextDsfrIntegrationApi({
	defaultColorScheme: 'light',
	doPersistDarkModePreferenceWithCookie: true,
	Link,
	preloadFonts: [
		//"Marianne-Light",
		//"Marianne-Light_Italic",
		'Marianne-Regular',
		//"Marianne-Regular_Italic",
		'Marianne-Medium',
		//"Marianne-Medium_Italic",
		'Marianne-Bold'
		//"Marianne-Bold_Italic",
		//"Spectral-Regular",
		//"Spectral-ExtraBold"
	]
});

export { dsfrDocumentApi };

const { withAppEmotionCache, augmentDocumentWithEmotionCache } =
	createEmotionSsrAdvancedApproach({
		key: 'tss'
	});

export { augmentDocumentWithEmotionCache };

const MATOMO_URL = process.env.NEXT_PUBLIC_MATOMO_URL;
const MATOMO_SITE_ID = process.env.NEXT_PUBLIC_MATOMO_SITE_ID;

function App({ Component, pageProps }: AppProps) {
	const router = useRouter();

	const getLayout = (children: ReactNode) => {
		const lightMode =
			router.pathname.startsWith('/public') ||
			router.pathname.startsWith('/open-api');
		return <PublicLayout light={lightMode}>{children}</PublicLayout>;
	};

	React.useEffect(() => {
		if (process.env.NODE_ENV === 'production')
			init({
				url: MATOMO_URL ? MATOMO_URL : '',
				siteId: MATOMO_SITE_ID ? MATOMO_SITE_ID : ''
			});
		const removeButtonOnLoad = () => {
			const buttonToRemove = document.getElementById(
				'fr-theme-modal-hidden-control-button'
			);
			if (buttonToRemove) {
				buttonToRemove.remove();
			}
		};
		removeButtonOnLoad();
	}, []);

	return (
		<MuiDsfrThemeProvider>
			<SessionProvider session={pageProps.session}>
				<AuthProvider>
					<StatsTotalsProvider>
						<FiltersContextProvider>
							{getLayout(<Component {...pageProps} />)}
						</FiltersContextProvider>
					</StatsTotalsProvider>
				</AuthProvider>
			</SessionProvider>
		</MuiDsfrThemeProvider>
	);
}

export default trpc.withTRPC(withDsfr(withAppEmotionCache(App)));
