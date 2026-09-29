import { NextPage } from 'next';
import ServerError from './500';

type ErrorRouteProps = { statusCode: number };

const ErrorRoute: NextPage<ErrorRouteProps> = ({ statusCode }) => (
	<ServerError code={statusCode} />
);

ErrorRoute.getInitialProps = ({ res, err }) => ({
	statusCode: res?.statusCode ?? err?.statusCode ?? 500
});

export default ErrorRoute;
