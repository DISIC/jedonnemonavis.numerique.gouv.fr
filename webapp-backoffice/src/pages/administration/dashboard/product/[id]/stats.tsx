import BooleanSection from '@/src/components/dashboard/Stats/BooleanSection';
import SmileySection from '@/src/components/dashboard/Stats/SmileySection';
import ProductLayout from '@/src/layouts/Product/ProductLayout';
import { fr } from '@codegouvfr/react-dsfr';
import Input from '@codegouvfr/react-dsfr/Input';
import { Product } from '@prisma/client';
import { useEffect, useState } from 'react';
import { tss } from 'tss-react/dsfr';
import { getServerSideProps } from '.';
import { useDebounce } from 'usehooks-ts';

interface Props {
	product: Product;
}

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

	const { classes, cx } = useStyles();

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
			<div className={cx(classes.wrapperGlobal, fr.cx('fr-mt-6w'))}>
				<h3>Satisfaction usagers ⓘ</h3>
				<SmileySection
					fieldCode="satisfaction"
					productId={product.id}
					startDate={debouncedStartDate}
					endDate={debouncedEndDate}
				/>
			</div>
			<div className={cx(classes.wrapperGlobal, fr.cx('fr-mt-5w'))}>
				<h3>Facilité d'usage ⓘ</h3>
				<SmileySection
					fieldCode="easy"
					productId={product.id}
					startDate={debouncedStartDate}
					endDate={debouncedEndDate}
				/>
			</div>
			<div className={cx(classes.wrapperGlobal, fr.cx('fr-mt-5w'))}>
				<h3>Simplicité du langage ⓘ</h3>
				<SmileySection
					fieldCode="comprehension"
					productId={product.id}
					startDate={debouncedStartDate}
					endDate={debouncedEndDate}
				/>
			</div>
			<div className={cx(classes.wrapperGlobal, fr.cx('fr-mt-5w'))}>
				<h3>Difficultés rencontrées ⓘ</h3>
				<BooleanSection
					fieldCode="difficulties"
					productId={product.id}
					startDate={debouncedStartDate}
					endDate={debouncedEndDate}
				/>
			</div>
		</ProductLayout>
	);
};

const useStyles = tss.create({
	wrapperGlobal: {
		display: 'flex',
		flexDirection: 'column',
		gap: '1.5rem',
		padding: '2rem',
		border: '1px solid #E5E5E5'
	}
});

export default ProductStatPage;

export { getServerSideProps };
