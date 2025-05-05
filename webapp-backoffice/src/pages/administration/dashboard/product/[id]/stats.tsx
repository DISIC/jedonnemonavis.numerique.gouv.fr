import NoButtonsPanel from '@/src/components/dashboard/Pannels/NoButtonsPanel';
import NoReviewsPanel from '@/src/components/dashboard/Pannels/NoReviewsPanel';
import AnswersChart from '@/src/components/dashboard/Stats/AnswersChart';
import BarMultipleQuestionViz from '@/src/components/dashboard/Stats/BarMultipleQuestionViz';
import BarMultipleSplitQuestionViz from '@/src/components/dashboard/Stats/BarMultipleSplitQuestionViz';
import BarQuestionViz from '@/src/components/dashboard/Stats/BarQuestionViz';
import KPITile from '@/src/components/dashboard/Stats/KPITile';
import ObservatoireStats from '@/src/components/dashboard/Stats/ObservatoireStats';
import PublicDataModal from '@/src/components/dashboard/Stats/PublicDataModal';
import SmileyQuestionViz from '@/src/components/dashboard/Stats/SmileyQuestionViz';
import { Loader } from '@/src/components/ui/Loader';
import ProductLayout from '@/src/layouts/Product/ProductLayout';
import { betaTestXwikiIds, formatNumberWithSpaces } from '@/src/utils/tools';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Alert from '@codegouvfr/react-dsfr/Alert';
import { Button } from '@codegouvfr/react-dsfr/Button';
import { Highlight } from '@codegouvfr/react-dsfr/Highlight';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { Product, RightAccessStatus } from '@prisma/client';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { tss } from 'tss-react/dsfr';
import { useDebounce } from 'usehooks-ts';
import { getServerSideProps } from '.';
import GenericFilters from '@/src/components/dashboard/Filters/Filters';
import { useFilters } from '@/src/contexts/FiltersContext';
import Select from '@codegouvfr/react-dsfr/Select';
import { push } from '@socialgouv/matomo-next';

interface Props {
	product: Product;
	ownRight: Exclude<RightAccessStatus, 'removed'>;
}

const public_modal = createModal({
	id: 'public-modal',
	isOpenedByDefault: false
});

export const SectionWrapper = ({
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
			<h2>{title}</h2>
			{alert && (
				<Highlight className={cx(classes.highlight)}>{alert}</Highlight>
			)}
			<div>{children}</div>
		</div>
	);
};

const nbMaxReviews = 500000;

