import BooleanQuestionViz from '@/src/components/dashboard/Stats/BooleanQuestionViz';
import DetailsQuestionViz from '@/src/components/dashboard/Stats/DetailsQuestionViz';
import SmileyQuestionViz from '@/src/components/dashboard/Stats/SmileyQuestionViz';
import { useStats } from '@/src/contexts/StatsContext';
import ProductLayout from '@/src/layouts/Product/ProductLayout';
import { fr } from '@codegouvfr/react-dsfr';
import Input from '@codegouvfr/react-dsfr/Input';
import { Product } from '@prisma/client';
import { useEffect, useState } from 'react';
import { tss } from 'tss-react/dsfr';
import { useDebounce } from 'usehooks-ts';
import { getServerSideProps } from '.';
import Alert from '@codegouvfr/react-dsfr/Alert';
import { trpc } from '@/src/utils/trpc';
import { Loader } from '@/src/components/ui/Loader';
import Link from 'next/link';
import ReviewAverageInterval from '@/src/components/dashboard/Stats/ReviewAverageInterval';
import ReviewAverage from '@/src/components/dashboard/Stats/ReviewInterval';

interface Props {
	product: Product;
}

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
			<h3 className={fr.cx('fr-mb-0')}>{title}</h3>
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

	const [startDate, setStartDate] = useState<string>(
		new Date(new Date().setFullYear(new Date().getFullYear() - 1))
			.toISOString()
			.split('T')[0]
	);
	const [endDate, setEndDate] = useState<string>(
		new Date().toISOString().split('T')[0]
	);

	const { data: buttonsResult, isLoading: isLoadingButtons } =
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

	const debouncedStartDate = useDebounce<string>(startDate, 500);
	const debouncedEndDate = useDebounce<string>(endDate, 500);
	const nbReviews = reviewsData?.metadata.count;

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
				<h1>Statistiques</h1>
				{buttonsResult.metadata.count === 0 ? (
					<Alert
						severity="info"
						title=""
						description={
							<>
								Afin de récolter les avis et produire les statistiques pour ce
								produit, vous devez{' '}
								<Link
									className={fr.cx('fr-link')}
									href={`/administration/dashboard/product/${product.id}/buttons`}
								>
									créer un bouton
								</Link>
								.
							</>
						}
					/>
				) : (
					<Alert
						severity="info"
						title="Cette démarche n'a pas encore d'avis"
						description="Une fois qu’un utilisateur a donné un avis, vous verrez une synthèse ici."
					/>
				)}
			</ProductLayout>
		);
	}

	return (
		<ProductLayout product={product}>
			<h1>Statistiques</h1>
			<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-mt-8v')}>
				<div className={fr.cx('fr-col-6')}>
					<Input
						label="Date de début"
						nativeInputProps={{
							type: 'date',
							value: startDate,
							onChange: e => {
								setStartDate(e.target.value);
							}
						}}
					/>
				</div>
				<div className={fr.cx('fr-col-6')}>
					<Input
						label="Date de fin"
						nativeInputProps={{
							type: 'date',
							value: endDate,
							onChange: e => {
								setEndDate(e.target.value);
							}
						}}
					/>
				</div>
			</div>
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
			<SectionWrapper
				title="Difficultés rencontrées"
				count={statsTotals.difficulties}
				noDataText="Aucune donnée pour les difficultés rencontrées"
			>
				<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
					<div
						className={
							statsTotals.difficulties_details
								? fr.cx('fr-col-6', 'fr-pr-6v')
								: fr.cx('fr-col-12')
						}
					>
						<BooleanQuestionViz
							fieldCode="difficulties"
							productId={product.id}
							startDate={debouncedStartDate}
							endDate={debouncedEndDate}
						/>
					</div>
					{statsTotals.difficulties_details !== 0 && (
						<div className={fr.cx('fr-col-6', 'fr-pr-6v')}>
							<DetailsQuestionViz
								fieldCodeMultiple="difficulties_details"
								productId={product.id}
								startDate={debouncedStartDate}
								endDate={debouncedEndDate}
							/>
						</div>
					)}
				</div>
			</SectionWrapper>
			<SectionWrapper
				title="Aide joignable et efficace"
				count={statsTotals.contact}
				noDataText="Aucune donnée pour l'aide joignable et efficace"
			>
				<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
					<div
						className={
							statsTotals.contact_reached
								? fr.cx('fr-col-6', 'fr-pr-6v')
								: fr.cx('fr-col-12')
						}
					>
						<DetailsQuestionViz
							fieldCodeMultiple="contact"
							productId={product.id}
							startDate={debouncedStartDate}
							endDate={debouncedEndDate}
						/>
					</div>
					{statsTotals.contact_reached !== 0 && (
						<div className={fr.cx('fr-col-6', 'fr-pr-6v')}>
							<BooleanQuestionViz
								fieldCode="contact_reached"
								productId={product.id}
								startDate={debouncedStartDate}
								endDate={debouncedEndDate}
							/>
						</div>
					)}
				</div>
				{statsTotals.contact_satisfaction !== 0 && (
					<SmileyQuestionViz
						fieldCode="contact_satisfaction"
						displayFieldLabel={true}
						productId={product.id}
						startDate={debouncedStartDate}
						endDate={debouncedEndDate}
					/>
				)}
				{statsTotals.contact_channels !== 0 && (
					<DetailsQuestionViz
						fieldCodeMultiple="contact_channels"
						productId={product.id}
						startDate={debouncedStartDate}
						endDate={debouncedEndDate}
					/>
				)}
			</SectionWrapper>
			<SectionWrapper
				title="Niveau d’autonomie"
				count={statsTotals.help}
				noDataText="Aucune donnée pour le niveau d'autonomie"
			>
				<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
					<div
						className={
							statsTotals.help_details
								? fr.cx('fr-col-6', 'fr-pr-6v')
								: fr.cx('fr-col-12')
						}
					>
						<BooleanQuestionViz
							fieldCode="help"
							productId={product.id}
							startDate={debouncedStartDate}
							endDate={debouncedEndDate}
						/>
					</div>
					{statsTotals.help_details !== 0 && (
						<div className={fr.cx('fr-col-6', 'fr-pr-6v')}>
							<DetailsQuestionViz
								fieldCodeMultiple="help_details"
								productId={product.id}
								startDate={debouncedStartDate}
								endDate={debouncedEndDate}
							/>
						</div>
					)}
				</div>
			</SectionWrapper>
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
	}
});

export default ProductStatPage;

export { getServerSideProps };
