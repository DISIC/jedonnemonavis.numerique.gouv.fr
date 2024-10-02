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
import { TypeBlocksDescription } from '@/src/utils/content';
import { formatDateToFrenchString } from '@/src/utils/tools';

interface Props {
	form: Form;
}

const FormBuilder = (props: Props) => {
	const { form } = props;

	const router = useRouter();
	const [page, setPage] = React.useState<number>(0);
	const [numberPerPage, setNumberPerPage] = React.useState<number>(10);

	const { classes, cx } = useStyles();

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

	React.useEffect(() => {
		console.log('formBlocks : ', formBlocks);
	}, [formBlocks]);

	const questionTypes = TypeBlocksDescription.filter(
		t => t.category === 'Questions'
	).map(t => t.type);
	const filteredBlocsLabel = formBlocks
		.filter(b => questionTypes.includes(b.type_bloc))
		.map(b => b.content);
	const filteredBlocsID = formBlocks
		.filter(b => questionTypes.includes(b.type_bloc))
		.map(b => b.id);

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
			{isLoadingBlocks && isLoadingReviews && (
				<div>
					<div className={fr.cx('fr-py-10v')}>
						<Loader />
					</div>
				</div>
			)}
			<div className={cx(classes.scrollContainer)}>
				<div className={cx(fr.cx('fr-text--bold'), classes.scrollContent)}>
					{['Date', 'Heure'].concat(filteredBlocsLabel as string[]).map(b => (
						<div className={cx(fr.cx('fr-p-5v'), classes.item)}>{b}</div>
					))}
				</div>
				{reviews.map(r => (
					<div className={cx(classes.scrollContent)}>
						<div className={cx(fr.cx('fr-p-5v'), classes.item)}>
							{formatDateToFrenchString(
								r.created_at?.toISOString().split('T')[0] || ''
							)}
						</div>
						<div className={cx(fr.cx('fr-p-5v'), classes.item)}>
							{r.created_at?.toLocaleTimeString('fr-FR')}
						</div>
						{filteredBlocsID.map(f => (
							<div className={cx(fr.cx('fr-p-5v'), classes.item)}>
								{r.answers.find(a => a.block_id === f)?.content}
							</div>
						))}
					</div>
				))}
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
	},
	scrollContainer: {
		overflowX: 'auto',
		width: '100%',
		padding: '10px'
	},
	scrollContent: {
		display: 'flex',
		flexWrap: 'nowrap',
		gap: '10px',
		padding: '10px',
		width: 'max-content'
	},
	item: {
		width: '200px',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		margin: '5px 0',
		'&:nth-of-type(1), &:nth-of-type(2)': {
			width: '100px'
		},
		'&:nth-of-type(n+3)': {
			width: '250px'
		}
	}
});

export default FormBuilder;

export { getServerSideProps };
