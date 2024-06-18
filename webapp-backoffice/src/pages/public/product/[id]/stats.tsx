import { Loader } from '@/src/components/ui/Loader';
import { useStats } from '@/src/contexts/StatsContext';
import { transformDateToFrenchReadable } from '@/src/utils/tools';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Alert from '@codegouvfr/react-dsfr/Alert';
import Input from '@codegouvfr/react-dsfr/Input';
import { Product } from '@prisma/client';
import Head from 'next/head';
import { useState } from 'react';
import { tss } from 'tss-react/dsfr';
import { useDebounce } from 'usehooks-ts';
import { getServerSideProps } from '.';

interface Props {
	product: Product | null;
	defaultStartDate: string;
	defaultEndDate: string;
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
		<div className={cx(classes.wrapperGlobal, fr.cx('fr-mt-2w'))}>
			<h2 className={fr.cx('fr-mb-0')}>{title}</h2>
			{count === 0 && (
				<Alert title="" description={noDataText} severity="info" />
			)}
			{children}
		</div>
	);
};

const ProductStatPage = (props: Props) => {
	const { product, defaultStartDate, defaultEndDate } = props;
	const { statsTotals } = useStats();

	const [startDate, setStartDate] = useState<string>(defaultStartDate);
	const [endDate, setEndDate] = useState<string>(defaultEndDate);

	if (product === null) {
		return (
			<div className={fr.cx('fr-container')}>
				<h1 className={fr.cx('fr-mt-20v')}>Statistiques</h1>
				<Alert
					severity="info"
					title="Cette démarche n'existe pas ou n'est pas publique"
					description="Veuillez vérifier l'identifiant de la démarche ou contacter le porteur."
					className={fr.cx('fr-mt-20v', 'fr-mb-20v')}
				/>
			</div>
		);
	}

	const debouncedStartDate = useDebounce<string>(startDate, 500);
	const debouncedEndDate = useDebounce<string>(endDate, 500);

	const { data: reviewsData, isLoading: isLoadingReviewsCount } =
		trpc.review.getList.useQuery({
			numberPerPage: 0,
			page: 1,
			product_id: product.id,
			start_date: debouncedStartDate,
			end_date: debouncedEndDate
		});

	const nbReviews = reviewsData?.metadata.countAll;

	const getStatsDisplay = () => {
		if (nbReviews === undefined) {
			return (
				<div className={fr.cx('fr-my-16w')}>
					<Loader />
				</div>
			);
		}

		if (nbReviews === 0) {
			return (
				<div className={fr.cx('fr-mt-10v')}>
					<Alert
						severity="info"
						title="Aucun avis sur cette période"
						description={`Nous n'avons pas trouvé d'avis entre le ${transformDateToFrenchReadable(debouncedStartDate)} et le ${transformDateToFrenchReadable(debouncedEndDate)}, tentez de changer la période de date.`}
					/>
				</div>
			);
		}

		return <></>;
	};

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
				Données recueillies en ligne, entre le{' '}
				{transformDateToFrenchReadable(debouncedStartDate)} et le{' '}
				{transformDateToFrenchReadable(debouncedEndDate)}
				{!!nbReviews
					? `, auprès de ${statsTotals.satisfaction} internautes.`
					: '.'}
			</p>
			<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
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
			{getStatsDisplay()}
		</div>
	);
};

const useStyles = tss.create({
	title: {
		...fr.spacing('margin', { bottom: '6w' })
	},
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
