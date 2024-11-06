import React from 'react';
import { getServerSideProps } from '.';
import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react/dsfr';
import Head from 'next/head';
import { User } from '@/prisma/generated/zod';
import AccountLayout from '@/src/layouts/Account/AccountLayout';
import { trpc } from '@/src/utils/trpc';
import { Loader } from '@/src/components/ui/Loader';
import Button from '@codegouvfr/react-dsfr/Button';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import OnConfirmModal from '@/src/components/ui/modal/OnConfirm';
import { UserRole } from '@prisma/client';

interface Props {
	isOwn: Boolean;
	userId: number;
}

const onConfirmModal = createModal({
	id: 'user-switch-role-modal',
	isOpenedByDefault: false
});

const UserAccess: React.FC<Props> = props => {
	const { isOwn, userId } = props;
	const { classes, cx } = useStyles();
	const utils = trpc.useUtils();

	const {
		data: userResult,
		isLoading: isLoadingUser,
		refetch: refetchUser,
		isRefetching: isRefetchingUser
	} = trpc.user.getById.useQuery(
		{
			id: userId
		},
		{
			initialData: {
				data: null
			},
			enabled: userId !== undefined
		}
	);

	const user = userResult?.data;

	console.log('user : ', user);

	const editUser = trpc.user.update.useMutation({
		onSuccess: async () => {
			utils.user.getById.invalidate({});
		}
	});

	const handleSwitchrole = async () => {
		if (user)
			editUser.mutate({
				id: user?.id,
				user: {
					role: user.role.includes('admin') ? 'user' : ('admin' as UserRole)
				}
			});
	};

	return (
		<>
			{!user ||
				isLoadingUser ||
				(isRefetchingUser && (
					<div className={fr.cx('fr-py-20v', 'fr-mt-4w')}>
						<Loader />
					</div>
				))}
			{!isLoadingUser && !isRefetchingUser && user && (
				<>
					<OnConfirmModal
						modal={onConfirmModal}
						title={`${user.role.includes('admin') ? 'Retirer' : 'Donner'} le rôle superadmin`}
						handleOnConfirm={() => {
							handleSwitchrole();
						}}
					>
						<>
							<p>
								Vous êtes sûr de vouloir{' '}
								{`${user.role.includes('admin') ? `retirer l'accès de` : 'passer'}`}{' '}
								{`${user.firstName} ${user.lastName}`} en tant que superadmin ?
							</p>
							<p>
								Cette personne{' '}
								{`${user.role.includes('admin') ? `ne pourra plus` : 'pourra'}`}{' '}
								:{' '}
							</p>
							<ul className={fr.cx('fr-ml-4v')}>
								<li>avoir accès à toutes les organisations</li>
								<li>avoir accès à tous les services</li>
								<li>gérer les utilisateurs</li>
							</ul>
						</>
					</OnConfirmModal>
					<AccountLayout isOwn={isOwn} user={user}>
						<Head>
							{!isLoadingUser && user && (
								<>
									<title>
										{`${user.firstName} ${user.lastName}`} | Compte Accès
										services et organisations | Je donne mon avis
									</title>
									<meta
										name="description"
										content={`${user.firstName} ${user.lastName} | Compte Accès services et organisations | Je donne mon avis`}
									/>
								</>
							)}
						</Head>
						{isLoadingUser ||
							(isRefetchingUser && (
								<div className={fr.cx('fr-py-20v', 'fr-mt-4w')}>
									<Loader />
								</div>
							))}
						<div className={classes.column}>
							<div className={classes.headerWrapper}>
								<h2 className={fr.cx('fr-mb-0')}>Accès</h2>
								{!user.role.includes('admin') && (
									<Button
										priority="secondary"
										type="button"
										onClick={() => {
											onConfirmModal.open();
										}}
									>
										Attribuer le rôle superadmin à ce compte
									</Button>
								)}
							</div>
							{user.role.includes('admin') ? (
								<div>
									<h3>Superadmin</h3>
									<p>
										{`${user.firstName} ${user.lastName}`} est superadmin. Cette
										personne a accès à toutes les organisations et tous les
										services, et peut passer les utilisateurs en superadmin.
									</p>
									<Button
										priority="secondary"
										type="button"
										onClick={() => {
											onConfirmModal.open();
										}}
									>
										Retirer le rôle superadmin à ce compte
									</Button>
								</div>
							) : (
								<div className={cx(fr.cx('fr-grid-row'))}>
									<div className={fr.cx('fr-col-12', 'fr-mt-8v')}>
										<h3>Organisations</h3>
										<p>{`${user.firstName} ${user.lastName} est administrateur des organisations suivantes : `}</p>
										{user.adminEntityRights.map(aer => (
											<>{aer.entity.name}</>
										))}
									</div>
									<div className={fr.cx('fr-col-12', 'fr-mt-8v')}>
										<h3>Services</h3>
										<p>{`${user.firstName} ${user.lastName} est administrateur des services suivants : `}</p>
									</div>
								</div>
							)}
						</div>
					</AccountLayout>
				</>
			)}
		</>
	);
};

const useStyles = tss.withName(UserAccess.name).create({
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

export default UserAccess;

export { getServerSideProps };
