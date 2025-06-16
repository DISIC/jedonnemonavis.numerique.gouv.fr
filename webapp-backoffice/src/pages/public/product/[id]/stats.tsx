import AnswersChart from '@/src/components/dashboard/Stats/AnswersChart';
import BarMultipleQuestionViz from '@/src/components/dashboard/Stats/BarMultipleQuestionViz';
import BarMultipleSplitQuestionViz from '@/src/components/dashboard/Stats/BarMultipleSplitQuestionViz';
import BarQuestionViz from '@/src/components/dashboard/Stats/BarQuestionViz';
import KPITile from '@/src/components/dashboard/Stats/KPITile';
import ObservatoireStats from '@/src/components/dashboard/Stats/ObservatoireStats';
import SmileyQuestionViz from '@/src/components/dashboard/Stats/SmileyQuestionViz';
import { Loader } from '@/src/components/ui/Loader';
import {
	betaTestXwikiIds,
	formatNumberWithSpaces,
	transformDateToFrenchReadable
} from '@/src/utils/tools';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import Input from '@codegouvfr/react-dsfr/Input';
import { Product } from '@prisma/client';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { tss } from 'tss-react/dsfr';
import { useDebounce } from 'usehooks-ts';
import { getServerSideProps } from '.';
import { push } from '@socialgouv/matomo-next';
import { SectionWrapper } from '@/src/components/dashboard/Form/tabs/stats';
import { Select } from '@codegouvfr/react-dsfr/Select';
import { ProductWithForms } from '@/src/types/prismaTypesExtended';

interface Props {
	product: ProductWithForms | null;
	defaultStartDate: string;
	defaultEndDate: string;
}

const nbMaxReviews = 500000;

const ProductStatPage = (props: Props) => {
	const { classes, cx } = useStyles();
	const { product, defaultStartDate, defaultEndDate } = props;

	const [tmpStartDate, setTmpStartDate] = useState<string>(defaultStartDate);
	const [tmpEndDate, setTmpEndDate] = useState<string>(defaultEndDate);
	const [tmpFormId, setTmpFormId] = useState<number>(0);

	const [startDate, setStartDate] = useState<string>(defaultStartDate);
	const [endDate, setEndDate] = useState<string>(defaultEndDate);
	const [formId, setFormId] = useState<number>(0);

	const debouncedStartDate = useDebounce<string>(startDate, 200);
	const debouncedEndDate = useDebounce<string>(endDate, 200);

	const [buttonId, setButtonId] = useState<number | undefined>(undefined);

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
	const nbVerbatims = dataNbVerbatims?.data || 0;
	const percetengeVerbatimsOfReviews = !!nbReviewsWithFilters
		? ((nbVerbatims / nbReviewsWithFilters) * 100).toFixed(0) || 0
		: 0;

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

		if (nbReviewsWithFilters === 0) {
			return (
				<div className={fr.cx('fr-mt-10v')} role="status">
					<Alert
						severity="info"
						title="Aucun avis sur cette période"
						description={`Nous n'avons pas trouvé d'avis entre le ${transformDateToFrenchReadable(debouncedStartDate)} et le ${transformDateToFrenchReadable(endDate)}, tentez de changer la période de date.`}
					/>
				</div>
			);
		}

		return (
			<>
				<ObservatoireStats
					productId={product.id}
					formId={formId}
					buttonId={buttonId}
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
								hideLink
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
								hideLink
							/>
						</div>
					</div>
				</div>
				<AnswersChart
					fieldCode="satisfaction"
					productId={product.id}
					formId={formId}
					buttonId={buttonId}
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
						buttonId={buttonId}
						startDate={debouncedStartDate}
						endDate={debouncedEndDate}
						required
					/>
					<BarQuestionViz
						fieldCode="comprehension"
						total={nbReviewsWithFilters}
						productId={product.id}
						formId={formId}
						buttonId={buttonId}
						startDate={debouncedStartDate}
						endDate={debouncedEndDate}
					/>
					<BarMultipleQuestionViz
						fieldCode="contact_tried"
						total={nbReviewsWithFilters}
						productId={product.id}
						formId={formId}
						buttonId={buttonId}
						startDate={debouncedStartDate}
						endDate={debouncedEndDate}
					/>
					<BarMultipleSplitQuestionViz
						fieldCode="contact_reached"
						total={nbReviewsWithFilters}
						productId={product.id}
						formId={formId}
						buttonId={buttonId}
						startDate={debouncedStartDate}
						endDate={debouncedEndDate}
					/>
					<BarMultipleSplitQuestionViz
						fieldCode="contact_satisfaction"
						total={nbReviewsWithFilters}
						productId={product.id}
						formId={formId}
						buttonId={buttonId}
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
						formId={formId}
						buttonId={buttonId}
						startDate={debouncedStartDate}
						endDate={debouncedEndDate}
						required
					/>
					<BarMultipleQuestionViz
						fieldCode="difficulties"
						total={nbReviewsWithFilters}
						productId={product.id}
						formId={formId}
						buttonId={buttonId}
						startDate={debouncedStartDate}
						endDate={debouncedEndDate}
					/>
				</SectionWrapper>
			</>
		);
	};

	const submit = () => {
		if (
			tmpStartDate !== startDate ||
			tmpEndDate !== endDate ||
			tmpFormId !== formId
		) {
			console.log(tmpFormId, formId);
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
	}
});

export default ProductStatPage;

export { getServerSideProps };
