import {
	CommonStepProps,
	HideBlockOptionsHelper,
	OldSectionWrapper,
	SectionWrapper
} from '@/src/components/dashboard/Form/tabs/stats';
import AnswersChart from '@/src/components/dashboard/Stats/AnswersChart';
import BarMultipleQuestionViz from '@/src/components/dashboard/Stats/BarMultipleQuestionViz';
import BarMultipleSplitQuestionViz from '@/src/components/dashboard/Stats/BarMultipleSplitQuestionViz';
import BarQuestionViz from '@/src/components/dashboard/Stats/BarQuestionViz';
import KPITile from '@/src/components/dashboard/Stats/KPITile';
import ObservatoireStats from '@/src/components/dashboard/Stats/ObservatoireStats';
import SmileyQuestionViz from '@/src/components/dashboard/Stats/SmileyQuestionViz';
import { Loader } from '@/src/components/ui/Loader';
import { useRootFormTemplateContext } from '@/src/contexts/RootFormTemplateContext';
import { ProductWithForms } from '@/src/types/prismaTypesExtended';
import {
	formatNumberWithSpaces,
	transformDateToFrenchReadable
} from '@/src/utils/tools';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Accordion from '@codegouvfr/react-dsfr/Accordion';
import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import Input from '@codegouvfr/react-dsfr/Input';
import { Select } from '@codegouvfr/react-dsfr/Select';
import { push } from '@socialgouv/matomo-next';
import Head from 'next/head';
import { Fragment, useEffect, useState } from 'react';
import { tss } from 'tss-react/dsfr';
import { useDebounce } from 'usehooks-ts';
import { getServerSideProps } from '.';

interface Props {
	product: ProductWithForms | null;
	defaultStartDate: string;
	defaultEndDate: string;
}

const nbMaxReviews = 500000;

