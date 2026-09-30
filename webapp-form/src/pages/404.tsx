import ErrorPage from '@/src/components/global/ErrorPage';
import { fr } from '@codegouvfr/react-dsfr';
import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export default function JDMA404() {
	const { t } = useTranslation('common');

	return (
		<ErrorPage
			title={t('pages.not_found.h1')}
			errorCode={t('pages.not_found.error_code')}
			lead={t('pages.not_found.text')}
		>
			<p className={fr.cx('fr-text--sm', 'fr-mb-1v')}>
				{t('pages.not_found.share_text')}
			</p>
			<a
				className={fr.cx(
					'fr-link',
					'fr-link--sm',
					'fr-link--icon-right',
					'fr-icon-external-link-line'
				)}
				href="https://www.plus.transformation.gouv.fr/experience/step_1"
				target="_blank"
				rel="noopener noreferrer"
			>
				{t('pages.not_found.share_link')}
			</a>
		</ErrorPage>
	);
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'fr', ['common']))
	}
});
