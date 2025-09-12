import GenericFilters from '@/src/components/dashboard/Filters/Filters';
import NoButtonsPanel from '@/src/components/dashboard/Pannels/NoButtonsPanel';
import NoReviewsPanel from '@/src/components/dashboard/Pannels/NoReviewsPanel';
import AnswersChart from '@/src/components/dashboard/Stats/AnswersChart';
import BarMultipleQuestionViz from '@/src/components/dashboard/Stats/BarMultipleQuestionViz';
import BarMultipleSplitQuestionViz from '@/src/components/dashboard/Stats/BarMultipleSplitQuestionViz';
import BarQuestionViz from '@/src/components/dashboard/Stats/BarQuestionViz';
import KPITile from '@/src/components/dashboard/Stats/KPITile';
import ObservatoireStats from '@/src/components/dashboard/Stats/ObservatoireStats';
import SmileyQuestionViz from '@/src/components/dashboard/Stats/SmileyQuestionViz';
import { Loader } from '@/src/components/ui/Loader';
import { useFilters } from '@/src/contexts/FiltersContext';
import { useRootFormTemplateContext } from '@/src/contexts/RootFormTemplateContext';
import {
	FormConfigWithChildren,
	FormWithElements
} from '@/src/types/prismaTypesExtended';
import {
	formatDateToFrenchString,
	formatNumberWithSpaces
} from '@/src/utils/tools';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import { Accordion } from '@codegouvfr/react-dsfr/Accordion';
import Alert from '@codegouvfr/react-dsfr/Alert';
import { Highlight } from '@codegouvfr/react-dsfr/Highlight';
import Select from '@codegouvfr/react-dsfr/Select';
import { FormTemplateBlockOption, RightAccessStatus } from '@prisma/client';
import { push } from '@socialgouv/matomo-next';
import { Fragment, useEffect, useState } from 'react';
import { tss } from 'tss-react/dsfr';
import { ButtonModalType } from '../../ProductButton/ButtonModal';

interface Props {
	form: FormWithElements;
	ownRight: Exclude<RightAccessStatus, 'removed'>;
	handleModalOpening: (modalType: ButtonModalType, button?: any) => void;
	onClickGoToReviews?: () => void;
}

export interface CommonStepProps {
	productId: number;
	formId: number;
	buttonId?: number;
	startDate: string;
	endDate: string;
}

export interface HideBlockOptionsHelper {
	options: FormTemplateBlockOption[];
	date: Date;
}

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
			<h3>{title}</h3>
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

