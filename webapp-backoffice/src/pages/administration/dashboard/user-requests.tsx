import UserRequestCard from '@/src/components/dashboard/UserRequest/UserRequestCard';
import { Loader } from '@/src/components/ui/Loader';
import { PageItemsCounter, Pagination } from '@/src/components/ui/Pagination';
import OnConfirmModal from '@/src/components/ui/modal/OnConfirm';
import { UserRequestWithUser } from '@/src/types/prismaTypesExtended';
import { extractDomainFromEmail, getNbPages } from '@/src/utils/tools';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Alert from '@codegouvfr/react-dsfr/Alert';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import Input from '@codegouvfr/react-dsfr/Input';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import Select from '@codegouvfr/react-dsfr/Select';
import Head from 'next/head';
import React, { useEffect } from 'react';
import { tss } from 'tss-react/dsfr';

export type UserRequestExtended = UserRequestWithUser & {
	type: 'accept-on-confirm' | 'accept' | 'refused-on-confirm' | 'refused';
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
	const [displayProcessed, setDisplayProcessed] =
		React.useState<boolean>(false);

	const [currentUserRequest, setCurrentUserRequest] =
		React.useState<UserRequestExtended>();

	const [refusedReason, setRefusedReason] = React.useState<
		string | undefined
	>();

	const handleCurrentUserRequest = (user_request: UserRequestExtended) => {
		setCurrentUserRequest(user_request);
		if (user_request.type === 'refused-on-confirm') {
			onConfirmDeleteModal.open();
		} else if (user_request.type === 'accept-on-confirm') {
			onConfirmAcceptModal.open();
		}
	};

	const [createDomainOnAccept, setCreateDomainOnAccept] =
		React.useState<boolean>(false);

	const [currentPage, setCurrentPage] = React.useState(1);
	const [numberPerPage, _] = React.useState(10);

	const utils = trpc.useUtils();

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
			numberPerPage,
			displayProcessed
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

	useEffect(() => {
		utils.userRequest.getList.invalidate();
	}, [userRequestsCount]);

	const updateUserRequest = trpc.userRequest.update.useMutation({
		onSuccess: result => {
			refectUserRequests();
			setCurrentUserRequest({
				...result.data,
				type: result.data.status === 'accepted' ? 'accept' : 'refused'
			});
			setCreateDomainOnAccept(false);
		}
	});

	const handleOnConfirmAccept = () => {
		if (currentUserRequest) {
			updateUserRequest.mutate({
				id: currentUserRequest.id,
				userRequest: { status: 'accepted' },
				createDomain: createDomainOnAccept
			});
		}
		onConfirmAcceptModal.close();
		if ((userRequestsCount - 1) % numberPerPage === 0) {
			setCurrentPage(currentPage - 1);
		}
	};

	const handleOnConfirmRefuse = () => {
		if (currentUserRequest) {
			updateUserRequest.mutate({
				id: currentUserRequest?.id as number,
				userRequest: { status: 'refused' },
				message: refusedReason
			});
		}
		onConfirmDeleteModal.close();
		if ((userRequestsCount - 1) % numberPerPage === 0) {
			setCurrentPage(currentPage - 1);
		}
	};

	const handlePageChange = (pageNumber: number) => {
		setCurrentPage(pageNumber);
	};

	const nbPages = getNbPages(userRequestsCount, numberPerPage);

	const getAlertTitle = () => {
		if (currentUserRequest?.type === 'refused') {
			return `La demande d'accès de ${currentUserRequest?.user?.firstName} ${currentUserRequest?.user?.lastName} a été rejetée !`;
		} else {
			return `La demande d'accès de ${currentUserRequest?.user?.firstName} ${currentUserRequest?.user?.lastName} a été acceptée !`;
		}
	};

	return (
		<>
			<Head>
				<title>Demandes d'accès | Je donne mon avis</title>
				<meta
					name="description"
					content={`Demandes d'accès | Je donne mon avis`}
				/>
			</Head>
			<OnConfirmModal
				modal={onConfirmDeleteModal}
				title="Rejeter la demande d'accès"
				handleOnConfirm={() => handleOnConfirmRefuse()}
			>
				<p>
					Voulez-vous vraiment rejeter la demande d'accès de{' '}
					<span className={cx(classes.boldText)}>
						{`${currentUserRequest?.user?.firstName} ${currentUserRequest?.user?.lastName}`}
					</span>{' '}
					?
				</p>
				<Input
					label="Explication du refus (optionnel)"
					textArea
					nativeTextAreaProps={{
						onChange: e => {
							setRefusedReason(e.target.value);
						},
						value: refusedReason,
						name: 'reason'
					}}
				/>
			</OnConfirmModal>
			<OnConfirmModal
				modal={onConfirmAcceptModal}
				title="Accepter la demande d'accès"
				handleOnConfirm={() => handleOnConfirmAccept()}
			>
				<>
					Vous voulez vraiment accepter la demande d'accès de{' '}
					<span className={cx(classes.boldText)}>
						{`${currentUserRequest?.user?.firstName} ${currentUserRequest?.user?.lastName}`}
					</span>{' '}
					?
					<div className={fr.cx('fr-input-group', 'fr-mt-3w')}>
						<Checkbox
							options={[
								{
									label: (
										<>
											Ajouter le domaine
											{` @${extractDomainFromEmail(
												(currentUserRequest?.user?.email as string) || ''
											)} `}
											à la liste blanche des noms de domaines
										</>
									),
									nativeInputProps: {
										name: 'createDomainOnAccept',
										onChange: event => {
											setCreateDomainOnAccept(event.target.checked);
										}
									}
								}
							]}
						/>
					</div>
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
				<div
					className={fr.cx(
						'fr-col-12',
						'fr-mt-4w',
						nbPages > 1 ? 'fr-mb-2w' : 'fr-mb-0',
						'fr-py-0'
					)}
				>
					<Checkbox
						className={fr.cx('fr-mb-0')}
						style={{ userSelect: 'none' }}
						options={[
							{
								label: 'Afficher les demandes traitées',
								nativeInputProps: {
									name: 'display-processed-user-request',
									checked: displayProcessed,
									onChange: e => {
										setDisplayProcessed(e.currentTarget.checked);
										setCurrentPage(1);
									}
								}
							}
						]}
					/>
				</div>
				{currentUserRequest &&
					(currentUserRequest.type === 'refused' ||
						currentUserRequest.type === 'accept') && (
						<div role="status">
							<Alert
								severity={
									currentUserRequest.type === 'accept' ? 'success' : 'info'
								}
								description={getAlertTitle()}
								className={classes.alert}
								onClose={() => setCurrentUserRequest(undefined)}
								closable
								small
							/>
						</div>
					)}
				{isLoadingUserRequests ? (
					<div className={fr.cx('fr-py-20v', 'fr-mt-4w')}>
						<Loader />
					</div>
				) : (
					<div>
						{nbPages > 1 && (
							<div className={fr.cx('fr-col-8', 'fr-pt-3w')}>
								<PageItemsCounter
									label="Demandes d’accès"
									startItemCount={numberPerPage * (currentPage - 1) + 1}
									endItemCount={
										numberPerPage * (currentPage - 1) + userRequests.length
									}
									totalItemsCount={userrequestsResult.metadata.count}
								/>
							</div>
						)}
						<div
							className={cx(
								userRequests.length === 0 ? classes.userrequestsContainer : ''
							)}
						>
							<div className={fr.cx('fr-mt-2v', 'fr-hidden', 'fr-unhidden-md')}>
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
									<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-2')}>
										<span>Date de création</span>
									</div>
									<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-4')}>
										<span>Raison de la demande</span>
									</div>
								</div>
							</div>
							{isRefetchingUserRequests ? (
								<div className={fr.cx('fr-py-20v', 'fr-mt-4w')}>
									<Loader />
								</div>
							) : (
								<ul className={cx(classes.ulContainer)}>
									{userRequests.map((userRequest, index) => (
										<li key={index}>
											<UserRequestCard
												userRequest={userRequest}
												setCurrentUserRequest={handleCurrentUserRequest}
											/>
										</li>
									))}
								</ul>
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
										<p>Aucun demande d'accès trouvée</p>
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
		ulContainer: {
			padding: 0,
			margin: 0,
			listStyle: 'none !important',
			li: {
				paddingBottom: 0
			}
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
