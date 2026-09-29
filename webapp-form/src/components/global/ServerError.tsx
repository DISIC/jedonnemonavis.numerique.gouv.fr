import { fr } from '@codegouvfr/react-dsfr';
import { useTranslation } from 'next-i18next';
import ErrorPage from './ErrorPage';

const ServerError = ({ code = 500 }: { code?: number }) => {
	const { t } = useTranslation('common');

	return (
		<ErrorPage
			title={t('pages.server_error.h1')}
			errorCode={t('pages.server_error.error_code', { code })}
			lead={t('pages.server_error.lead')}
		>
			<p className={fr.cx('fr-text--sm', 'fr-mb-0')}>
				{t('pages.server_error.text')}
			</p>
		</ErrorPage>
	);
};

export default ServerError;
