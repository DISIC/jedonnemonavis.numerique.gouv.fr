import UserCard from '@/src/components/dashboard/User/UserCard';
import UserModal from '@/src/components/dashboard/User/UserModal';
import { Loader } from '@/src/components/ui/Loader';
import { Pagination } from '@/src/components/ui/Pagination';
import OnConfirmModal from '@/src/components/ui/modal/OnConfirm';
import { useFilters } from '@/src/contexts/FiltersContext';
import { getNbPages } from '@/src/utils/tools';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import { Button } from '@codegouvfr/react-dsfr/Button';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import Input from '@codegouvfr/react-dsfr/Input';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import { Select } from '@codegouvfr/react-dsfr/Select';
import Tag from '@codegouvfr/react-dsfr/Tag';
import { Autocomplete, useForkRef } from '@mui/material';
import { User } from '@prisma/client';
import Head from 'next/head';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
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

interface FormValues {
	word: string;
}

const DashBoardUsers = () => {
	const { filters, updateFilters } = useFilters();
	const [search, setSearch] = React.useState<string>('');

	const [numberPerPage, _] = React.useState(10);

	const [currentUser, setCurrentUser] = React.useState<User>();

	const [selectedUsers, setSelectedUsers] = React.useState<number[]>([]);
	const [isCheckedAll, setIsCheckedAll] = React.useState<boolean>(false);
	const [inputValue, setInputValue] = React.useState<string>('');
	const [validateDelete, setValidateDelete] = React.useState(false);

	const { cx, classes } = useStyles();

	const {
		data: entitiesResult,
		isLoading: isLoadingEntities,
		refetch: refetchEntities
	} = trpc.entity.getList.useQuery(
		{ numberPerPage: 1000, userCanCreateProduct: true },
		{ initialData: { data: [], metadata: { count: 0, myEntities: [] } } }
	);

	const { data: entities } = entitiesResult;

	const {
		data: usersResult,
		isLoading: isLoadingUsers,
		refetch: refetchUsers,
		isRefetching: isRefetchingUsers
	} = trpc.user.getList.useQuery(
		{
			search: filters.users.validatedSearch,
			sort: filters.users.filter,
			page: filters.users.currentPage,
			entities: filters.users.entity.map(e => e.value),
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

	const deleteUsers = trpc.user.deleteMany.useMutation({
		onSuccess: () => {
			setSelectedUsers([]);
			setIsCheckedAll(false);
			refetchUsers();
		}
	});

	const handlePageChange = (pageNumber: number) => {
		updateFilters({
			...filters,
			users: {
				...filters.users,
				currentPage: pageNumber
			}
		});
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
			setSelectedUsers([]);
			setIsCheckedAll(false);
			onConfirmModal.open();
		}
	};

	const handleUserCheckbox = (user: User) => {
		if (selectedUsers.includes(user.id)) {
			setSelectedUsers(selectedUsers.filter(id => id !== user.id));
		} else {
			setSelectedUsers([...selectedUsers, user.id]);
		}
	};

	const handleGeneralCheckbox = () => {
		if (selectedUsers.length < users.length) {
			setSelectedUsers(users.map(user => user.id));
			setIsCheckedAll(true);
		} else {
			setSelectedUsers([]);
			setIsCheckedAll(false);
		}
	};

	const {
		control,
		register,
		setError,
		clearErrors,
		formState: { errors }
	} = useForm<FormValues>({
		defaultValues: {
			word: ''
		}
	});

	const verifyProductName = (e: React.ChangeEvent<HTMLInputElement>) => {
		const normalizedInput = e.target.value.trim().toLowerCase();
		const normalizedWord = 'supprimer';
		if (normalizedInput !== normalizedWord) {
			setError('word', {
				message: 'Mot de confirmation incorrect'
			});
		} else {
			clearErrors('word');
			setValidateDelete(true);
		}
	};

	return (
		<>
			<Head>
				<title>Utilisateurs | Je donne mon avis</title>
				<meta name="description" content={`Utilisateurs | Je donne mon avis`} />
			</Head>
			<OnConfirmModal
				modal={onConfirmModal}
				title={`Supprimer ${selectedUsers.length > 0 ? 'des' : 'un'} utilisateur${selectedUsers.length > 0 ? 's' : ''}`}
				kind={'danger'}
				handleOnConfirm={() => {
					if (selectedUsers.length > 0) {
						deleteUsers.mutateAsync({
							ids: selectedUsers
						});
					} else {
						deleteUser.mutate({ id: currentUser?.id as number });
					}
					onConfirmModal.close();
				}}
				disableAction={!validateDelete}
			>
				<>
					{selectedUsers.length > 0 ? (
						<p>
							Vous êtes sur le point de supprimer ces utilisateurs :{' '}
							{selectedUsers.map(uid => (
								<div className={fr.cx('fr-grid-row')} key={uid}>
									<span className={classes.boldText}>
										{users.find(u => u.id === uid)?.firstName}{' '}
										{users.find(u => u.id === uid)?.lastName}
									</span>{' '}
								</div>
							))}
						</p>
					) : (
						<>
							Vous êtes sûr de vouloir supprimer l'utilisateur{' '}
							<span className={classes.boldText}>
								{currentUser?.firstName} {currentUser?.lastName}
							</span>{' '}
							?
						</>
					)}
					<form id="delete-product-form">
						<div className={fr.cx('fr-input-group')}>
							<Controller
								control={control}
								name="word"
								rules={{ required: 'Ce champ est obligatoire' }}
								render={({ field: { value, onChange, name } }) => (
									<Input
										label={
											<p className={fr.cx('fr-mb-0')}>
												Veuillez taper le mot "supprimer" pour confirmer la
												suppression
												<span className={cx(classes.asterisk)}>*</span>
											</p>
										}
										nativeInputProps={{
											onChange: e => {
												onChange(e);
												verifyProductName(e);
											},
											defaultValue: value,
											value,
											name,
											required: true
										}}
										state={errors[name] ? 'error' : 'default'}
										stateRelatedMessage={errors[name]?.message}
									/>
								)}
							/>
						</div>
					</form>
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
						{selectedUsers.length > 0 && (
							<Button
								priority="tertiary"
								iconId="fr-icon-delete-bin-line"
								iconPosition="right"
								className={cx(fr.cx('fr-mr-5v'), classes.iconError)}
								onClick={() => {
									onConfirmModal.open();
								}}
							>
								Supprimer
							</Button>
						)}
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
								onChange: event =>
									updateFilters({
										...filters,
										users: {
											...filters.users,
											filter: event.target.value
										}
									})
							}}
						>
							<option value="email:asc">Email de A à Z</option>
							<option value="lastName:asc">Nom de A à Z</option>
							<option value="firstName:asc">Prénom de A à Z</option>
							<option value="created_at:desc">Date de création</option>
							<option value="updated_at:desc">Date de mise à jour</option>
						</Select>
					</div>
					<div className={fr.cx('fr-col-12', 'fr-col-md-4')}>
						<Autocomplete
							id="filter-entity"
							disablePortal
							sx={{ width: '100%' }}
							options={entities
								.map(entity => ({
									label: `${entity.name} (${entity.acronym})`,
									value: entity.id
								}))
								.filter(
									entity =>
										!filters.users.entity.some(
											filter => filter.value === entity.value
										)
								)}
							onChange={(_, option) => {
								if (option)
									updateFilters({
										...filters,
										users: {
											...filters.users,
											currentPage: 1,
											entity: [...filters.users.entity, option]
										}
									});
							}}
							noOptionsText="Aucune organisation trouvée"
							inputValue={inputValue}
							onInputChange={(event, newInputValue) => {
								setInputValue(newInputValue);
							}}
							renderInput={params => (
								<div ref={params.InputProps.ref}>
									<label htmlFor="filter-entity" className="fr-label">
										Filtrer par organisation
									</label>
									<input
										{...params.inputProps}
										className={params.inputProps.className + ' fr-input'}
										placeholder="Sélectionner une option"
										type="search"
									/>
								</div>
							)}
						/>
					</div>
					<div className={fr.cx('fr-col-12', 'fr-col-md-5', 'fr-col--bottom')}>
						<form
							className={cx(classes.searchForm)}
							onSubmit={e => {
								e.preventDefault();
								updateFilters({
									...filters,
									users: {
										...filters.users,
										validatedSearch: search,
										currentPage: 1
									}
								});
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
												updateFilters({
													...filters,
													users: {
														...filters.users,
														validatedSearch: ''
													}
												});
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
					<ul
						className={cx(
							fr.cx('fr-col-12', 'fr-col-md-12', 'fr-my-1w'),
							classes.tagContainer
						)}
					>
						{filters.users.entity.map((entity, index) => (
							<li key={index}>
								<Tag
									dismissible
									className={cx(classes.tagFilter)}
									title={`Retirer ${entity.label}`}
									nativeButtonProps={{
										onClick: () => {
											updateFilters({
												...filters,
												users: {
													...filters.users,
													entity: filters.users.entity.filter(
														e => e.value !== entity.value
													)
												}
											});
											setInputValue('');
										}
									}}
								>
									<p>{entity.label}</p>
								</Tag>
							</li>
						))}
					</ul>
				</div>
				{isLoadingUsers ? (
					<div className={fr.cx('fr-py-20v', 'fr-mt-4w')}>
						<Loader />
					</div>
				) : (
					<div>
						<div className={fr.cx('fr-col-8', 'fr-pt-3w', 'fr-pb-2w')}>
							<span aria-live="assertive" className={fr.cx('fr-ml-0')}>
								Utilisateurs de{' '}
								<span className={cx(classes.boldText)}>
									{numberPerPage * (filters.users.currentPage - 1) + 1}
								</span>{' '}
								à{' '}
								<span className={cx(classes.boldText)}>
									{numberPerPage * (filters.users.currentPage - 1) +
										users.length}
								</span>{' '}
								sur{' '}
								<span className={cx(classes.boldText)}>
									{usersResult.metadata.count}
								</span>
							</span>
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
											'fr-grid-row--middle',
											'fr-px-4v'
										),
										classes.boldText
									)}
								>
									<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-1')}>
										<Checkbox
											options={[
												{
													label: '',

													nativeInputProps: {
														'aria-label': 'Tout sélectionner',
														checked: isCheckedAll,
														name: 'select_all',
														value: 'value1',
														onClick: () => {
															handleGeneralCheckbox();
														}
													}
												}
											]}
										></Checkbox>
									</div>
									<div
										className={fr.cx(
											'fr-col',
											'fr-col-12',
											'fr-col-md-3',
											'fr-hidden',
											'fr-unhidden-md'
										)}
									>
										<span>Utilisateur</span>
									</div>
									<div
										className={fr.cx(
											'fr-col',
											'fr-col-12',
											'fr-col-md-3',
											'fr-hidden',
											'fr-unhidden-md'
										)}
									>
										<span>Addresse mail</span>
									</div>
									<div
										className={fr.cx(
											'fr-col',
											'fr-col-12',
											'fr-col-md-3',
											'fr-hidden',
											'fr-unhidden-md'
										)}
									>
										<span>Date de création</span>
									</div>
									<div
										className={fr.cx(
											'fr-col',
											'fr-col-12',
											'fr-col-md-2',
											'fr-hidden',
											'fr-unhidden-md'
										)}
									>
										<span>Superadmin</span>
									</div>
								</div>
							</div>
							{isRefetchingUsers ? (
								<div className={fr.cx('fr-py-20v', 'fr-mt-4w')}>
									<Loader />
								</div>
							) : (
								<ul className={cx(classes.ulContainer)}>
									{users.map((user, index) => (
										<li key={index}>
											<UserCard
												user={user}
												onButtonClick={handleModalOpening}
												onCheckboxClick={handleUserCheckbox}
												selected={selectedUsers.includes(user.id)}
											/>
										</li>
									))}
								</ul>
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
									defaultPage={filters.users.currentPage}
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
				justifySelf: 'flex-end'
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
	ulContainer: {
		padding: 0,
		margin: 0,
		listStyle: 'none !important',
		li: {
			paddingBottom: 0
		}
	},
	asterisk: {
		color: fr.colors.decisions.text.default.error.default
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
	},
	iconError: {
		color: fr.colors.decisions.text.default.error.default
	},
	deleteCol: {
		display: 'flex',
		justifyContent: 'flex-end'
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
	},
	tagFilter: {
		marginRight: '0.5rem',
		marginBottom: '0.5rem'
	}
}));

export default DashBoardUsers;
