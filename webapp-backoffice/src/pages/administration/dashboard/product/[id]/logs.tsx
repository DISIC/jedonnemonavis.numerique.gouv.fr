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
import { JsonValue } from '@prisma/client/runtime/library';
import { Pagination } from '@/src/components/ui/Pagination';
import { fr } from '@codegouvfr/react-dsfr';
import { Select } from '@codegouvfr/react-dsfr/Select';
import { Autocomplete } from '@mui/material';
import { useFilters } from '@/src/contexts/FiltersContext';

interface Props {
	product: Product;
}

interface Event {
	id: number;
	user_id: number;
	action: TypeAction;
	metadata: JsonValue;
	product_id: number | null;
	entity_id: number | null;
	apiKey_id: number | null;
	created_at: Date;
}

const UserLogsPage = ({ product }: Props) => {
	const { classes } = useStyles();

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

	const headers = ['Date', 'Action'];

	const tableData =
		fullEvents?.data.map((event: Event) => [
			event.created_at.toLocaleString(),
			handleActionTypeDisplay(event.action, event.metadata, product.title)
		]) || [];

	return (
		<ProductLayout product={product}>
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
					<div className={fr.cx('fr-col-12', 'fr-col-md-6')}>
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
							noOptionsText="Aucune action trouvée"
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
					<div className={fr.cx('fr-grid-row--center', 'fr-grid-row')}>
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
	}
});

export { getServerSideProps };

export default UserLogsPage;
