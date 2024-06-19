import NoButtonsPanel from '@/src/components/dashboard/Pannels/NoButtonsPanel';
import NoReviewsPanel from '@/src/components/dashboard/Pannels/NoReviewsPanel';
import Filters from '@/src/components/dashboard/Stats/Filters';
import KPITile from '@/src/components/dashboard/Stats/KPITile';
import ObservatoireStats from '@/src/components/dashboard/Stats/ObservatoireStats';
import PublicDataModal from '@/src/components/dashboard/Stats/PublicDataModal';
import SmileyQuestionViz from '@/src/components/dashboard/Stats/SmileyQuestionViz';
import { Loader } from '@/src/components/ui/Loader';
import ProductLayout from '@/src/layouts/Product/ProductLayout';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import { Button } from '@codegouvfr/react-dsfr/Button';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { Product } from '@prisma/client';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { tss } from 'tss-react/dsfr';
import { useDebounce } from 'usehooks-ts';
import { getServerSideProps } from '.';
import BarQuestionViz from '@/src/components/dashboard/Stats/BarQuestionViz';
import AnswersChart from '@/src/components/dashboard/Stats/AnswersChart';
import BarMultipleQuestionViz from '@/src/components/dashboard/Stats/BarMultipleQuestionViz';
import BarMultipleSplitQuestionViz from '@/src/components/dashboard/Stats/BarMultipleSplitQuestionViz';
import { Highlight } from '@codegouvfr/react-dsfr/Highlight';
import { betaTestXwikiIds } from '@/src/utils/tools';

interface Props {
	product: Product;
}

const public_modal = createModal({
	id: 'public-modal',
	isOpenedByDefault: false
});

const SectionWrapper = ({
	title,
	alert = '',
	total,
	children
}: {
	title: string;
	alert?: string;
	total: number;
	children: React.ReactNode;
}) => {
	const { classes, cx } = useStyles();

	if (!total) return;

	return (
		<div className={fr.cx('fr-mt-5w')}>
			<h3>{title}</h3>
			{alert && (
				<Highlight className={cx(classes.highlight)}>{alert}</Highlight>
			)}
			<div>{children}</div>
		</div>
	);
};

