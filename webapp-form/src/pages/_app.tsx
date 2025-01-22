import PublicLayout from "@/src/layouts/PublicLayout";
import { createNextDsfrIntegrationApi } from "@codegouvfr/react-dsfr/next-pagesdir";
import { appWithTranslation } from "next-i18next";
import type { AppProps } from "next/app";
import Link from "next/link";
import { ReactNode } from "react";
import { createEmotionSsrAdvancedApproach } from "tss-react/next";
import "@/src/styles/global.css";
import { trpc } from "@/src/utils/trpc";
import "../utils/keyframes.css";
import { init } from "@socialgouv/matomo-next";
import React from "react";

declare module "@codegouvfr/react-dsfr/next-pagesdir" {
  interface RegisterLink {
    Link: typeof Link;
  }
}

const { withDsfr, dsfrDocumentApi } = createNextDsfrIntegrationApi({
  defaultColorScheme: "light",
  Link,
  preloadFonts: [
    //"Marianne-Light",
    //"Marianne-Light_Italic",
    "Marianne-Regular",
    //"Marianne-Regular_Italic",
    "Marianne-Medium",
    //"Marianne-Medium_Italic",
    "Marianne-Bold",
    //"Marianne-Bold_Italic",
    //"Spectral-Regular",
    //"Spectral-ExtraBold"
  ],
});

export { dsfrDocumentApi };

const { withAppEmotionCache, augmentDocumentWithEmotionCache } =
  createEmotionSsrAdvancedApproach({
    key: "tss",
  });

export { augmentDocumentWithEmotionCache };

const MATOMO_URL = process.env.NEXT_PUBLIC_MATOMO_URL;
const MATOMO_SITE_ID = process.env.NEXT_PUBLIC_MATOMO_SITE_ID;

function App({ Component, pageProps }: AppProps) {
  const getLayout = (children: ReactNode) => {
    return <PublicLayout>{children}</PublicLayout>;
  };
  React.useEffect(() => {
    if (process.env.NODE_ENV === "production")
      init({
        url: MATOMO_URL ? MATOMO_URL : "",
        siteId: MATOMO_SITE_ID ? MATOMO_SITE_ID : "",
      });
  }, []);

  return getLayout(<Component {...pageProps} />);
}

export default trpc.withTRPC(
  appWithTranslation(withDsfr(withAppEmotionCache(App))),
);