const ProductStatPage = (props: Props) => {
	const { formTemplate } = useRootFormTemplateContext();
	const { classes, cx } = useStyles();
	const { product, defaultStartDate, defaultEndDate } = props;

	const [tmpStartDate, setTmpStartDate] = useState<string>(defaultStartDate);
	const [tmpEndDate, setTmpEndDate] = useState<string>(defaultEndDate);
	const [tmpFormId, setTmpFormId] = useState<number>(0);

	const [startDate, setStartDate] = useState<string>(defaultStartDate);
	const [endDate, setEndDate] = useState<string>(defaultEndDate);
	const [formId, setFormId] = useState<number>(0);
	const [oldSectionExpanded, setOldSectionExpanded] = useState(false);

	const debouncedStartDate = useDebounce<string>(startDate, 200);
	const debouncedEndDate = useDebounce<string>(endDate, 200);

	const form = product?.forms.find(form => form.id === formId);
	const formConfigs = form?.form_configs;
	const currentFormConfig =
		formConfigs && formConfigs.length > 0 ? formConfigs[0] : undefined;
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

	if (product === null) {
		return (
			<div className={fr.cx('fr-container')}>
				<h1 className={fr.cx('fr-mt-20v')}>Statistiques</h1>
				<div role="status">
					<Alert
						severity="info"
						title="Cette démarche n'existe pas ou n'est pas publique"
						description="Veuillez vérifier l'identifiant de la démarche ou contacter le porteur."
						className={fr.cx('fr-mt-20v', 'fr-mb-20v')}
					/>
				</div>
			</div>
		);
	}

	const { data: reviewsData, isLoading: isLoadingReviewsCount } =
		trpc.review.countReviews.useQuery(
			{
				numberPerPage: 0,
				page: 1,
				product_id: product.id,
				form_id: formId
			},
			{
				enabled: formId !== 0
			}
		);

	const {
		data: reviewsDataWithFilters,
		isLoading: isLoadingReviewsDataWithFilters
	} = trpc.review.countReviews.useQuery(
		{
			numberPerPage: 0,
			page: 1,
			product_id: product.id,
			form_id: formId,
			start_date: debouncedStartDate,
			end_date: debouncedEndDate
		},
		{
			enabled: formId !== 0
		}
	);

	const { data: dataNbVerbatims, isLoading: isLoadingNbVerbatims } =
		trpc.answer.countByFieldCode.useQuery(
			{
				product_id: product.id,
				form_id: formId,
				field_code: 'verbatim',
				start_date: debouncedStartDate,
				end_date: debouncedEndDate
			},
			{
				enabled: formId !== 0
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
		if (
			nbReviewsWithFilters === undefined ||
			isLoadingReviewsDataWithFilters ||
			isLoadingReviewsCount
		) {
			return (
				<div className={fr.cx('fr-my-16w')}>
					<Loader />
				</div>
			);
		}

		return (
			<>
				<div className={cx(classes.observatoireStats)}>
					<ObservatoireStats
						productId={product.id}
						formId={formId}
						formConfig={currentFormConfig}
						startDate={debouncedStartDate}
						endDate={debouncedEndDate}
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
								linkHref={`/administration/dashboard/product/${product.id}/forms/${formId}?tab=reviews`}
								hideLink
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
								linkHref={`/administration/dashboard/product/${product.id}/forms/${formId}?tab=reviews`}
								hideLink
							/>
						</div>
					</div>
				</div>
				<AnswersChart
					fieldCode="satisfaction"
					productId={product.id}
					formId={formId}
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
						formId={formId}
						startDate={debouncedStartDate}
						endDate={debouncedEndDate}
						required
					/>
					{renderVisibleSteps(hiddenSteps, {
						productId: product.id,
						formId: formId,
						startDate: debouncedStartDate,
						endDate: debouncedEndDate
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
										productId={product.id}
										formId={formId}
										startDate={debouncedStartDate}
										endDate={debouncedEndDate}
										formConfig={currentFormConfig}
										showHiddenSteps
										noTitle
									/>
								</div>
							)}
							{renderHiddenSteps(hiddenSteps, {
								productId: product.id,
								formId: formId,
								startDate: debouncedStartDate,
								endDate: debouncedEndDate
							})}
							<SmileyQuestionViz
								fieldCode="easy"
								total={nbReviewsWithFiltersForm1}
								productId={product.id}
								formId={formId}
								startDate={debouncedStartDate}
								endDate={debouncedEndDate}
							/>
							<BarMultipleQuestionViz
								fieldCode="difficulties"
								total={nbReviewsWithFiltersForm1}
								productId={product.id}
								formId={formId}
								startDate={debouncedStartDate}
								endDate={debouncedEndDate}
							/>
						</OldSectionWrapper>
					</Accordion>
				)}
			</>
		);
	};

	const submit = () => {
		if (
			tmpStartDate !== startDate ||
			tmpEndDate !== endDate ||
			tmpFormId !== formId
		) {
			setStartDate(tmpStartDate);
			setEndDate(tmpEndDate);
			setFormId(tmpFormId);
		}
	};

	useEffect(() => {
		if (product.forms.length > 0 && formId === 0) {
			setFormId(product.forms[0].id);
			setTmpFormId(product.forms[0].id);
		}
	}, [product]);

	return (
		<div className={fr.cx('fr-container', 'fr-mb-10w')}>
			<Head>
				<title>{product.title} | Statistiques | Je donne mon avis</title>
				<meta
					name="description"
					content={`${product.title} | Statistiques | Je donne mon avis`}
				/>
			</Head>
			<div className={fr.cx('fr-mt-5w')}>
				<h1>{product.title}</h1>
			</div>
			<p className={fr.cx('fr-mt-5v')}>
				Données recueillies en ligne pour le formulaire, entre le{' '}
				{transformDateToFrenchReadable(debouncedStartDate)} et le{' '}
				{transformDateToFrenchReadable(debouncedEndDate)}
				{!!nbReviews
					? `, auprès de ${formatNumberWithSpaces(nbReviewsWithFilters)} internautes.`
					: '.'}
			</p>
			<form
				className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}
				onSubmit={e => {
					e.preventDefault();
					submit();
					push(['trackEvent', 'Product - Stats', 'Apply-Search']);
				}}
			>
				<div className={fr.cx('fr-col-4')}>
					<Select
						label="Formulaire"
						nativeSelectProps={{
							value: tmpFormId ?? 'undefined',
							onChange: e => {
								const newValue =
									e.target.value === 'undefined'
										? undefined
										: parseInt(e.target.value);
								if (newValue) setTmpFormId(newValue);
							}
						}}
					>
						{product.forms.map(form => (
							<option key={form.id} value={form.id}>
								{form.title || form.form_template.title}
							</option>
						))}
					</Select>
				</div>
				<div className={fr.cx('fr-col-3')}>
					<Input
						label="Date de début"
						nativeInputProps={{
							type: 'date',
							value: tmpStartDate,
							onChange: e => {
								setTmpStartDate(e.target.value);
							}
						}}
					/>
				</div>
				<div className={fr.cx('fr-col-3')}>
					<Input
						label="Date de fin"
						nativeInputProps={{
							type: 'date',
							value: tmpEndDate,
							onChange: e => {
								setTmpEndDate(e.target.value);
							}
						}}
					/>
				</div>
				<div className={fr.cx('fr-col-2')}>
					<div className={cx(classes.applyContainer)}>
						<Button
							type="submit"
							iconId="ri-search-2-line"
							title="Appliquer le changement de dates"
						>
							Appliquer
						</Button>
					</div>
				</div>
			</form>
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
	);
};

const useStyles = tss.create({
	applyContainer: {
		paddingTop: fr.spacing('8v')
	},
	observatoireStats: {
		marginTop: fr.spacing('16v'),
		paddingBottom: fr.spacing('20v'),
		borderBottom: `1px solid ${fr.colors.decisions.border.default.grey.default}`
	},
	oldSectionWrapper: {
		'.fr-collapse': {
			backgroundColor: fr.colors.decisions.background.default.grey.hover,
			margin: `0 1px`
		}
	}
});

export default ProductStatPage;

export { getServerSideProps };
