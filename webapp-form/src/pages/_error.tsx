import ServerError from '@/src/components/global/ServerError';
import { NextPage } from 'next';
import { i18n } from 'next-i18next';
import { I18nextProvider } from 'react-i18next';

type ErrorRouteProps = { statusCode: number };

const ErrorRoute: NextPage<ErrorRouteProps> = ({ statusCode }) =>
	i18n ? (
		<I18nextProvider i18n={i18n}>
			<ServerError code={statusCode} />
		</I18nextProvider>
	) : (
		<ServerError code={statusCode} />
	);

ErrorRoute.getInitialProps = ({ res, err }) => ({
	statusCode: res?.statusCode ?? err?.statusCode ?? 500
});

export default ErrorRoute;