const ProductStatPage = (props: Props) => {
	const { product, ownRight } = props;
	const router = useRouter();

	const { classes, cx } = useStyles();

	const { filters, updateFilters } = useFilters();

	const [selectedButton, setSelectedButton] = useState<number | undefined>(
		filters['productStats'].buttonId
	);
	useEffect(() => {
		setSelectedButton(filters['productStats'].buttonId);
	}, [filters['productStats'].buttonId]);

	const { data: buttonResults, isLoading: isLoadingButtons } =
		trpc.button.getList.useQuery(
			{
				page: 1,
				numberPerPage: 1000,
				product_id: product.id,
				isTest: false
			},
			{
				initialData: {
					data: [],
					metadata: {
						count: 0
					}
				},
				enabled: !!product.id && !isNaN(product.id)
			}
		);

	const { data: reviewsData, isLoading: isLoadingReviewsCount } =
		trpc.review.countReviews.useQuery({
			numberPerPage: 0,
			page: 1,
			product_id: product.id
		});

	const {
		data: reviewsDataWithFilters,
		isLoading: isLoadingReviewsDataWithFilters
	} = trpc.review.countReviews.useQuery(
		{
			numberPerPage: 0,
			page: 1,
			product_id: product.id,
			start_date: filters.productStats.currentStartDate,
			end_date: filters.productStats.currentEndDate,
			filters: {
				buttonId: filters.productStats.buttonId
					? [filters.productStats.buttonId?.toString()]
					: []
			}
		},
		{
			enabled: !!filters.productStats.currentEndDate
		}
	);

	const { data: dataNbVerbatims, isLoading: isLoadingNbVerbatims } =
		trpc.answer.countByFieldCode.useQuery(
			{
				product_id: product.id,
				...(filters.productStats.buttonId && {
					button_id: filters.productStats.buttonId
				}),
				field_code: 'verbatim',
				start_date: filters.productStats.currentStartDate,
				end_date: filters.productStats.currentEndDate
			},
			{
				enabled: !!filters.productStats.currentEndDate
			}
		);

	const nbReviews = reviewsData?.metadata.countAll || 0;
	const nbReviewsWithFilters =
		reviewsDataWithFilters?.metadata.countFiltered || 0;
	const nbReviewsWithFiltersForm1 =
		reviewsDataWithFilters?.metadata.countForm1 || 0;
	const nbReviewsWithFiltersForm2 =
		reviewsDataWithFilters?.metadata.countForm2 || 0;
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
			<ProductLayout product={product} ownRight={ownRight}>
				<h1>Statistiques</h1>
				<div className={fr.cx('fr-mt-20v')}>
					<Loader />
				</div>
			</ProductLayout>
		);
	}

	if (nbReviews === 0 || buttonResults.metadata.count === 0) {
		return (
			<ProductLayout product={product} ownRight={ownRight}>
				<Head>
					<title>{product.title} | Statistiques | Je donne mon avis</title>
					<meta
						name="description"
						content={`${product.title} | Statistiques | Je donne mon avis`}
					/>
				</Head>
				<h1>Statistiques</h1>
				{buttonResults.metadata.count === 0 ? (
					<NoButtonsPanel onButtonClick={handleButtonClick} />
				) : (
					<NoReviewsPanel
						improveBtnClick={() => {}}
						sendInvitationBtnClick={handleSendInvitation}
					/>
				)}
			</ProductLayout>
		);
	}

	const getStatsDisplay = () => {
		if (isLoadingReviewsDataWithFilters) {
			return (
				<div className={fr.cx('fr-mt-16w')}>
					<Loader />
				</div>
			);
		}

		return (
			<>
				<ObservatoireStats
					productId={product.id}
					buttonId={filters.productStats.buttonId}
					startDate={filters.productStats.currentStartDate}
					endDate={filters.productStats.currentEndDate}
				/>
				<div className={fr.cx('fr-mt-5w')}>
					<h4>Participation</h4>
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
					buttonId={filters.productStats.buttonId}
					startDate={filters.productStats.currentStartDate}
					endDate={filters.productStats.currentEndDate}
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
						buttonId={filters.productStats.buttonId}
						startDate={filters.productStats.currentStartDate}
						endDate={filters.productStats.currentEndDate}
						required
					/>
					<BarQuestionViz
						fieldCode="comprehension"
						total={nbReviewsWithFilters}
						productId={product.id}
						buttonId={filters.productStats.buttonId}
						startDate={filters.productStats.currentStartDate}
						endDate={filters.productStats.currentEndDate}
					/>
					<BarMultipleQuestionViz
						fieldCode="contact_tried"
						total={nbReviewsWithFilters}
						productId={product.id}
						buttonId={filters.productStats.buttonId}
						startDate={filters.productStats.currentStartDate}
						endDate={filters.productStats.currentEndDate}
					/>
					<BarMultipleSplitQuestionViz
						fieldCode="contact_reached"
						total={nbReviewsWithFiltersForm2}
						productId={product.id}
						buttonId={filters.productStats.buttonId}
						startDate={filters.productStats.currentStartDate}
						endDate={filters.productStats.currentEndDate}
					/>
					<BarMultipleSplitQuestionViz
						fieldCode="contact_satisfaction"
						total={nbReviewsWithFiltersForm2}
						productId={product.id}
						buttonId={filters.productStats.buttonId}
						startDate={filters.productStats.currentStartDate}
						endDate={filters.productStats.currentEndDate}
					/>
				</SectionWrapper>
				<SectionWrapper
					title="Détails des anciennes réponses"
					alert={`Cette section présente les résultats de l'ancien questionnaire, modifié le ${product.xwiki_id && betaTestXwikiIds.includes(product.xwiki_id) ? '19 juin 2024.' : '03 juillet 2024.'}`}
					total={nbReviewsWithFilters}
				>
					<SmileyQuestionViz
						fieldCode="easy"
						total={nbReviewsWithFiltersForm1}
						productId={product.id}
						buttonId={filters.productStats.buttonId}
						startDate={filters.productStats.currentStartDate}
						endDate={filters.productStats.currentEndDate}
					/>
					<BarMultipleQuestionViz
						fieldCode="difficulties"
						total={nbReviewsWithFiltersForm1}
						productId={product.id}
						buttonId={filters.productStats.buttonId}
						startDate={filters.productStats.currentStartDate}
						endDate={filters.productStats.currentEndDate}
					/>
				</SectionWrapper>
			</>
		);
	};

	return (
		<ProductLayout product={product} ownRight={ownRight}>
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
				{ownRight === 'carrier_admin' && (
					<Button
						priority="secondary"
						type="button"
						nativeButtonProps={public_modal.buttonProps}
					>
						Rendre ces statistiques publiques
					</Button>
				)}
			</div>
			<div className={cx(classes.container)}>
				<GenericFilters filterKey="productStats" >
					<Select
						label="Sélectionner une source"
						nativeSelectProps={{
							value: selectedButton ?? 'undefined',
							onChange: e => {
								const newValue =
									e.target.value === 'undefined'
										? undefined
										: parseInt(e.target.value);

								setSelectedButton(newValue); // Mise à jour du state local pour refléter la sélection

								updateFilters({
									...filters,
									productStats: {
										...filters['productStats'],
										hasChanged: true,
										buttonId: newValue
									}
								});

								push(['trackEvent', 'Stats', 'Sélection-bouton']);
							}
						}}
					>
						<option value="undefined">Toutes les sources</option>
						{buttonResults?.data?.map(button => (
							<option key={button.id} value={button.id}>
								{button.title}
							</option>
						))}
					</Select>
				</GenericFilters>
				{!isLoadingReviewsDataWithFilters &&
				nbReviewsWithFilters > nbMaxReviews ? (
					<div className={fr.cx('fr-mt-10v')} role="status">
						<Alert
							title=""
							severity="error"
							description={`Votre recherche contient trop de résultats (plus de ${formatNumberWithSpaces(nbMaxReviews)} avis). Réduisez la fenêtre de temps.`}
						/>
					</div>
				) : (
					getStatsDisplay()
				)}
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
		border: `1px solid ${fr.colors.decisions.background.disabled.grey.default}`
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
