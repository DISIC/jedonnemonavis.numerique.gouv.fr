import BooleanQuestionViz from '@/src/components/dashboard/Stats/BooleanQuestionViz';
import DetailsQuestionViz from '@/src/components/dashboard/Stats/DetailsQuestionViz';
import SmileyQuestionViz from '@/src/components/dashboard/Stats/SmileyQuestionViz';
import ProductLayout from '@/src/layouts/Product/ProductLayout';
import { fr } from '@codegouvfr/react-dsfr';
import Input from '@codegouvfr/react-dsfr/Input';
import { Product } from '@prisma/client';
import { useState } from 'react';
import { tss } from 'tss-react/dsfr';
import { getServerSideProps } from '.';
import { useDebounce } from 'usehooks-ts';
import dynamic from 'next/dynamic';
import ReviewAverageInterval from '@/src/components/dashboard/Stats/ReviewAverageInterval';

const BarChart = dynamic(() => import('@/src/components/chart/BarChart'), {
	ssr: false
});

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
					noDataText="Aucune donnée disponible pour la satisfaction usagers"
				/>
				<ReviewAverageInterval
					fieldCode="satisfaction"
					productId={product.id}
					startDate={startDate}
					endDate={endDate}
				/>
			</SectionWrapper>
			<SectionWrapper title="Facilité d'usage">
				<SmileyQuestionViz
					fieldCode="easy"
					productId={product.id}
					startDate={debouncedStartDate}
					endDate={debouncedEndDate}
					noDataText="Aucune donnée disponible pour la facilité d'usage"
				/>
			</SectionWrapper>
			<SectionWrapper title="Simplicité du langage">
				<SmileyQuestionViz
					fieldCode="comprehension"
					productId={product.id}
					startDate={debouncedStartDate}
					endDate={debouncedEndDate}
					noDataText="Aucune donnée disponible pour la simplicité du langage"
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
