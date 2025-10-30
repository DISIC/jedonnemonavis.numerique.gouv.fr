import PublicLayout from '@/src/layouts/PublicLayout';
import { trpc } from '@/src/utils/trpc';
import MuiDsfrThemeProvider from '@codegouvfr/react-dsfr/mui';
import { createNextDsfrIntegrationApi } from '@codegouvfr/react-dsfr/next-pagesdir';
import { init } from '@socialgouv/matomo-next';
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { ReactNode } from 'react';
import { createEmotionSsrAdvancedApproach } from 'tss-react/next';
import { AuthProvider } from '../contexts/AuthContext';
import { FiltersContextProvider } from '../contexts/FiltersContext';
import { RootFormTemplateProvider } from '../contexts/RootFormTemplateContext';
import { StatsTotalsProvider } from '../contexts/StatsContext';
import { UserSettingsProvider } from '../contexts/UserSettingsContext';
import '../utils/global.css';
import '../utils/keyframes.css';

declare module '@codegouvfr/react-dsfr/next-pagesdir' {
	interface RegisterLink {
		Link: typeof Link;
	}
}

const { withDsfr, dsfrDocumentApi } = createNextDsfrIntegrationApi({
	defaultColorScheme: 'light',
	doPersistDarkModePreferenceWithCookie: true,
	Link,
	preloadFonts: ['Marianne-Regular', 'Marianne-Medium', 'Marianne-Bold']
});

export { dsfrDocumentApi };

const { withAppEmotionCache, augmentDocumentWithEmotionCache } =
	createEmotionSsrAdvancedApproach({
		key: 'tss'
	});

export { augmentDocumentWithEmotionCache };

const MATOMO_URL = process.env.NEXT_PUBLIC_MATOMO_URL;
const MATOMO_SITE_ID = process.env.NEXT_PUBLIC_MATOMO_SITE_ID;

const OFF_ADMIN_PATHS = [
	'/public/maintenance',
	'/administration/dashboard/onboarding',
	'/administration/dashboard/product/new',
	'/administration/dashboard/product/[id]/forms/new',
	'/administration/dashboard/product/[id]/forms/[form_id]/new-link'
] as const;

const LIGHT_MODE_PATHS = ['/public', '/open-api'] as const;

function App({ Component, pageProps }: AppProps) {
	const router = useRouter();

	const getLayout = (children: ReactNode) => {
		if (OFF_ADMIN_PATHS.some(path => router.pathname.startsWith(path))) {
			return children;
		}

		const isLightMode = LIGHT_MODE_PATHS.some(path =>
			router.pathname.startsWith(path)
		);

		return <PublicLayout light={isLightMode}>{children}</PublicLayout>;
	};

	React.useEffect(() => {
		if (process.env.NODE_ENV === 'production')
			init({
				url: MATOMO_URL ? MATOMO_URL : '',
				siteId: MATOMO_SITE_ID ? MATOMO_SITE_ID : ''
			});
	}, []);

	return (
		<MuiDsfrThemeProvider>
			<SessionProvider session={pageProps.session}>
				<AuthProvider>
					<UserSettingsProvider>
						<StatsTotalsProvider>
							<FiltersContextProvider>
								<RootFormTemplateProvider>
									{getLayout(<Component {...pageProps} />)}
								</RootFormTemplateProvider>
							</FiltersContextProvider>
						</StatsTotalsProvider>
					</UserSettingsProvider>
				</AuthProvider>
			</SessionProvider>
		</MuiDsfrThemeProvider>
	);
}

export default trpc.withTRPC(withDsfr(withAppEmotionCache(App)));
