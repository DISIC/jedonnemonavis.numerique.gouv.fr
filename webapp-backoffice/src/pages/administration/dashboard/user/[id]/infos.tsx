import React from 'react';
import { getServerSideProps } from '.';
import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react/dsfr';
import Head from 'next/head';
import { User } from '@/prisma/generated/zod';
import AccountLayout from '@/src/layouts/Account/AccountLayout';
import IdentityCard from '@/src/components/dashboard/Account/Informations/identityCard';
import CredentialsCard from '@/src/components/dashboard/Account/Informations/credentialsCard';
import DeleteCard from '@/src/components/dashboard/Account/Informations/deleteCard';
import { trpc } from '@/src/utils/trpc';
import { useRouter } from 'next/router';
import { Loader } from '@/src/components/ui/Loader';

interface Props {
	isOwn: Boolean;
	userId: number;
	user: User;
}

const UserInfos: React.FC<Props> = props => {
	const { isOwn, userId, user } = props;
	const { classes } = useStyles();
	const router = useRouter();

	return (
		<>
			<AccountLayout isOwn={isOwn} user={user}>
				<Head>
					<title>
						{`${user.firstName} ${user.lastName}`} | Compte Informations | Je
						donne mon avis
					</title>
					<meta
						name="description"
						content={`${user.firstName} ${user.lastName} | Form Informations | Je donne mon avis`}
					/>
				</Head>

				<div className={classes.column}>
					<div className={classes.headerWrapper}>
						<h2>Informations</h2>
					</div>
					<div>
						<IdentityCard user={user} />
					</div>
					<div>
						<CredentialsCard user={user} />
					</div>
					<div>
						<DeleteCard user={user} isOwn={isOwn} />
					</div>
				</div>
			</AccountLayout>
		</>
	);
};

const useStyles = tss.withName(UserInfos.name).create({
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

export default UserInfos;

export { getServerSideProps };
