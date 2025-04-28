import GenericFilters from '@/src/components/dashboard/Filters/Filters';
import FormConfigVersionsDisplay from '@/src/components/dashboard/Form/FormConfigVersionsDisplay';
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
import { useFilters } from '@/src/contexts/FiltersContext';
import { useRootFormTemplateContext } from '@/src/contexts/RootFormTemplateContext';
import ProductLayout from '@/src/layouts/Product/ProductLayout';
import {
	FormConfigWithChildren,
	ProductWithForms
} from '@/src/types/prismaTypesExtended';
import {
	formatDateToFrenchString,
	formatNumberWithSpaces
} from '@/src/utils/tools';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Accordion from '@codegouvfr/react-dsfr/Accordion';
import { Highlight } from '@codegouvfr/react-dsfr/Highlight';
import Alert from '@codegouvfr/react-dsfr/Alert';
import { Button } from '@codegouvfr/react-dsfr/Button';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import Select from '@codegouvfr/react-dsfr/Select';
import { FormTemplateBlockOption, RightAccessStatus } from '@prisma/client';
import { push } from '@socialgouv/matomo-next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Fragment, useEffect, useState } from 'react';
import { tss } from 'tss-react/dsfr';
import { getServerSideProps } from '.';

interface Props {
	product: ProductWithForms;
	ownRight: Exclude<RightAccessStatus, 'removed'>;
}

interface CommonStepProps {
	productId: number;
	buttonId?: number;
	startDate: string;
	endDate: string;
}

