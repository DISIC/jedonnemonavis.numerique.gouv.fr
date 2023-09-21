import type { AppProps } from 'next/app';
import { createNextDsfrIntegrationApi } from '@codegouvfr/react-dsfr/next-pagesdir';
import Link from 'next/link';
import { ReactNode } from 'react';
import PublicLayout from '@/layouts/PublicLayout';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

declare module '@codegouvfr/react-dsfr/next-pagesdir' {
	interface RegisterLink {
		Link: typeof Link;
	}
}

const { withDsfr, dsfrDocumentApi } = createNextDsfrIntegrationApi({
	defaultColorScheme: 'light',
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

function App({ Component, pageProps }: AppProps) {
	const getLayout = (children: ReactNode) => {
		return <PublicLayout>{children}</PublicLayout>;
	};

	const cache = createCache({
		key: 'cache-form'
	});

	return (
		<CacheProvider value={cache}>
			{getLayout(<Component {...pageProps} />)}
		</CacheProvider>
	);
}

export default withDsfr(App);
