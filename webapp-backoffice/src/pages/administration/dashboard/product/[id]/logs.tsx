import React from 'react';
import ProductLayout from '../../../../../layouts/Product/ProductLayout';
import { Product, TypeAction } from '@prisma/client';
import Head from 'next/head';
import { getServerSideProps } from '.';
import { tss } from 'tss-react/dsfr';
import { trpc } from '@/src/utils/trpc';
import { Table } from '@codegouvfr/react-dsfr/Table';
import { handleActionTypeDisplay } from '@/src/utils/tools';
import { JsonValue } from '@prisma/client/runtime/library';

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

	const { data: userEvents } = trpc.userEvent.getList.useQuery({
		product_id: product.id
	});

	const headers = ['Action', 'Date'];

	const tableData =
		userEvents?.data.map((event: Event) => [
			handleActionTypeDisplay(event.action, event.metadata),
			event.created_at.toLocaleString()
		]) || [];

	return (
		<ProductLayout product={product}>
			<Head>
				<title>{product.title} | Logs | Je donne mon avis</title>
				<meta
					name="description"
					content={`${product.title} | Logs | Je donne mon avis`}
				/>
			</Head>
			<div className={classes.container}>
				<h1>Logs</h1>
				{userEvents?.data.length === 0 ? (
					<p>Aucun événement trouvé</p>
				) : (
					<Table data={tableData} headers={headers} fixed />
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
