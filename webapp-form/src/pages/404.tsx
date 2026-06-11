import { fr } from '@codegouvfr/react-dsfr';
import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { tss } from 'tss-react/dsfr';

export default function JDMA404() {
	const { classes, cx } = useStyles();
	const { t } = useTranslation('common');

	return (
		<div className={cx(fr.cx('fr-container'), classes.root)}>
			<h1>{t('pages.not_found.h1')}</h1>
			<div className={fr.cx('fr-hint-text')}>{t('pages.not_found.text')}</div>
		</div>
	);
}

const useStyles = tss
	.withName({ JDMA404 })
	.withParams()
	.create(() => ({
		root: {
			minHeight: '80vh',
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
			textAlign: 'center'
		}
	}));

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'fr', ['common']))
	}
});
