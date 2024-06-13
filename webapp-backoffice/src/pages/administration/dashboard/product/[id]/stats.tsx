import NoButtonsPanel from '@/src/components/dashboard/Pannels/NoButtonsPanel';
import NoReviewsPanel from '@/src/components/dashboard/Pannels/NoReviewsPanel';
import PublicDataModal from '@/src/components/dashboard/Stats/PublicDataModal';
import ReviewAverageInterval from '@/src/components/dashboard/Stats/ReviewAverageInterval';
import ReviewAverage from '@/src/components/dashboard/Stats/ReviewInterval';
import SmileyQuestionViz from '@/src/components/dashboard/Stats/SmileyQuestionViz';
import { Loader } from '@/src/components/ui/Loader';
import { useStats } from '@/src/contexts/StatsContext';
import ProductLayout from '@/src/layouts/Product/ProductLayout';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Alert from '@codegouvfr/react-dsfr/Alert';
import { Button } from '@codegouvfr/react-dsfr/Button';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { Product } from '@prisma/client';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { tss } from 'tss-react/dsfr';
import { useDebounce } from 'usehooks-ts';
import { getServerSideProps } from '.';
import Filters from '@/src/components/dashboard/Stats/Filters';
import ObservatoireStats from '@/src/components/dashboard/Stats/ObservatoireStats';
import KPITile from '@/src/components/dashboard/Stats/KPITile';
import AnswersChart from '@/src/components/dashboard/Stats/AnswersChart';

interface Props {
	product: Product;
}

const public_modal = createModal({
	id: 'public-modal',
	isOpenedByDefault: false
});

const SectionWrapper = ({
	title,
	count,
	noDataText = 'Aucune donnée',
	children
}: {
	title: string;
	count?: number;
	noDataText?: string;
	children: React.ReactNode;
}) => {
	const { classes, cx } = useStyles();

	return (
		<div className={cx(classes.wrapperGlobal, fr.cx('fr-mt-5w'))}>
			<h2 className={fr.cx('fr-mb-0')}>{title}</h2>
			{count === 0 && (
				<Alert title="" description={noDataText} severity="info" />
			)}
			{children}
		</div>
	);
};

const ProductStatPage = (props: Props) => {
	const { product } = props;
	const { statsTotals } = useStats();
	const router = useRouter();
	const isTotalLoading = statsTotals.satisfaction === undefined;

	const { classes, cx } = useStyles();

	const [startDate, setStartDate] = useState<string>(
		new Date(new Date().setFullYear(new Date().getFullYear() - 1))
			.toISOString()
			.split('T')[0]
	);
	const [endDate, setEndDate] = useState<string>(
		new Date().toISOString().split('T')[0]
	);

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

	const { data: dataNbVerbatims, isLoading: isLoadingNbVerbatims } =
		trpc.answer.countByFieldCode.useQuery({
			product_id: product.id,
			field_code: 'verbatim',
			start_date: startDate,
			end_date: endDate
		});

	const debouncedStartDate = useDebounce<string>(startDate, 500);
	const debouncedEndDate = useDebounce<string>(endDate, 500);
	const nbReviews = reviewsData?.metadata.countAll || 0;
	const nbVerbatims = dataNbVerbatims?.data || 0;
	const percetengeVerbatimsOfReviews =
		((nbVerbatims / nbReviews) * 100).toFixed(0) || '0';

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
				{isTotalLoading && (
					<div className={cx(classes.overLoader, fr.cx('fr-pt-12v'))}>
						<Loader />
					</div>
				)}
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
								kpi={nbReviews}
								linkHref={`/administration/dashboard/product/${product.id}/reviews`}
							/>
						</div>
						<div className={fr.cx('fr-col-6')}>
							<KPITile
								title="Verbatims"
								kpi={nbVerbatims}
								isLoading={isLoadingNbVerbatims}
								desc={`soit ${percetengeVerbatimsOfReviews} % des répondants`}
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
					productId={product.id}
					startDate={debouncedStartDate}
					endDate={debouncedEndDate}
				/>
				<SectionWrapper
					title="Satisfaction usagers"
					count={statsTotals.satisfaction}
					noDataText="Aucune donnée pour la satisfaction usagers"
				>
					<SmileyQuestionViz
						fieldCode="satisfaction"
						productId={product.id}
						startDate={debouncedStartDate}
						endDate={debouncedEndDate}
					/>
					<ReviewAverageInterval
						fieldCode="satisfaction"
						productId={product.id}
						startDate={startDate}
						endDate={endDate}
					/>
					<ReviewAverage
						fieldCode="satisfaction"
						productId={product.id}
						startDate={startDate}
						endDate={endDate}
					/>
				</SectionWrapper>
				<SectionWrapper
					title="Facilité d'usage"
					count={statsTotals.easy}
					noDataText="Aucune donnée pour la facilité d'usage"
				>
					<SmileyQuestionViz
						fieldCode="easy"
						productId={product.id}
						startDate={debouncedStartDate}
						endDate={debouncedEndDate}
					/>
				</SectionWrapper>
				<SectionWrapper
					title="Simplicité du langage"
					count={statsTotals.comprehension}
					noDataText="Aucune donnée pour la simplicité du langage"
				>
					<SmileyQuestionViz
						fieldCode="comprehension"
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
	}
});

export default ProductStatPage;

export { getServerSideProps };
