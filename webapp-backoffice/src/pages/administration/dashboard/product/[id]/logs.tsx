import React, { useState } from 'react';
import ProductLayout from '../../../../../layouts/Product/ProductLayout';
import { Product, RightAccessStatus, TypeAction } from '@prisma/client';
import Head from 'next/head';
import { getServerSideProps } from '.';
import { tss } from 'tss-react/dsfr';
import { trpc } from '@/src/utils/trpc';
import { Table } from '@codegouvfr/react-dsfr/Table';
import { getNbPages, handleActionTypeDisplay } from '@/src/utils/tools';
import { Pagination } from '@/src/components/ui/Pagination';
import { fr } from '@codegouvfr/react-dsfr';
import { useSession } from 'next-auth/react';
import ActivityFilters from '@/src/components/dashboard/Logs/Filters';
import { useFilters } from '@/src/contexts/FiltersContext';

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

	const { filters, updateFilters } = useFilters();

	const { data: fullEvents, isLoading } = trpc.userEvent.getList.useQuery(
		{
			product_id: product.id,
			limit: 10,
			page: currentPage,
			filterAction: filters.filterAction,
			startDate,
			endDate
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

	const { data: countNewLogs } = trpc.userEvent.countNewLogs.useQuery(
		{
			product_id: product.id,
			user_id: session?.user.id ? parseInt(session?.user.id) : undefined
		},
		{
			initialData: {
				count: 0
			}
		}
	);

	console.log('count logs : ', countNewLogs);

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
			event.user.email,
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
				<h1>Historique d'activité</h1>
				<div className={cx(classes.filterContainer)}>
					<h4 className={fr.cx('fr-mb-2v')}>Filtres</h4>
					<ActivityFilters
						currentStartDate={startDate}
						currentEndDate={endDate}
						onChange={(startDate, endDate) => {
							setStartDate(startDate);
							setEndDate(endDate);
						}}
						updateFilters={updateFilters}
						filters={filters}
					/>
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
						<div className={fr.cx('fr-col-8', 'fr-pt-2w')}>
							<span aria-live="assertive" className={fr.cx('fr-ml-0')}>
								Activités de{' '}
								<span className={cx(classes.boldText)}>
									{10 * (currentPage - 1) + 1}
								</span>{' '}
								à{' '}
								<span className={cx(classes.boldText)}>
									{10 * (currentPage - 1) + fullEvents.data.length}
								</span>{' '}
								sur{' '}
								<span className={cx(classes.boldText)}>
									{fullEvents.pagination.total}
								</span>
							</span>
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
					Cet historique existe depuis Novembre 2024. Les activités antérieur à
					cette date ne seront pas affichées.
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
	}
});

export { getServerSideProps };

export default UserLogsPage;