const StatsTab = ({
	form,
	ownRight,
	handleModalOpening,
	onClickGoToReviews
}: Props) => {
	const { formTemplate } = useRootFormTemplateContext();
	const { classes, cx } = useStyles();
	const { filters, updateFilters } = useFilters();

	const [oldSectionExpanded, setOldSectionExpanded] = useState(false);

	const [selectedButton, setSelectedButton] = useState<number | undefined>(
		filters['productStats'].buttonId
	);

	useEffect(() => {
		setSelectedButton(filters['productStats'].buttonId);
	}, [filters['productStats'].buttonId]);

	const formConfigs = form.form_configs;
	const currentFormConfig = formConfigs[0];
	const formConfigHiddenSteps =
		currentFormConfig?.form_config_displays.filter(
			fcd => fcd.kind === 'step'
		) || [];
	const formConfigHiddenOptions =
		currentFormConfig?.form_config_displays.filter(
			fcd => fcd.kind === 'blockOption'
		) || [];

	const formTemplateBlockOptionsHidden = (
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
				form_id: form.id,
				isTest: false
			},
			{
				initialData: {
					data: [],
					metadata: {
						count: 0
					}
				},
				enabled: !!form.id && !isNaN(form.id)
			}
		);

	const { data: reviewsData, isLoading: isLoadingReviewsCount } =
		trpc.review.countReviews.useQuery({
			numberPerPage: 0,
			page: 1,
			product_id: form.product.id,
			form_id: form.id
		});

	const {
		data: reviewsDataWithFilters,
		isLoading: isLoadingReviewsDataWithFilters
	} = trpc.review.countReviews.useQuery(
		{
			numberPerPage: 0,
			page: 1,
			product_id: form.product.id,
			form_id: form.id,
			start_date: filters.sharedFilters.currentStartDate,
			end_date: filters.sharedFilters.currentEndDate,
			filters: {
				buttonId: filters.productStats.buttonId
					? [filters.productStats.buttonId?.toString()]
					: []
			}
		},
		{
			enabled: !!filters.sharedFilters.currentEndDate
		}
	);

	const { data: dataNbVerbatims, isLoading: isLoadingNbVerbatims } =
		trpc.answer.countByFieldCode.useQuery(
			{
				product_id: form.product.id,
				form_id: form.id,
				...(filters.productStats.buttonId && {
					button_id: filters.productStats.buttonId
				}),
				field_code: 'verbatim',
				start_date: filters.sharedFilters.currentStartDate,
				end_date: filters.sharedFilters.currentEndDate
			},
			{
				enabled: !!filters.sharedFilters.currentEndDate
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
		handleModalOpening('create');
	};

	if (nbReviews === undefined || isLoadingButtons || isLoadingReviewsCount) {
		return (
			<div className={cx(classes.container)}>
				<h2>Statistiques</h2>
				<div className={cx(classes.loaderContainer)}>
					<Loader />
				</div>
			</div>
		);
	}

	if (nbReviews === 0 || buttonResults.metadata.count === 0) {
		return (
			<div className={cx(classes.container)}>
				<h2>Statistiques</h2>
				{form.isDeleted ? (
					<div
						className={fr.cx('fr-col-12')}
						style={{ display: 'flex', justifyContent: 'center' }}
					>
						<span>Ce formulaire est fermé</span>
					</div>
				) : buttonResults.metadata.count === 0 ? (
					<NoButtonsPanel onButtonClick={handleButtonClick} />
				) : (
					<NoReviewsPanel />
				)}
			</div>
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
						hiddenOptions={formTemplateBlockOptionsHidden}
						{...props}
					/>
					<BarMultipleSplitQuestionViz
						fieldCode="contact_reached"
						total={nbReviewsWithFiltersForm2}
						hiddenOptions={formTemplateBlockOptionsHidden}
						{...props}
					/>
					<BarMultipleSplitQuestionViz
						fieldCode="contact_satisfaction"
						total={nbReviewsWithFiltersForm2}
						hiddenOptions={formTemplateBlockOptionsHidden}
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
				<div className={cx(classes.loaderContainer)}>
					<Loader />
				</div>
			);
		}

		return (
			<>
				<div className={cx(classes.observatoireStats)}>
					<ObservatoireStats
						productId={form.product.id}
						formId={form.id}
						formConfig={currentFormConfig}
						buttonId={filters.productStats.buttonId}
						startDate={filters.sharedFilters.currentStartDate}
						endDate={filters.sharedFilters.currentEndDate}
					/>
				</div>
				<div className={fr.cx('fr-mt-5w')}>
					<h3>Participation</h3>
					<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
						<div className={fr.cx('fr-col-12', 'fr-col-md-6')}>
							<KPITile
								title="Avis"
								kpi={nbReviewsWithFilters}
								isLoading={isLoadingReviewsDataWithFilters}
								linkHref={`/administration/dashboard/product/${form.product.id}/forms/${form.id}?tab=reviews`}
								onClick={onClickGoToReviews}
							/>
						</div>
						<div className={fr.cx('fr-col-12', 'fr-col-md-6')}>
							<KPITile
								title="Commentaires"
								kpi={nbVerbatims}
								isLoading={isLoadingNbVerbatims}
								desc={
									percetengeVerbatimsOfReviews
										? `soit ${percetengeVerbatimsOfReviews} % des répondants`
										: undefined
								}
								linkHref={`/administration/dashboard/product/${form.product.id}/forms/${form.id}?tab=reviews`}
								onClick={onClickGoToReviews}
							/>
						</div>
					</div>
				</div>
				<AnswersChart
					fieldCode="satisfaction"
					productId={form.product.id}
					formId={form.id}
					buttonId={filters.productStats.buttonId}
					startDate={filters.sharedFilters.currentStartDate}
					endDate={filters.sharedFilters.currentEndDate}
					total={nbReviewsWithFilters}
				/>
				<SectionWrapper
					title="Détails des réponses"
					total={nbReviewsWithFilters}
				>
					<SmileyQuestionViz
						fieldCode="satisfaction"
						total={nbReviewsWithFilters}
						productId={form.product.id}
						formId={form.id}
						buttonId={filters.productStats.buttonId}
						startDate={filters.sharedFilters.currentStartDate}
						endDate={filters.sharedFilters.currentEndDate}
						required
					/>
					{renderVisibleSteps(hiddenSteps, {
						productId: form.product_id,
						formId: form.id,
						buttonId: filters.productStats.buttonId,
						startDate: filters.sharedFilters.currentStartDate,
						endDate: filters.sharedFilters.currentEndDate
					})}
				</SectionWrapper>
				{!!nbReviewsWithFilters && (
					<Accordion
						label="Détails des anciennes réponses"
						onExpandedChange={value => setOldSectionExpanded(!value)}
						expanded={oldSectionExpanded}
						className={cx(classes.oldSectionWrapper)}
					>
						<OldSectionWrapper formConfig={currentFormConfig}>
							{hiddenSteps.length > 0 && (
								<div className={fr.cx('fr-mb-8v', 'fr-mt-4v')}>
									<h4 className={fr.cx('fr-mt-6v')}>
										Indicateurs cachés de vos démarches essentielles
									</h4>
									<ObservatoireStats
										productId={form.product.id}
										formId={form.id}
										formConfig={currentFormConfig}
										buttonId={filters.productStats.buttonId}
										startDate={filters.sharedFilters.currentStartDate}
										endDate={filters.sharedFilters.currentEndDate}
										showHiddenSteps
										noTitle
									/>
								</div>
							)}
							{renderHiddenSteps(hiddenSteps, {
								productId: form.product_id,
								formId: form.id,
								buttonId: filters.productStats.buttonId,
								startDate: filters.sharedFilters.currentStartDate,
								endDate: filters.sharedFilters.currentEndDate
							})}
							<SmileyQuestionViz
								fieldCode="easy"
								total={nbReviewsWithFiltersForm1}
								productId={form.product.id}
								formId={form.id}
								buttonId={filters.productStats.buttonId}
								startDate={filters.sharedFilters.currentStartDate}
								endDate={filters.sharedFilters.currentEndDate}
							/>
							<BarMultipleQuestionViz
								fieldCode="difficulties"
								total={nbReviewsWithFiltersForm1}
								productId={form.product.id}
								formId={form.id}
								buttonId={filters.productStats.buttonId}
								startDate={filters.sharedFilters.currentStartDate}
								endDate={filters.sharedFilters.currentEndDate}
							/>
						</OldSectionWrapper>
					</Accordion>
				)}
			</>
		);
	};

	return (
		<div className={cx(classes.container)}>
			<div className={cx(classes.title)}>
				<h2 className={fr.cx('fr-mb-0')}>Statistiques</h2>
			</div>
			<div className={cx(classes.container)}>
				<GenericFilters filterKey="productStats">
					<Select
						label="Sélectionner une source"
						nativeSelectProps={{
							value: selectedButton ?? 'undefined',
							onChange: e => {
								const newValue =
									e.target.value === 'undefined'
										? undefined
										: parseInt(e.target.value);

								setSelectedButton(newValue);

								updateFilters({
									...filters,
									productStats: {
										...filters['productStats'],
										buttonId: newValue
									},
									sharedFilters: {
										...filters['sharedFilters'],
										hasChanged: true
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
		</div>
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
	observatoireStats: {
		marginTop: fr.spacing('16v'),
		paddingBottom: fr.spacing('20v'),
		borderBottom: `1px solid ${fr.colors.decisions.border.default.grey.default}`
	},
	container: {
		position: 'relative'
	},
	loaderContainer: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		height: '500px',
		width: '100%'
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
	title: {
		display: 'flex',
		justifyContent: 'space-between',
		marginBottom: fr.spacing('8v'),
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

export default StatsTab;
