import UserRequestCard from '@/src/components/dashboard/UserRequest/UserRequestCard';
import { Loader } from '@/src/components/ui/Loader';
import { Pagination } from '@/src/components/ui/Pagination';
import OnConfirmModal from '@/src/components/ui/modal/OnConfirm';
import { UserRequestWithUser } from '@/src/types/prismaTypesExtended';
import { getNbPages } from '@/src/utils/tools';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Alert from '@codegouvfr/react-dsfr/Alert';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import Select from '@codegouvfr/react-dsfr/Select';
import React from 'react';
import { tss } from 'tss-react/dsfr';

export type UserRequestExtended = UserRequestWithUser & {
	type: 'accept-on-confirm' | 'accept' | 'delete-on-confirm' | 'delete';
};

const onConfirmDeleteModal = createModal({
	id: 'user-request-delete-on-confirm-modal',
	isOpenedByDefault: false
});

const onConfirmAcceptModal = createModal({
	id: 'user-request-accept-on-confirm-modal',
	isOpenedByDefault: false
});

const DashBoardUserRequestUserRequests = () => {
	const [filter, setFilter] = React.useState<string>('created_at:asc');

	const [currentUserRequest, setCurrentUserRequest] =
		React.useState<UserRequestExtended>();

	const handleCurrentUserRequest = (user_request: UserRequestExtended) => {
		setCurrentUserRequest(user_request);
		if (user_request.type === 'delete-on-confirm') {
			onConfirmDeleteModal.open();
		} else if (user_request.type === 'accept-on-confirm') {
			onConfirmAcceptModal.open();
		}
	};

	const [createDomainOnAccept, setCreateDomainOnAccept] =
		React.useState<boolean>(false);

	const [currentPage, setCurrentPage] = React.useState(1);
	const [numberPerPage, _] = React.useState(10);

	const { cx, classes } = useStyles();

	const {
		data: userrequestsResult,
		isLoading: isLoadingUserRequests,
		refetch: refectUserRequests,
		isRefetching: isRefetchingUserRequests
	} = trpc.userRequest.getList.useQuery(
		{
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
		data: userRequests,
		metadata: { count: userRequestsCount }
	} = userrequestsResult;

	const createDomain = trpc.domain.create.useMutation();

	const updateUser = trpc.user.update.useMutation({
		onSuccess: () => refectUserRequests()
	});

	const deleteUserRequest = trpc.userRequest.delete.useMutation();

	const handleOnConfirmAccept = () => {
		if (currentUserRequest) {
			updateUser.mutate({
				id: currentUserRequest.user.id,
				user: { active: true }
			});

			if (createDomainOnAccept) {
				createDomain.mutate({
					domain: currentUserRequest.user.email.split('@')[1]
				});
			}

			deleteUserRequest.mutate({
				id: currentUserRequest.id
			});
		}
		setCreateDomainOnAccept(false);
		onConfirmAcceptModal.close();
	};

	const handlePageChange = (pageNumber: number) => {
		setCurrentPage(pageNumber);
	};

	const nbPages = getNbPages(userRequestsCount, numberPerPage);

	return (
		<>
			<OnConfirmModal
				modal={onConfirmDeleteModal}
				title="Rejeter la demande d'accès"
				handleOnConfirm={() =>
					deleteUserRequest.mutate({
						id: currentUserRequest?.id as number
					})
				}
			>
				<>
					Voulez-vous vraiment rejeter la demande d'accès de{' '}
					<span className={cx(classes.boldText)}>
						{`${currentUserRequest?.user.firstName} ${currentUserRequest?.user.lastName}`}
					</span>{' '}
					?
				</>
			</OnConfirmModal>
			<OnConfirmModal
				modal={onConfirmAcceptModal}
				title="Accepter la demande d'accès"
				handleOnConfirm={() => handleOnConfirmAccept()}
			>
				<>
					Accepter la demande d'accès de{' '}
					<span className={cx(classes.boldText)}>
						{`${currentUserRequest?.user.firstName} ${currentUserRequest?.user.lastName}`}
					</span>{' '}
					?
					<Checkbox
						options={[
							{
								label:
									'Ajouter le domaine à la liste blanche des noms de domaines',
								nativeInputProps: {
									name: 'createDomainOnAccept',
									onChange: event =>
										setCreateDomainOnAccept(event.target.checked)
								}
							}
						]}
					/>
				</>
			</OnConfirmModal>
			<div className={fr.cx('fr-container', 'fr-py-6w')}>
				<div
					className={fr.cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-mb-3w')}
				>
					<div className={fr.cx('fr-col-12', 'fr-col-md-12')}>
						<h1 className={fr.cx('fr-mb-0')}>Demandes d'accès</h1>
					</div>
				</div>
				<div
					className={fr.cx(
						'fr-grid-row',
						'fr-grid-row--gutters',
						'fr-grid-row--top'
					)}
				>
					<div className={fr.cx('fr-col-12', 'fr-col-md-3')}>
						<Select
							label="Trier Par"
							nativeSelectProps={{
								name: 'my-select',
								onChange: event => setFilter(event.target.value)
							}}
						>
							<option value="created_at:desc">Date de création</option>
							<option value="updated_at:desc">Date de mise à jour</option>
						</Select>
					</div>
				</div>
				{isLoadingUserRequests ? (
					<div className={fr.cx('fr-py-20v', 'fr-mt-4w')}>
						<Loader />
					</div>
				) : (
					<div>
						<div className={fr.cx('fr-col-8', 'fr-pt-3w')}>
							{nbPages > 1 && (
								<span className={fr.cx('fr-ml-0')}>
									UserRequestes de{' '}
									<span className={cx(classes.boldText)}>
										{numberPerPage * (currentPage - 1) + 1}
									</span>{' '}
									à{' '}
									<span className={cx(classes.boldText)}>
										{numberPerPage * (currentPage - 1) + userRequests.length}
									</span>{' '}
									de{' '}
									<span className={cx(classes.boldText)}>
										{userrequestsResult.metadata.count}
									</span>
								</span>
							)}
						</div>
						<div
							className={cx(
								userRequests.length === 0 ? classes.userrequestsContainer : ''
							)}
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
										<span>Raison de la demande</span>
									</div>
								</div>
							</div>
							{isRefetchingUserRequests ? (
								<div className={fr.cx('fr-py-20v', 'fr-mt-4w')}>
									<Loader />
								</div>
							) : (
								userRequests.map((userRequest, index) => (
									<UserRequestCard
										key={index}
										userRequest={userRequest}
										setCurrentUserRequest={handleCurrentUserRequest}
									/>
								))
							)}
							{userRequests.length === 0 && !isRefetchingUserRequests && (
								<div className={fr.cx('fr-grid-row', 'fr-grid-row--center')}>
									<div
										className={cx(
											fr.cx('fr-col-12', 'fr-col-md-5', 'fr-mt-30v'),
											classes.textContainer
										)}
										role="status"
									>
										<p>Aucun demande d'accès trouvé</p>
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
										key: `pagination-link-userrequest-${pageNumber}`
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

const useStyles = tss
	.withName(DashBoardUserRequestUserRequests.name)
	.create(() => ({
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
		userrequestsContainer: {
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
		formAdd: {
			display: 'flex',
			alignItems: 'start'
		},
		buttonAdd: {
			marginLeft: '1.5rem'
		},
		boldText: {
			fontWeight: 'bold'
		},
		labelHeight: {
			marginTop: '2rem'
		},
		alert: {
			marginTop: '1rem',
			marginBottom: '1rem'
		}
	}));

export default DashBoardUserRequestUserRequests;
