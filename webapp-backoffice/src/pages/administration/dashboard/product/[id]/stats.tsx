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

interface Props {
	product: Product;
}

const SectionWrapper = ({
	title,
	children
}: {
	title: string;
	children: React.ReactNode;
}) => {
	const { classes, cx } = useStyles();

	return (
		<div className={cx(classes.wrapperGlobal, fr.cx('fr-mt-5w'))}>
			<h3 className={fr.cx('fr-mb-0')}>{title}</h3>
			<>{children}</>
		</div>
	);
};

const ProductStatPage = (props: Props) => {
	const { product } = props;
	const { statsTotals } = useStats();

	const [nbReviews, setNbReviews] = useState<number | null>(null);

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

	const fetchNbReviews = async () => {
		const res = await fetch(
			`${process.env.NEXT_PUBLIC_FORM_APP_URL}/api/open-api/reviews/list?product_id=${product.id}&page=1&numberPerPage=0`
		);

		const data = (await res.json()) as { metadata: { count: number } };

		setNbReviews(data.metadata.count);
	};

	const debouncedStartDate = useDebounce<string>(startDate, 500);
	const debouncedEndDate = useDebounce<string>(endDate, 500);

	useEffect(() => {
		fetchNbReviews();
	}, []);

	if (nbReviews === null || isLoadingButtons) {
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
			<SectionWrapper title="Satisfaction usagers">
				<SmileyQuestionViz
					fieldCode="satisfaction"
					productId={product.id}
					startDate={debouncedStartDate}
					endDate={debouncedEndDate}
				/>
			</SectionWrapper>
			<SectionWrapper title="Facilité d'usage">
				<SmileyQuestionViz
					fieldCode="easy"
					productId={product.id}
					startDate={debouncedStartDate}
					endDate={debouncedEndDate}
				/>
			</SectionWrapper>
			<SectionWrapper title="Simplicité du langage">
				<SmileyQuestionViz
					fieldCode="comprehension"
					productId={product.id}
					startDate={debouncedStartDate}
					endDate={debouncedEndDate}
				/>
			</SectionWrapper>
			<SectionWrapper title="Difficultés rencontrées">
				<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
					<div className={fr.cx('fr-col-6', 'fr-pr-6v')}>
						<BooleanQuestionViz
							fieldCode="difficulties"
							productId={product.id}
							startDate={debouncedStartDate}
							endDate={debouncedEndDate}
						/>
					</div>
					<div className={fr.cx('fr-col-6', 'fr-pr-6v')}>
						<DetailsQuestionViz
							fieldCodeMultiple="difficulties_details"
							productId={product.id}
							startDate={debouncedStartDate}
							endDate={debouncedEndDate}
						/>
					</div>
				</div>
			</SectionWrapper>
			<SectionWrapper title="Aide joignable et efficace">
				<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
					<div className={fr.cx('fr-col-6', 'fr-pr-6v')}>
						<BooleanQuestionViz
							fieldCode="contact"
							productId={product.id}
							startDate={debouncedStartDate}
							endDate={debouncedEndDate}
						/>
					</div>
					<div className={fr.cx('fr-col-6', 'fr-pr-6v')}>
						<DetailsQuestionViz
							fieldCodeMultiple="contact_reached"
							productId={product.id}
							startDate={debouncedStartDate}
							endDate={debouncedEndDate}
						/>
					</div>
				</div>
				<SmileyQuestionViz
					fieldCode="contact_satisfaction"
					displayFieldLabel={true}
					productId={product.id}
					startDate={debouncedStartDate}
					endDate={debouncedEndDate}
				/>
				<DetailsQuestionViz
					fieldCodeMultiple="contact_channels"
					productId={product.id}
					startDate={debouncedStartDate}
					endDate={debouncedEndDate}
				/>
			</SectionWrapper>
			<SectionWrapper title="Niveau d’autonomie">
				<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
					<div className={fr.cx('fr-col-6', 'fr-pr-6v')}>
						<BooleanQuestionViz
							fieldCode="help"
							productId={product.id}
							startDate={debouncedStartDate}
							endDate={debouncedEndDate}
						/>
					</div>
					<div className={fr.cx('fr-col-6', 'fr-pr-6v')}>
						<DetailsQuestionViz
							fieldCodeMultiple="help_details"
							productId={product.id}
							startDate={debouncedStartDate}
							endDate={debouncedEndDate}
						/>
					</div>
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
