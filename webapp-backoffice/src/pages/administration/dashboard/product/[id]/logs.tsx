import React, { useState } from 'react';
import ProductLayout from '../../../../../layouts/Product/ProductLayout';
import { Product, TypeAction } from '@prisma/client';
import Head from 'next/head';
import { getServerSideProps } from '.';
import { tss } from 'tss-react/dsfr';
import { trpc } from '@/src/utils/trpc';
import { Table } from '@codegouvfr/react-dsfr/Table';
import { getNbPages, handleActionTypeDisplay } from '@/src/utils/tools';
import { JsonValue } from '@prisma/client/runtime/library';
import { Pagination } from '@/src/components/ui/Pagination';
import { fr } from '@codegouvfr/react-dsfr';
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

	const [currentPage, setCurrentPage] = useState(1);

	const { data } = trpc.userEvent.getList.useQuery({
		product_id: product.id,
		limit: 10,
		page: currentPage
	});

	const fullEvents = data?.data;
	const eventsCount = data?.pagination.total;

	const nbPages = getNbPages(eventsCount || 0, 10);

	const headers = ['Action', 'Date'];

	const tableData =
		fullEvents?.map((event: Event) => [
			handleActionTypeDisplay(event.action, event.metadata, product.title),
			event.created_at.toLocaleString()
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
				{fullEvents?.length === 0 ? (
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
		gap: '1rem'
	}
});

export { getServerSideProps };

export default UserLogsPage;
