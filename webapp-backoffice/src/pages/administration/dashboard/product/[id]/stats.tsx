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
import { ToggleSwitch } from '@codegouvfr/react-dsfr/ToggleSwitch';
import { Button } from '@codegouvfr/react-dsfr/Button';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import PublicDataModal from '@/src/components/dashboard/Stats/PublicDataModal';
import Head from 'next/head';

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
	const isTotalLoading = statsTotals.satisfaction === undefined;
	const [isPublic, setIsPublic] = useState<boolean>(product.isPublic || false);

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

	const debouncedStartDate = useDebounce<string>(startDate, 500);
	const debouncedEndDate = useDebounce<string>(endDate, 500);
	const nbReviews = reviewsData?.metadata.countAll;

	const updateProduct = trpc.product.update.useMutation({});

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
				<div></div>
				<div
					className={fr.cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-mt-8v')}
				>
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