const ProductStatPage = (props: Props) => {
	const { product } = props;
	const router = useRouter();

	const { classes, cx } = useStyles();

	const [startDate, setStartDate] = useState<string>(
		new Date(new Date().setFullYear(new Date().getFullYear() - 1))
			.toISOString()
			.split('T')[0]
	);
	const [endDate, setEndDate] = useState<string>(
		new Date().toISOString().split('T')[0]
	);

	const debouncedStartDate = useDebounce<string>(startDate, 500);
	const debouncedEndDate = useDebounce<string>(endDate, 500);

	const { data: buttonsResult, isFetching: isLoadingButtons } =
		trpc.button.getList.useQuery(
			{
				numberPerPage: 0,
				page: 1,
				product_id: product.id,
				isTest: false
			},
			{
				initialData: {
					data: [],
					metadata: {
						count: 0
					}
				}
			}
		);

	const { data: reviewsData, isLoading: isLoadingReviewsCount } =
		trpc.review.getList.useQuery({
			numberPerPage: 0,
			page: 1,
			product_id: product.id
		});

	const {
		data: reviewsDataWithFilters,
		isLoading: isLoadingReviewsDataWithFilters
	} = trpc.review.getList.useQuery({
		numberPerPage: 0,
		page: 1,
		product_id: product.id,
		start_date: debouncedStartDate,
		end_date: debouncedEndDate
	});

	const { data: dataNbVerbatims, isLoading: isLoadingNbVerbatims } =
		trpc.answer.countByFieldCode.useQuery({
			product_id: product.id,
			field_code: 'verbatim',
			start_date: debouncedStartDate,
			end_date: debouncedEndDate
		});

	const nbReviews = reviewsData?.metadata.countAll || 0;
	const nbReviewsWithFilters =
		reviewsDataWithFilters?.metadata.countFiltered || 0;
	const nbVerbatims = dataNbVerbatims?.data || 0;
	const percetengeVerbatimsOfReviews = !!nbReviewsWithFilters
		? ((nbVerbatims / nbReviewsWithFilters) * 100).toFixed(0) || 0
		: 0;

	const handleButtonClick = () => {
		router.push({
			pathname: `/administration/dashboard/product/${product.id}/buttons`,
			query: { autoCreate: true }
		});
	};

	const handleSendInvitation = () => {
		router.push({
			pathname: `/administration/dashboard/product/${product.id}/access`,
			query: { autoInvite: true }
		});
	};

	if (nbReviews === undefined || isLoadingButtons || isLoadingReviewsCount) {
		return (
			<ProductLayout product={product}>
				<h1>Statistiques</h1>
				<div className={fr.cx('fr-mt-20v')}>
					<Loader />
				</div>
			</ProductLayout>
		);
	}

	if (nbReviews === 0 || buttonsResult.metadata.count === 0) {
		return (
			<ProductLayout product={product}>
				<Head>
					<title>{product.title} | Statistiques | Je donne mon avis</title>
					<meta
						name="description"
						content={`${product.title} | Statistiques | Je donne mon avis`}
					/>
				</Head>
				<h1>Statistiques</h1>
				{buttonsResult.metadata.count === 0 ? (
					<NoButtonsPanel isSmall onButtonClick={handleButtonClick} />
				) : (
					<NoReviewsPanel
						improveBtnClick={() => {}}
						sendInvitationBtnClick={handleSendInvitation}
					/>
				)}
			</ProductLayout>
		);
	}

	return (
		<ProductLayout product={product}>
			<Head>
				<title>{product.title} | Statistiques | Je donne mon avis</title>
				<meta
					name="description"
					content={`${product.title} Avis | Je donne mon avis`}
				/>
			</Head>
			<PublicDataModal modal={public_modal} product={product} />
			<div className={cx(classes.title)}>
				<h1 className={fr.cx('fr-mb-0')}>Statistiques</h1>

				<Button
					priority="secondary"
					type="button"
					nativeButtonProps={public_modal.buttonProps}
				>
					Autoriser le partage public des statistiques
				</Button>
			</div>
			<div className={cx(classes.container)}>
				<Filters
					currentStartDate={startDate}
					currentEndDate={endDate}
					onChange={(tmpStartDate, tmpEndDate) => {
						if (tmpStartDate !== startDate) setStartDate(tmpStartDate);
						if (tmpEndDate !== endDate) setEndDate(tmpEndDate);
					}}
				/>
				<ObservatoireStats
					productId={product.id}
					startDate={debouncedStartDate}
					endDate={debouncedEndDate}
				/>
				<div className={fr.cx('fr-mt-5w')}>
					<h3>Participation</h3>
					<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
						<div className={fr.cx('fr-col-6')}>
							<KPITile
								title="Avis"
								kpi={nbReviewsWithFilters}
								isLoading={isLoadingReviewsDataWithFilters}
								linkHref={`/administration/dashboard/product/${product.id}/reviews`}
							/>
						</div>
						<div className={fr.cx('fr-col-6')}>
							<KPITile
								title="Verbatims"
								kpi={nbVerbatims}
								isLoading={isLoadingNbVerbatims}
								desc={
									percetengeVerbatimsOfReviews
										? `soit ${percetengeVerbatimsOfReviews} % des répondants`
										: undefined
								}
								linkHref={`/administration/dashboard/product/${product.id}/reviews?view=verbatim`}
							/>
						</div>
						{/* <div className={fr.cx('fr-col-4')}>
							<KPITile
								title="Formulaires complets"
								kpi={0}
								desc="soit 0 % des répondants"
								linkHref={`/administration/dashboard/product/${product.id}/buttons`}
								hideLink
								grey
							/>
						</div> */}
					</div>
				</div>
				<AnswersChart
					fieldCode="satisfaction"
					productId={product.id}
					startDate={debouncedStartDate}
					endDate={debouncedEndDate}
					total={nbReviewsWithFilters}
				/>
				<SectionWrapper
					title="Détails des réponses"
					total={nbReviewsWithFilters}
				>
					<SmileyQuestionViz
						fieldCode="satisfaction"
						total={nbReviewsWithFilters}
						productId={product.id}
						startDate={debouncedStartDate}
						endDate={debouncedEndDate}
						required
					/>
					<BarQuestionViz
						fieldCode="comprehension"
						total={nbReviewsWithFilters}
						productId={product.id}
						startDate={debouncedStartDate}
						endDate={debouncedEndDate}
					/>
					<BarMultipleQuestionViz
						fieldCode="contact_tried"
						total={nbReviewsWithFilters}
						productId={product.id}
						startDate={debouncedStartDate}
						endDate={debouncedEndDate}
					/>
					<BarMultipleSplitQuestionViz
						fieldCode="contact_reached"
						total={nbReviewsWithFilters}
						productId={product.id}
						startDate={debouncedStartDate}
						endDate={debouncedEndDate}
					/>
					<BarMultipleSplitQuestionViz
						fieldCode="contact_satisfaction"
						total={nbReviewsWithFilters}
						productId={product.id}
						startDate={debouncedStartDate}
						endDate={debouncedEndDate}
					/>
				</SectionWrapper>
				<SectionWrapper
					title="Détails des anciennes réponses"
					alert={`Cette section présente les résultats de l'ancien questionnaire, modifié le ${product.xwiki_id && betaTestXwikiIds.includes(product.xwiki_id) ? '19 juin 2024.' : '03 juillet 2024.'}`}
					total={nbReviewsWithFilters}
				>
					<SmileyQuestionViz
						fieldCode="easy"
						total={nbReviewsWithFilters}
						productId={product.id}
						startDate={debouncedStartDate}
						endDate={debouncedEndDate}
						required
					/>
					<BarMultipleQuestionViz
						fieldCode="difficulties"
						total={nbReviewsWithFilters}
						productId={product.id}
						startDate={debouncedStartDate}
						endDate={debouncedEndDate}
					/>
				</SectionWrapper>
			</div>
		</ProductLayout>
	);
};

const useStyles = tss.create({
	wrapperGlobal: {
		display: 'flex',
		flexDirection: 'column',
		gap: '3rem',
		padding: '2rem',
		border: '1px solid #E5E5E5'
	},
	container: {
		position: 'relative'
	},
	overLoader: {
		position: 'absolute',
		display: 'block',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
		backgroundColor: 'white',
		zIndex: 9
	},
	title: {
		display: 'flex',
		justifyContent: 'space-between',
		marginBottom: '1rem',
		[fr.breakpoints.down('lg')]: {
			flexDirection: 'column',
			'.fr-btn': {
				marginTop: '1rem'
			}
		}
	},
	highlight: {
		backgroundColor: fr.colors.decisions.background.contrast.grey.default,
		margin: 0,
		paddingTop: fr.spacing('7v'),
		paddingBottom: fr.spacing('7v'),
		paddingLeft: fr.spacing('12v'),
		marginBottom: fr.spacing('6v'),
		p: {
			margin: 0
		}
	}
});

export default ProductStatPage;

export { getServerSideProps };
