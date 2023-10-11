import PublicLayout from '@/src/layouts/PublicLayout';
import MuiDsfrThemeProvider from '@codegouvfr/react-dsfr/mui';
import { createNextDsfrIntegrationApi } from '@codegouvfr/react-dsfr/next-pagesdir';
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import Link from 'next/link';
import { ReactNode } from 'react';
import { createEmotionSsrAdvancedApproach } from 'tss-react/next';
import '../utils/keyframes.css';
import { trpc } from '@/src/utils/trpc';

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

function App({ Component, pageProps }: AppProps) {
	const getLayout = (children: ReactNode) => {
		return <PublicLayout>{children}</PublicLayout>;
	};

	return (
		<MuiDsfrThemeProvider>
			<SessionProvider session={pageProps.session}>
				{getLayout(<Component {...pageProps} />)}
			</SessionProvider>
		</MuiDsfrThemeProvider>
	);
}

export default trpc.withTRPC(withDsfr(withAppEmotionCache(App)));
