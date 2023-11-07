import ProductLayout from '@/src/layouts/Product/ProductLayout';
import { getServerSideProps } from '.';
import { Product } from '@prisma/client';
import { fr } from '@codegouvfr/react-dsfr';
import Input from '@codegouvfr/react-dsfr/Input';
import React from 'react';
import Button from '@codegouvfr/react-dsfr/Button';
import { tss } from 'tss-react/dsfr';
import { trpc } from '@/src/utils/trpc';
import { getNbPages } from '@/src/utils/tools';
import { Loader } from '@/src/components/ui/Loader';
import Select from '@codegouvfr/react-dsfr/Select';

interface Props {
	product: Product;
}

const ProductReviewsPage = (props: Props) => {
	const { product } = props;
	const [startDate, setStartDate] = React.useState<string>(
		new Date(new Date().setFullYear(new Date().getFullYear()))
			.toISOString()
			.split('T')[0]
	);
	const currentDate = new Date();
	currentDate.setFullYear(currentDate.getFullYear() + 1);
	const [endDate, setEndDate] = React.useState<string>(
		currentDate.toISOString().split('T')[0]
	);
	const [search, setSearch] = React.useState<string>('');
	const [validatedSearch, setValidatedSearch] = React.useState<string>('');
	const [currentPage, setCurrentPage] = React.useState(1);
	const [numberPerPage, setNumberPerPage] = React.useState(10);

	const {
		data: reviewResults,
		isLoading: isLoadingReviews,
		error: errorReviews
	} = trpc.review.getList.useQuery(
		{
			product_id: product.id,
			numberPerPage: 10,
			page: 1,
			shouldIncludeAnswers: true,
			search: validatedSearch,
			startDate,
			endDate
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

	const {
		data: reviews,
		metadata: { count: reviewsCount }
	} = reviewResults;

	console.log('reviews', reviews);

	const { cx, classes } = useStyles();

	const nbPages = getNbPages(reviewsCount, numberPerPage);

	const handleViewFilter = () => {
		console.log('handleViewFilter');
	};

	if (isLoadingReviews) {
		return (
			<ProductLayout product={product}>
				<h1>Statistiques</h1>
				<div className={fr.cx('fr-mt-20v')}>
					<Loader />
				</div>
			</ProductLayout>
		);
	}

	return (
		<ProductLayout product={product}>
			<h1>Avis</h1>
			<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-mt-8v')}>
				<div className={fr.cx('fr-col-4')}>
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
				<div className={fr.cx('fr-col-4')}>
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
				<div className={fr.cx('fr-col-4', 'fr-col--bottom')}>
					<form
						className={cx(classes.searchForm)}
						onSubmit={e => {
							e.preventDefault();
							setValidatedSearch(search);
						}}
					>
						<div role="search" className={fr.cx('fr-search-bar')}>
							<Input
								label="Rechercher un produit"
								hideLabel
								nativeInputProps={{
									placeholder: 'Rechercher',
									type: 'search',
									value: search,
									onChange: event => {
										if (!event.target.value) {
											setValidatedSearch('');
										}
										setSearch(event.target.value);
									}
								}}
							/>
							<Button
								priority="primary"
								type="submit"
								iconId="ri-search-2-line"
								iconPosition="left"
							>
								Rechercher
							</Button>
						</div>
					</form>
				</div>
			</div>
			<div
				className={fr.cx(
					'fr-grid-row',
					'fr-grid-row--gutters',
					'fr-grid-row--left'
				)}
			>
				<div className={fr.cx('fr-col-3')}>
					<div className={cx(classes.filterView)}>
						<label>Vue</label>
						<div className={fr.cx('fr-mt-2v')}>
							<Button priority="primary" onClick={() => handleViewFilter}>
								Avis
							</Button>
							<Button priority="secondary">Verbatims</Button>
						</div>
					</div>
				</div>
				<div className={fr.cx('fr-col-5')}>
					<Select label="Sélectionner une source" nativeSelectProps={{}}>
						<option value="">Toutes les sources</option>
					</Select>
				</div>
				<div className={fr.cx('fr-col-4', 'fr-col--bottom')}>
					<Button
						priority="tertiary"
						iconPosition="right"
						iconId="ri-filter-2-line"
					>
						Plus de filtres
					</Button>
				</div>
			</div>
			<div
				className={fr.cx(
					'fr-grid-row',
					'fr-grid-row--gutters',
					'fr-grid-row--right'
				)}
			>
				{reviews.length > 0 && nbPages > 0 && (
					<div className={fr.cx('fr-col-12')}>
						<p>
							Avis de{' '}
							<span className={cx(classes.boldText)}>
								{numberPerPage * (currentPage - 1) + 1}
							</span>{' '}
							à{' '}
							<span className={cx(classes.boldText)}>
								{numberPerPage * (currentPage - 1) + reviews.length}
							</span>{' '}
							sur <span className={cx(classes.boldText)}>{reviewsCount}</span>
						</p>
					</div>
				)}
			</div>
			<div>
				{reviews.map(review => (
					<div></div>
				))}
			</div>
		</ProductLayout>
	);
};

export default ProductReviewsPage;

const useStyles = tss.withName(ProductReviewsPage.name).create(() => ({
	boldText: {
		fontWeight: 'bold'
	},
	searchForm: {
		'.fr-search-bar': {
			'.fr-input-group': {
				width: '100%',
				marginBottom: 0
			}
		}
	},
	filterView: {
		display: 'flex',
		flexDirection: 'column'
	}
}));

export { getServerSideProps };
