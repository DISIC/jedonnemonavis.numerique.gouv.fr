import React, { useState } from 'react';
import ProductLayout from '../../../../../layouts/Product/ProductLayout';
import { Product, TypeAction } from '@prisma/client';
import Head from 'next/head';
import { getServerSideProps } from '.';
import { tss } from 'tss-react/dsfr';
import { trpc } from '@/src/utils/trpc';
import { Table } from '@codegouvfr/react-dsfr/Table';
import {
	filtersLabel,
	getNbPages,
	handleActionTypeDisplay
} from '@/src/utils/tools';
import { Pagination } from '@/src/components/ui/Pagination';
import { fr } from '@codegouvfr/react-dsfr';
import { Autocomplete } from '@mui/material';
import { useFilters } from '@/src/contexts/FiltersContext';

interface Props {
	product: Product;
	ownRight: 'admin' | 'viewer';
}

const UserLogsPage = ({ product, ownRight }: Props) => {
	const { classes, cx } = useStyles();

	const { filters, updateFilters } = useFilters();

	const [inputValue, setInputValue] = useState('');
	const [currentPage, setCurrentPage] = useState(1);

	const { data: fullEvents, isLoading } = trpc.userEvent.getList.useQuery(
		{
			product_id: product.id,
			limit: 10,
			page: currentPage,
			filterAction: filters.filterAction
		},
		{
			initialData: {
				data: [],
				pagination: {
					total: 0
				}
			}
		}
	);

	const eventsCount = fullEvents?.pagination.total;

	const nbPages = getNbPages(eventsCount || 0, 10);

	const headers = ['Date', 'Utilisateur', 'Action'];

	const tableData =
		fullEvents?.data.map(event => [
			event.created_at.toLocaleString(),
			event.user.firstName + ' ' + event.user.lastName,
			handleActionTypeDisplay(event.action, event.metadata, product.title)
		]) || [];

	return (
		<ProductLayout product={product} ownRight={ownRight}>
			<Head>
				<title>{product.title} | Journal d'activité | Je donne mon avis</title>
				<meta
					name="description"
					content={`${product.title} | Journal d'activité | Je donne mon avis`}
				/>
			</Head>
			<div className={classes.container}>
				<h1>Journal d'activité</h1>
				<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
					<div className={fr.cx('fr-col-12', 'fr-col-md-6', 'fr-mb-6v')}>
						<Autocomplete
							id="filter-action"
							disablePortal
							sx={{ width: '100%' }}
							options={filtersLabel}
							onChange={(_, option) => {
								if (option)
									updateFilters({
										...filters,
										filterAction: option.value as TypeAction
									});
							}}
							inputValue={inputValue}
							onInputChange={(event, newInputValue) => {
								setInputValue(newInputValue);
								updateFilters({
									...filters,
									filterAction: undefined
								});
							}}
							renderInput={params => (
								<div ref={params.InputProps.ref}>
									<label htmlFor="filter-action" className="fr-label">
										Filtrer par action
									</label>
									<input
										{...params.inputProps}
										className={params.inputProps.className + ' fr-input'}
										placeholder="Sélectionner une option"
										type="search"
									/>
								</div>
							)}
						/>
					</div>
				</div>
				{isLoading || fullEvents?.data.length === 0 ? (
					<div
						className={cx(
							fr.cx('fr-grid-row--center', 'fr-grid-row'),
							classes.emptyState
						)}
					>
						<p>Aucun événement trouvé</p>
					</div>
				) : (
					<>
						<Table data={tableData} headers={headers} fixed />
						{nbPages > 1 && (
							<div className={fr.cx('fr-grid-row--center', 'fr-grid-row')}>
								<Pagination
									showFirstLast
									count={nbPages}
									defaultPage={currentPage}
									slicesSize={10}
									getPageLinkProps={pageNumber => ({
										onClick: event => {
											event.preventDefault();
											setCurrentPage(pageNumber);
										},
										href: '#',
										classes: { link: fr.cx('fr-pagination__link') },
										key: `pagination-link-logs-${pageNumber}`
									})}
								/>
							</div>
						)}
					</>
				)}
			</div>
		</ProductLayout>
	);
};

const useStyles = tss.withName(UserLogsPage.name).create({
	container: {
		display: 'flex',
		flexDirection: 'column',
		gap: '0.5rem'
	},
	emptyState: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		height: '100%',
		padding: '1rem',
		fontSize: '1.2rem',
		fontWeight: 'bold'
	}
});

export { getServerSideProps };

export default UserLogsPage;
