import UserCard from '@/src/components/dashboard/User/UserCard';
import UserModal from '@/src/components/dashboard/User/UserModal';
import { Loader } from '@/src/components/ui/Loader';
import { Pagination } from '@/src/components/ui/Pagination';
import OnConfirmModal from '@/src/components/ui/modal/OnConfirm';
import { getNbPages } from '@/src/utils/tools';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import { Button } from '@codegouvfr/react-dsfr/Button';
import Input from '@codegouvfr/react-dsfr/Input';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import { Select } from '@codegouvfr/react-dsfr/Select';
import { User } from '@prisma/client';
import React from 'react';
import { tss } from 'tss-react/dsfr';

export type OnButtonClickUserParams =
	| { type: 'create'; user?: User }
	| { type: 'delete'; user: User };

const userModal = createModal({
	id: 'user-modal',
	isOpenedByDefault: false
});

const onConfirmModal = createModal({
	id: 'user-on-confirm-modal',
	isOpenedByDefault: false
});

const DashBoardUsers = () => {
	const [filter, setFilter] = React.useState<string>('email:asc');
	const [search, setSearch] = React.useState<string>('');
	const [validatedSearch, setValidatedSearch] = React.useState<string>('');

	const [currentPage, setCurrentPage] = React.useState(1);
	const [numberPerPage, _] = React.useState(10);

	const [currentUser, setCurrentUser] = React.useState<User>();

	const { cx, classes } = useStyles();

	const {
		data: usersResult,
		isLoading: isLoadingUsers,
		refetch: refetchUsers,
		isRefetching: isRefetchingUsers
	} = trpc.user.getList.useQuery(
		{
			search: validatedSearch,
			sort: filter,
			page: currentPage,
			numberPerPage
		},
		{
			initialData: {
				data: [],
				metadata: {
					count: 0
				}
			}
		}
	);

	const {
		data: users,
		metadata: { count: usersCount }
	} = usersResult;

	const deleteUser = trpc.user.delete.useMutation({
		onSuccess: () => refetchUsers()
	});

	const handlePageChange = (pageNumber: number) => {
		setCurrentPage(pageNumber);
	};

	const nbPages = getNbPages(usersCount, numberPerPage);

	const isModalOpen = useIsModalOpen(userModal);

	const handleModalOpening = async ({
		type,
		user
	}: OnButtonClickUserParams) => {
		setCurrentUser(user);
		if (type === 'create') {
			userModal.open();
		} else if (type === 'delete') {
			onConfirmModal.open();
		}
	};

	return (
		<>
			<OnConfirmModal
				modal={onConfirmModal}
				title="Supprimer un utilisateur"
				handleOnConfirm={() => {
					deleteUser.mutate({ id: currentUser?.id as number });
					onConfirmModal.close();
				}}
			>
				<>
					Vous êtes sûr de vouloir supprimer l'utilisateur{' '}
					<span className={classes.boldText}>
						{currentUser?.firstName} {currentUser?.lastName}
					</span>{' '}
					?
				</>
			</OnConfirmModal>
			<UserModal
				modal={userModal}
				isOpen={isModalOpen}
				user={currentUser}
				refetchUsers={refetchUsers}
			/>
			<div className={fr.cx('fr-container', 'fr-py-6w')}>
				<div
					className={fr.cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-mb-3w')}
				>
					<div className={fr.cx('fr-col-12', 'fr-col-md-5')}>
						<h1 className={fr.cx('fr-mb-0')}>Utilisateurs</h1>
					</div>
					<div
						className={cx(
							fr.cx('fr-col-12', 'fr-col-md-7'),
							classes.buttonContainer
						)}
					>
						<Button
							priority="secondary"
							iconId="fr-icon-add-circle-line"
							iconPosition="right"
							type="button"
							onClick={() => handleModalOpening({ type: 'create' })}
						>
							Ajouter un nouvel utilisateur
						</Button>
					</div>
				</div>
				<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
					<div className={fr.cx('fr-col-12', 'fr-col-md-3')}>
						<Select
							label="Trier Par"
							nativeSelectProps={{
								name: 'my-select',
								onChange: event => setFilter(event.target.value)
							}}
						>
							<option value="email:asc">Nom A à Z</option>
							<option value="created_at:desc">Date de création</option>
							<option value="updated_at:desc">Date de mise à jour</option>
						</Select>
					</div>
					<div className={fr.cx('fr-col-12', 'fr-col-md-5', 'fr-col--bottom')}>
						<form
							className={cx(classes.searchForm)}
							onSubmit={e => {
								e.preventDefault();
								setValidatedSearch(search);
								setCurrentPage(1);
							}}
						>
							<div role="search" className={fr.cx('fr-search-bar')}>
								<Input
									label="Rechercher un utilisateur"
									hideLabel
									nativeInputProps={{
										placeholder: 'Rechercher un utilisateur',
										type: 'search',
										value: search,
										onChange: event => {
											if (!event.target.value) {
												setValidatedSearch('');
											}
											setSearch(event.target.value);
										}
									}}
								/>
								<Button
									priority="primary"
									type="submit"
									iconId="ri-search-2-line"
									iconPosition="left"
								>
									Rechercher
								</Button>
							</div>
						</form>
					</div>
				</div>
				{isLoadingUsers ? (
					<div className={fr.cx('fr-py-20v', 'fr-mt-4w')}>
						<Loader />
					</div>
				) : (
					<div>
						<div className={fr.cx('fr-col-8', 'fr-pt-3w')}>
							{nbPages > 1 && (
								<span className={fr.cx('fr-ml-0')}>
									Utilisateurs de{' '}
									<span className={cx(classes.boldText)}>
										{numberPerPage * (currentPage - 1) + 1}
									</span>{' '}
									à{' '}
									<span className={cx(classes.boldText)}>
										{numberPerPage * (currentPage - 1) + users.length}
									</span>{' '}
									sur{' '}
									<span className={cx(classes.boldText)}>
										{usersResult.metadata.count}
									</span>
								</span>
							)}
						</div>
						<div
							className={cx(users.length === 0 ? classes.usersContainer : '')}
						>
							<div className={fr.cx('fr-mt-2v')}>
								<div
									className={cx(
										fr.cx(
											'fr-grid-row',
											'fr-grid-row--gutters',
											'fr-grid-row--middle'
										),
										classes.boldText
									)}
								>
									<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-3')}>
										<span>Utilisateur</span>
									</div>
									<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-3')}>
										<span>Date de création</span>
									</div>
									<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-3')}>
										<span>Observatoire</span>
									</div>
								</div>
							</div>
							{isRefetchingUsers ? (
								<div className={fr.cx('fr-py-20v', 'fr-mt-4w')}>
									<Loader />
								</div>
							) : (
								users.map((user, index) => (
									<UserCard
										user={user}
										key={index}
										onButtonClick={handleModalOpening}
									/>
								))
							)}
							{!isRefetchingUsers && users.length === 0 && (
								<div className={fr.cx('fr-grid-row', 'fr-grid-row--center')}>
									<div
										className={cx(
											fr.cx('fr-col-12', 'fr-col-md-5', 'fr-mt-30v'),
											classes.textContainer
										)}
										role="status"
									>
										<p>Aucun utilisateur trouvé</p>
									</div>
								</div>
							)}
						</div>
						<div
							className={fr.cx(
								'fr-grid-row--center',
								'fr-grid-row',
								'fr-mb-15w'
							)}
						>
							{nbPages > 1 && (
								<Pagination
									showFirstLast
									count={nbPages}
									defaultPage={currentPage}
									getPageLinkProps={pageNumber => ({
										onClick: event => {
											event.preventDefault();
											handlePageChange(pageNumber);
										},
										href: '#',
										classes: { link: fr.cx('fr-pagination__link') },
										key: `pagination-link-user-${pageNumber}`
									})}
									className={fr.cx('fr-mt-1w')}
								/>
							)}
						</div>
					</div>
				)}
			</div>
		</>
	);
};

const useStyles = tss.withName(DashBoardUsers.name).create(() => ({
	buttonContainer: {
		[fr.breakpoints.up('md')]: {
			display: 'flex',
			alignSelf: 'flex-end',
			justifyContent: 'flex-end',
			'.fr-btn': {
				justifySelf: 'flex-end',
				'&:first-of-type': {
					marginRight: '1rem'
				}
			}
		},
		[fr.breakpoints.down('md')]: {
			'.fr-btn:first-of-type': {
				marginBottom: '1rem'
			}
		}
	},
	usersContainer: {
		minHeight: '20rem'
	},
	textContainer: {
		textAlign: 'center',
		p: {
			margin: 0,
			fontWeight: 'bold'
		}
	},
	searchForm: {
		'.fr-search-bar': {
			'.fr-input-group': {
				width: '100%',
				marginBottom: 0
			}
		}
	},
	boldText: {
		fontWeight: 'bold'
	}
}));

export default DashBoardUsers;
