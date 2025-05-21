import React, { useState } from 'react';
import ProductLayout from '../../../../../layouts/Product/ProductLayout';
import { Product, RightAccessStatus, TypeAction } from '@prisma/client';
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
import { PageItemsCounter, Pagination } from '@/src/components/ui/Pagination';
import { fr } from '@codegouvfr/react-dsfr';
import { useSession } from 'next-auth/react';
import { useFilters } from '@/src/contexts/FiltersContext';
import GenericFilters from '@/src/components/dashboard/Filters/Filters';
import { Autocomplete } from '@mui/material';
import Tag from '@codegouvfr/react-dsfr/Tag';

interface Props {
	product: Product;
	ownRight: Exclude<RightAccessStatus, 'removed'>;
}

const UserLogsPage = ({ product, ownRight }: Props) => {
	const { classes, cx } = useStyles();
	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const { data: session } = useSession();
	const [inputValue, setInputValue] = useState<string | undefined>();

	const { filters, updateFilters } = useFilters();

	const { data: fullEvents, isLoading } = trpc.userEvent.getList.useQuery(
		{
			product_id: product.id,
			limit: 10,
			page: currentPage,
			filterAction: filters.productActivityLogs.actionType,
			startDate: filters.sharedFilters.currentStartDate,
			endDate: filters.sharedFilters.currentEndDate
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

	const headers = ['Date', 'Horaire', 'Utilisateur', 'Activité'];

	const tableData =
		fullEvents?.data.map(event => [
			new Intl.DateTimeFormat('fr-FR', {
				day: '2-digit',
				month: '2-digit',
				year: 'numeric'
			}).format(event.created_at),
			event.created_at.toLocaleTimeString('fr-FR', {
				hour: '2-digit',
				minute: '2-digit'
			}),
			event.user ? event.user.email : 'Utilisateur inconnu',
			<p
				dangerouslySetInnerHTML={{
					__html:
						handleActionTypeDisplay(
							event.action,
							event.metadata,
							product.title
						) || ''
				}}
			/>
		]) || [];

	const renderTags = () => {
		return (
			<ul
				className={cx(
					fr.cx('fr-col-12', 'fr-col-md-12', 'fr-my-1w'),
					classes.tagContainer
				)}
			>
				{filters.productActivityLogs.actionType.map((action, index) => (
					<li key={index}>
						<Tag
							dismissible
							className={cx(classes.tagFilter)}
							title={`Retirer ${filtersLabel.find(f => f.value === action)?.label}`}
							nativeButtonProps={{
								onClick: () => {
									updateFilters({
										...filters,
										productActivityLogs: {
											...filters.productActivityLogs,
											actionType: filters.productActivityLogs.actionType.filter(
												e => e !== action
											)
										}
									});
								}
							}}
						>
							<p>{filtersLabel.find(f => f.value === action)?.label}</p>
						</Tag>
					</li>
				))}
			</ul>
		);
	};

	return (
		<ProductLayout product={product} ownRight={ownRight}>
			<Head>
				<title>
					{product.title} | Historique d'activité | Je donne mon avis
				</title>
				<meta
					name="description"
					content={`${product.title} | Historique d'activité | Je donne mon avis`}
				/>
			</Head>
			<div className={classes.container}>
				<h2 className={fr.cx('fr-mb-10v')}>Historique d'activité</h2>
				<GenericFilters filterKey="productActivityLogs" renderTags={renderTags}>
					<Autocomplete
						id="filter-action"
						disablePortal
						sx={{ width: '100%' }}
						options={filtersLabel}
						onChange={(_, option) => {
							if (option) {
								updateFilters({
									...filters,
									['productActivityLogs']: {
										...filters['productActivityLogs'],
										actionType: [
											...filters['productActivityLogs'].actionType,
											option.value as TypeAction
										]
									},
									sharedFilters: {
										...filters['sharedFilters'],
										hasChanged: true
									}
								});
							}
						}}
						inputValue={inputValue}
						value={filtersLabel.find(f => f.value === inputValue) || null}
						onInputChange={(_, newInputValue) => {
							setInputValue(newInputValue);
						}}
						renderInput={params => (
							<div ref={params.InputProps.ref}>
								<label htmlFor="filter-action" className="fr-label">
									Filtrer par action
								</label>
								<input
									{...params.inputProps}
									className={params.inputProps.className + ' fr-input'}
									placeholder="Toutes les actions"
									type="search"
								/>
							</div>
						)}
					/>
				</GenericFilters>
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
						<div className={fr.cx('fr-col-8', 'fr-pt-2w')}>
							<PageItemsCounter
								label="Activités"
								startItemCount={10 * (currentPage - 1) + 1}
								endItemCount={10 * (currentPage - 1) + fullEvents.data.length}
								totalItemsCount={fullEvents.pagination.total}
							/>
						</div>
						<Table
							data={tableData}
							headers={headers}
							bordered
							className={classes.table}
						/>
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
				<p>
					Cet historique existe depuis Novembre 2024. Les activités antérieures
					à cette date ne seront pas affichées.
				</p>
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
	},
	filterContainer: {
		display: 'flex',
		flexDirection: 'column',
		gap: '0.5rem',
		border: '1px solid #e0e0e0',
		padding: '1rem'
	},
	boldText: {
		fontWeight: 'bold'
	},
	table: {
		width: '100%',
		'& .fr-table table': {
			border: '1px solid #929292 !important',
			width: '100%'
		},
		'& table tbody tr': {
			width: '100%',
			backgroundColor: '#ffffff !important',
			td: {
				width: '100%',
				'&:nth-of-type(1)': {
					width: '5%'
				},
				'&:nth-of-type(2)': {
					width: '5%'
				},
				'&:nth-of-type(3)': {
					width: '15%'
				},
				'&:nth-of-type(4)': {
					width: '75%'
				}
			}
		}
	},
	tagFilter: {
		marginRight: '0.5rem',
		marginBottom: '0.5rem'
	},
	tagContainer: {
		display: 'flex',
		flexWrap: 'wrap',
		width: '100%',
		gap: '0.5rem',
		padding: 0,
		margin: 0,
		listStyle: 'none',
		justifyContent: 'flex-start'
	}
});

export { getServerSideProps };

export default UserLogsPage;
