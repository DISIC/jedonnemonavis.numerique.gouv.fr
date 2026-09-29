import ServerError from '@/src/components/global/ServerError';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export default function JDMA500() {
	return <ServerError />;
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'fr', ['common']))
	}
});
