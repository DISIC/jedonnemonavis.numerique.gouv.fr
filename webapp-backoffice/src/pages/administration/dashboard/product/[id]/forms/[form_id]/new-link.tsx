import { GetServerSideProps } from 'next';

const LegacyNewLinkPage = () => null;

export const getServerSideProps: GetServerSideProps = async context => {
	const { id, form_id } = context.params as { id: string; form_id: string };

	return {
		redirect: {
			destination: `/administration/dashboard/product/${id}/forms/${form_id}/link/new`,
			permanent: false
		}
	};
};

export default LegacyNewLinkPage;