export interface HideBlockOptionsHelper {
	options: FormTemplateBlockOption[];
	date: Date;
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

export const OldSectionWrapper = ({
	children,
	formConfig
}: {
	children: React.ReactNode;
	formConfig?: FormConfigWithChildren;
}) => {
	const { classes, cx } = useStyles();

	return (
		<div>
			<div className={cx(classes.alertContainer)}>
				<i className={fr.cx('ri-alert-fill')} /> Cette section présente les
				résultats aux questions des anciennes versions du formulaire. La version
				actuellement en vigueur a été publiée le{' '}
				{formConfig
					? formatDateToFrenchString(formConfig.created_at.toString())
					: '03 juillet 2024'}
				.
			</div>
			{children}
		</div>
	);
};

const nbMaxReviews = 500000;

const ProductStatPage = (props: Props) => {
	const { product, ownRight } = props;
	const { formTemplate } = useRootFormTemplateContext();

	const router = useRouter();

	const { classes, cx } = useStyles();

	const { filters, updateFilters } = useFilters();

	const [oldSectionExpanded, setOldSectionExpanded] = useState(false);
	const [selectedButton, setSelectedButton] = useState<number | undefined>(
		filters['productStats'].buttonId
	);
	useEffect(() => {
		setSelectedButton(filters['productStats'].buttonId);
	}, [filters['productStats'].buttonId]);

	const formConfigs = product.forms[0].form_configs;
	const currentFormConfig = formConfigs[formConfigs.length - 1];
	const formConfigHiddenSteps =
		currentFormConfig?.form_config_displays.filter(
			fcd => fcd.kind === 'step'
		) || [];
	const formConfigHiddenOptions =
		currentFormConfig?.form_config_displays.filter(
			fcd => fcd.kind === 'blockOption'
		) || [];

	const formTempalteBlockOptionsHidden = (
		formTemplate?.form_template_steps || []
	).reduce(
		(acc, step) => {
			step.form_template_blocks.forEach(block => {
				const blockOptions = block.options.filter(option =>
					formConfigHiddenOptions.map(fcd => fcd.parent_id).includes(option.id)
				);
				acc.options = acc.options.concat(blockOptions);
			});
			return acc;
		},
		{
			options: [],
			date: currentFormConfig?.created_at
		} as HideBlockOptionsHelper
	);

	const hiddenSteps = formConfigHiddenSteps
		.map(fcd => {
			const stepIndex = formTemplate?.form_template_steps.findIndex(
				f => f.id === fcd.parent_id
			);

			return stepIndex;
		})
		.filter(
			stepIndex => stepIndex !== undefined && stepIndex !== -1
		) as number[];

	const { data: buttonResults, isLoading: isLoadingButtons } =
		trpc.button.getList.useQuery(
			{
				page: 1,
				numberPerPage: 1000,
				form_id: product.forms[0].id,
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
			pathname: `/administration/dashboard/product/${product.id}/forms`,
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

	const hiddableStepsConfiguration = [
		{
			stepIndex: 1,
			component: (props: CommonStepProps) => (
				<BarQuestionViz
					fieldCode="comprehension"
					total={nbReviewsWithFilters}
					{...props}
				/>
			)
		},
		{
			stepIndex: 2,
			component: (props: CommonStepProps) => (
				<>
					<BarMultipleQuestionViz
						fieldCode="contact_tried"
						total={nbReviewsWithFilters}
						hiddenOptions={formTempalteBlockOptionsHidden}
						{...props}
					/>
					<BarMultipleSplitQuestionViz
						fieldCode="contact_reached"
						total={nbReviewsWithFiltersForm2}
						hiddenOptions={formTempalteBlockOptionsHidden}
						{...props}
					/>
					<BarMultipleSplitQuestionViz
						fieldCode="contact_satisfaction"
						total={nbReviewsWithFiltersForm2}
						hiddenOptions={formTempalteBlockOptionsHidden}
						{...props}
					/>
				</>
			)
		}
	];

	const renderVisibleSteps = (
		hiddenSteps: number[],
		props: CommonStepProps
	) => {
		return hiddableStepsConfiguration.map(({ stepIndex, component }) => {
			if (!hiddenSteps.includes(stepIndex)) {
				return <Fragment key={stepIndex}>{component(props)}</Fragment>;
			}
			return null;
		});
	};

	const renderHiddenSteps = (hiddenSteps: number[], props: CommonStepProps) => {
		return hiddableStepsConfiguration.map(({ stepIndex, component }) => {
			if (hiddenSteps.includes(stepIndex)) {
				return <Fragment key={stepIndex}>{component(props)}</Fragment>;
			}
			return null;
		});
	};

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
									linkHref={`/administration/dashboard/product/${product.id}/forms`}
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
					{renderVisibleSteps(hiddenSteps, {
						productId: product.id,
						buttonId: filters.productStats.buttonId,
						startDate: filters.productStats.currentStartDate,
						endDate: filters.productStats.currentEndDate
					})}
				</SectionWrapper>
				<Accordion
					label="Détails des anciennes réponses"
					onExpandedChange={value => setOldSectionExpanded(!value)}
					expanded={oldSectionExpanded}
					className={cx(classes.oldSectionWrapper)}
				>
					<OldSectionWrapper formConfig={currentFormConfig}>
						{renderHiddenSteps(hiddenSteps, {
							productId: product.id,
							buttonId: filters.productStats.buttonId,
							startDate: filters.productStats.currentStartDate,
							endDate: filters.productStats.currentEndDate
						})}
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
							hiddenOptions={formTempalteBlockOptionsHidden}
						/>
					</OldSectionWrapper>
				</Accordion>
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
				<GenericFilters filterKey="productStats" sticky={true}>
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
				{!!formConfigs.length && (
					<div className={fr.cx('fr-mt-8v')}>
						<FormConfigVersionsDisplay
							formConfigs={formConfigs}
							product={product}
						/>
					</div>
				)}
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
	oldSectionWrapper: {
		'.fr-collapse': {
			backgroundColor: fr.colors.decisions.background.default.grey.hover,
			margin: `0 1px`
		}
	},
	alertContainer: {
		fontWeight: 'bold',
		backgroundColor: fr.colors.decisions.background.default.grey.active,
		margin: fr.spacing('1v'),
		padding: fr.spacing('4v'),
		'.ri-alert-fill': {
			color: fr.colors.decisions.background.actionHigh.blueFrance.default,
			marginRight: fr.spacing('1v')
		}
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
