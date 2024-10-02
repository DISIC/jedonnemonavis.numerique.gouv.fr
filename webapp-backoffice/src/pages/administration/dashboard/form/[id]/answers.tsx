import React from 'react';
import { getServerSideProps } from '.';
import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react/dsfr';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Form } from '@/prisma/generated/zod';
import FormLayout from '@/src/layouts/Form/FormLayout';
import { trpc } from '@/src/utils/trpc';
import { Loader } from '@/src/components/ui/Loader';

interface Props {
	form: Form;
}

const FormBuilder = (props: Props) => {
	const { form } = props;

	const router = useRouter();
	const [page, setPage] = React.useState<number>(0);
	const [numberPerPage, setNumberPerPage] = React.useState<number>(10);

	const { classes } = useStyles();

	const {
		data: reviewsResult,
		isLoading: isLoadingReviews,
		refetch: refetchReviews,
		isRefetching: isRefetchingreviews,
		isFetched: isReviewsFetched
	} = trpc.reviewCustom.getList.useQuery(
		{
			form_id: form.id,
			page: page,
			numberPerPage: numberPerPage
		},
		{
			initialData: {
				data: [],
				metadata: {
					reviewsCount: 0
				}
			},
			enabled: form?.id !== undefined
		}
	);

	const {
		data: reviews,
		metadata: { reviewsCount: reviewsCount }
	} = reviewsResult;

	const {
		data: blocksResult,
		isLoading: isLoadingBlocks,
		refetch: refetchBlocks,
		isRefetching: isRefetchingBlocks,
		isFetched: isBlocksFetched
	} = trpc.block.getByFormId.useQuery(
		{
			form_id: form.id
		},
		{
			initialData: {
				data: [],
				metadata: {
					blockCount: 0
				}
			},
			enabled: form?.id !== undefined
		}
	);

	const {
		data: formBlocks,
		metadata: { blockCount: blockCount }
	} = blocksResult;

	return (
		<FormLayout form={form}>
			<Head>
				<title>{form.title} | Form Réponses | Je donne mon avis</title>
				<meta
					name="description"
					content={`${form.title} | Form Réponses | Je donne mon avis`}
				/>
			</Head>
			<div className={classes.column}>
				<div className={classes.headerWrapper}>
					<h1>Form Réponses</h1>
				</div>
			</div>
			<div>
				<div className={fr.cx('fr-py-10v')}>
					<Loader />
				</div>
			</div>
		</FormLayout>
	);
};

const useStyles = tss.withName(FormBuilder.name).create({
	headerWrapper: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between'
	},
	column: {
		display: 'flex',
		flexDirection: 'column',
		gap: fr.spacing('10v')
	}
});

export default FormBuilder;

export { getServerSideProps };
