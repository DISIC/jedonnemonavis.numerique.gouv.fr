import React from 'react';
import { getServerSideProps } from '.';
import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react/dsfr';
import Head from 'next/head';
import AccountLayout from '@/src/layouts/Account/AccountLayout';
import { trpc } from '@/src/utils/trpc';
import { Loader } from '@/src/components/ui/Loader';
import Button from '@codegouvfr/react-dsfr/Button';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import OnConfirmModal from '@/src/components/ui/modal/OnConfirm';
import { UserRole } from '@prisma/client';
import AccessCard from '@/src/components/dashboard/Account/Informations/accessCard';
import { formatDateToFrenchString } from '@/src/utils/tools';
import Alert from '@codegouvfr/react-dsfr/Alert';
import { push } from '@socialgouv/matomo-next';

interface Props {
	isOwn: Boolean;
	userId: number;
}

interface Product {
	title: string;
	date: string;
	modifiable: boolean;
	link: string;
	action?: (message: string) => Promise<void>;
}

interface GroupedEntity {
	name: string;
	products: Product[];
}

const onConfirmModal = createModal({
	id: 'user-switch-role-modal',
	isOpenedByDefault: false
});

const UserAccess: React.FC<Props> = props => {
	const { isOwn, userId } = props;
	const { classes, cx } = useStyles();
	const utils = trpc.useUtils();
	const [displayToast, setDisplayToast] = React.useState<string | null>(null);

	const {
		data: userResult,
		isLoading: isLoadingUser,
		refetch: refetchUser,
		isRefetching: isRefetchingUser
	} = trpc.user.getByIdWithRights.useQuery(
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

	const editUser = trpc.user.update.useMutation({
		onSuccess: async () => {
			utils.user.getByIdWithRights.invalidate({});
		}
	});

	const handleSwitchrole = async () => {
		if (user) {
			setDisplayToast(
				`L'accès au rôle superadmin a bien été ${user.role.includes('admin') ? 'retiré' : 'accordé'} pour le compte ${user.firstName} ${user.lastName}.`
			);
			editUser.mutate({
				id: user?.id,
				user: {
					role: user.role.includes('admin') ? 'user' : ('admin' as UserRole)
				}
			});
		}
	};

	const removeAdminEntityright = trpc.adminEntityRight.delete.useMutation({
		onSuccess: async () => {
			utils.user.getByIdWithRights.invalidate({});
		}
	});

	const removeAccessRight = trpc.accessRight.delete.useMutation({
		onSuccess: async () => {
			utils.user.getByIdWithRights.invalidate({});
		}
	});

	const handleRemove = async (id: number, type: 'entity' | 'product') => {
		if (type === 'entity') {
			removeAdminEntityright.mutate({
				admin_entity_right_id: id
			});
		} else {
			removeAccessRight.mutate({
				access_right_id: id
			});
		}
	};

	const groupedEntities: Record<string, GroupedEntity> = {};

	user?.adminEntityRights.forEach(aer => {
		const { entity } = aer;
		if (!groupedEntities[entity.name]) {
			groupedEntities[entity.name] = { name: entity.name, products: [] };
		}
		groupedEntities[entity.name].products.push(
			...entity.products.map(p => ({
				title: p.title,
				date: formatDateToFrenchString(aer.created_at.toString()),
				modifiable: false,
				link: `/administration/dashboard/product/${p.id}/stats`
			}))
		);
	});

	user?.accessRights.forEach(ar => {
		const { product } = ar;
		const { entity } = product;
		if (!groupedEntities[entity.name]) {
			groupedEntities[entity.name] = { name: entity.name, products: [] };
		}
		groupedEntities[entity.name].products.push({
			title: product.title,
			date: formatDateToFrenchString(ar.created_at.toString()),
			modifiable: true,
			link: `/administration/dashboard/product/${product.id}/stats`,
			action: async (message: string) => {
				setDisplayToast(message);
				handleRemove(ar.id, 'product');
			}
		});
	});

	const sortedEntities = Object.values(groupedEntities)
		.sort((a, b) => a.name.localeCompare(b.name))
		.map(entity => ({
			...entity,
			products: entity.products.sort((p1, p2) =>
				p1.title.localeCompare(p2.title)
			)
		}));

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
						{displayToast && (
							<div className={cx(fr.cx('fr-mt-4v'))} role="status">
								<Alert
									closable
									onClose={function noRefCheck() {
										setDisplayToast(null);
									}}
									severity={'success'}
									className={fr.cx('fr-mb-5w')}
									small
									description={displayToast}
								/>
							</div>
						)}
						{isLoadingUser ||
							(isRefetchingUser && (
								<div className={fr.cx('fr-py-20v', 'fr-mt-4w')}>
									<Loader />
								</div>
							))}
						<div className={classes.column}>
							<div
								className={cx(
									fr.cx(
										'fr-grid-row',
										'fr-grid-row--gutters',
										'fr-grid-row--middle'
									)
								)}
							>
								<div className={cx(fr.cx('fr-col-12', 'fr-col-md-6'))}>
									<h2 className={fr.cx('fr-mb-0')}>Accès</h2>
								</div>
								<div
									className={cx(
										fr.cx('fr-col-12', 'fr-col-md-6'),
										classes.actionWrapper
									)}
								>
									{!user.role.includes('admin') && (
										<Button
											priority="secondary"
											type="button"
											onClick={() => {
												onConfirmModal.open();
												push(['trackEvent', 'Users', 'Set-Superadmin']);
											}}
											nativeButtonProps={{
												'aria-label': 'Attribuer le rôle superadmin',
												title: 'Attribuer le rôle superadmin'
											}}
										>
											Attribuer le rôle superadmin à ce compte
										</Button>
									)}
								</div>
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
											push(['trackEvent', 'Users', 'Unset-Superadmin']);
										}}
										nativeButtonProps={{
											'aria-label': 'Retirer le rôle superadmin',
											title: 'Retirer le rôle superadmin'
										}}
									>
										Retirer le rôle superadmin à ce compte
									</Button>
								</div>
							) : (
								<div
									className={cx(
										fr.cx(
											'fr-grid-row',
											'fr-grid-row--gutters',
											'fr-grid-row--middle'
										)
									)}
								>
									<div className={fr.cx('fr-col-12', 'fr-mt-8v')}>
										<h3>Organisations</h3>
										<p>{`${user.firstName} ${user.lastName} ${user.adminEntityRights.length > 0 ? 'est administrateur des organisations suivantes : ' : "n'est administrateur d'aucune organisation pour le moment."}`}</p>
										<ul className={cx(classes.ulContainer)}>
											{user.adminEntityRights
												.sort((a, b) =>
													a.entity.name.localeCompare(b.entity.name)
												)
												.map(aer => (
													<li key={aer.id}>
														<AccessCard
															title={aer.entity.name}
															date={formatDateToFrenchString(
																aer.created_at.toString()
															)}
															modifiable={true}
															action={async (message: string) => {
																setDisplayToast(message);
																handleRemove(aer.id, 'entity');
															}}
														></AccessCard>
													</li>
												))}
										</ul>
									</div>
									<div className={fr.cx('fr-col-12', 'fr-mt-8v')}>
										<h3>Services</h3>
										<p>{`${user.firstName} ${user.lastName} ${sortedEntities.length > 0 ? 'est administrateur des services suivants : ' : "n'est administrateur d'aucun service pour le moment."}`}</p>
										<ul className={cx(classes.ulContainer)}>
											{sortedEntities.map((entity, index) => (
												<li key={entity.name}>
													<React.Fragment key={index}>
														<h5 className={fr.cx('fr-mt-12v', 'fr-mb-4v')}>
															{entity.name}
														</h5>
														<hr />
														<ul className={cx(classes.ulContainer)}>
															{entity.products.map((product, productIndex) => (
																<li
																	key={product.title + '_' + product.modifiable}
																>
																	<AccessCard
																		key={productIndex}
																		title={product.title}
																		date={product.date}
																		modifiable={product.modifiable}
																		action={product.action}
																		link={product.link}
																	></AccessCard>
																</li>
															))}
														</ul>
													</React.Fragment>
												</li>
											))}
										</ul>
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
	actionWrapper: {
		display: 'flex',
		justifyContent: 'flex-end'
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
	ulContainer: {
		padding: 0,
		margin: 0,
		listStyle: 'none !important',
		li: {
			paddingBottom: 0
		}
	},
	urlsWrapper: {
		display: 'flex',
		flexWrap: 'wrap',
		gap: fr.spacing('4v')
	}
});

export default UserAccess;

export { getServerSideProps };
