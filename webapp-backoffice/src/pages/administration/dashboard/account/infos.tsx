import React from 'react';
import { getServerSideProps } from '.';
import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react/dsfr';
import Head from 'next/head';
import { User } from '@/prisma/generated/zod';
import AccountLayout from '@/src/layouts/Account/AccountLayout';
import CardIdentity from '@/src/components/dashboard/Account/Informations/cardIdentity';

interface Props {
	user: User;
}

const InfosAccount: React.FC<Props> = props => {
	const { user } = props;

	const { classes } = useStyles();

	return (
		<AccountLayout user={user}>
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
					<CardIdentity user={user} title={'Identité'} modifiable={true}>
						<>test</>
					</CardIdentity>
				</div>
				<div>
					<CardIdentity
						user={user}
						title={'Identifiants de connexion'}
						modifiable={true}
					>
						<>test</>
					</CardIdentity>
				</div>
				<div>
					<CardIdentity
						user={user}
						title={'Suppression du compte'}
						hint={'Cette action est irréversible.'}
						modifiable={false}
					>
						<>test</>
					</CardIdentity>
				</div>
			</div>
		</AccountLayout>
	);
};

const useStyles = tss.withName(InfosAccount.name).create({
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

export default InfosAccount;

export { getServerSideProps };
