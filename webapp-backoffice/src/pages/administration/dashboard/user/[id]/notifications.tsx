import React from 'react';
import { getServerSideProps } from '.';
import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react/dsfr';
import Head from 'next/head';
import { User } from '@/prisma/generated/zod';
import AccountLayout from '@/src/layouts/Account/AccountLayout';

interface Props {
	isOwn: Boolean;
	user: User;
}

const NotificationsAccount: React.FC<Props> = props => {
	const { user, isOwn } = props;

	const { classes } = useStyles();

	return (
		<AccountLayout isOwn={isOwn} user={user}>
			<Head>
				<title>
					{`${user.firstName} ${user.lastName}`} | Compte Notifications | Je
					donne mon avis
				</title>
				<meta
					name="description"
					content={`${user.firstName} ${user.lastName} | Form Notifications | Je donne mon avis`}
				/>
			</Head>
			<div className={classes.column}>
				<div className={classes.headerWrapper}>
					<h2>Notifications</h2>
				</div>
			</div>
		</AccountLayout>
	);
};

const useStyles = tss.withName(NotificationsAccount.name).create({
	headerWrapper: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between'
	},
	column: {
		display: 'flex',
		flexDirection: 'column',
		gap: fr.spacing('10v')
	},
	droppableArea: {
		padding: '8px',
		backgroundColor: '#f4f4f4',
		minHeight: '200px'
	},
	urlsWrapper: {
		display: 'flex',
		flexWrap: 'wrap',
		gap: fr.spacing('4v')
	}
});

export default NotificationsAccount;

export { getServerSideProps };
