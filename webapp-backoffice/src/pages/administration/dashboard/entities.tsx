import EntityCard from '@/src/components/dashboard/Entity/EntityCard';
import { Loader } from '@/src/components/ui/Loader';
import { Pagination } from '@/src/components/ui/Pagination';
import OnConfirmModal from '@/src/components/ui/modal/OnConfirm';
import { EntityWithUsersAndProducts } from '@/src/types/prismaTypesExtended';
import { getNbPages } from '@/src/utils/tools';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import { Button } from '@codegouvfr/react-dsfr/Button';
import Input from '@codegouvfr/react-dsfr/Input';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import { Select } from '@codegouvfr/react-dsfr/Select';
import { Entity } from '@prisma/client';
import { useSession } from 'next-auth/react';
import React from 'react';
import { tss } from 'tss-react/dsfr';

export type OnButtonClickEntityParams =
	| { type: 'create'; entity?: EntityWithUsersAndProducts }
	| { type: 'delete'; entity: EntityWithUsersAndProducts };

const onConfirmModal = createModal({
	id: 'entity-on-confirm-modal',
	isOpenedByDefault: false
});

const DashBoardEntities = () => {
	const { data: session, update: updateSession } = useSession();

	const [search, setSearch] = React.useState<string>('');
	const [validatedSearch, setValidatedSearch] = React.useState<string>('');

	const [currentPage, setCurrentPage] = React.useState(1);
	const [numberPerPage, _] = React.useState(10);

	const [currentEntity, setCurrentEntity] =
		React.useState<EntityWithUsersAndProducts>();

	const { cx, classes } = useStyles();

	const {
		data: entitiesResult,
		isLoading: isLoadingEntities,
		refetch: refetchEntities,
		isRefetching: isRefetchingEntities
	} = trpc.entity.getList.useQuery(
		{
			search: validatedSearch,
			page: currentPage,
			numberPerPage,
			mine: true
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
		data: entities,
		metadata: { count: entitiesCount }
	} = entitiesResult;

	console.log(session);
	const editUser = trpc.user.update.useMutation({
		onSuccess: response => {
			console.log(response);
			updateSession().then(s => {
				console.log(s);
				console.log(session);
				refetchEntities();
			});
		}
	});

	const handlePageChange = (pageNumber: number) => {
		setCurrentPage(pageNumber);
	};

	const nbPages = getNbPages(entitiesCount, numberPerPage);

	const handleModalOpening = async ({
		type,
		entity
	}: OnButtonClickEntityParams) => {
		setCurrentEntity(entity);
		if (type === 'delete') {
			onConfirmModal.open();
		}
	};

	return (
		<>
			<OnConfirmModal
				modal={onConfirmModal}
				title="Se retirer d'une organisation"
				handleOnConfirm={() => {
					editUser.mutate({
						id: session?.user?.id || 0,
						user: {
							entities: {
								disconnect: { id: currentEntity?.id }
							}
						}
					});
					onConfirmModal.close();
				}}
			>
				<>
					Êtes vous sûr de vouloir vous retirer de l'organisation{' '}
					<span className={classes.boldText}>{currentEntity?.name}</span> ?
				</>
			</OnConfirmModal>
			<div className={fr.cx('fr-container', 'fr-py-6w')}>
				<div
					className={fr.cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-mb-3w')}
				>
					<div className={fr.cx('fr-col-12', 'fr-col-md-5')}>
						<h1 className={fr.cx('fr-mb-0')}>Organisations</h1>
					</div>
				</div>
				<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
					<div className={fr.cx('fr-col-12', 'fr-col-md-5', 'fr-col--bottom')}>
						<form
							className={cx(classes.searchForm)}
							onSubmit={e => {
								e.preventDefault();
								setValidatedSearch(search);
							}}
						>
							<div role="search" className={fr.cx('fr-search-bar')}>
								<Input
									label="Rechercher une organisation"
									hideLabel
									nativeInputProps={{
										placeholder: 'Rechercher une organisation',
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
				{isLoadingEntities ? (
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
										{numberPerPage * (currentPage - 1) + entities.length}
									</span>{' '}
									de{' '}
									<span className={cx(classes.boldText)}>
										{entitiesResult.metadata.count}
									</span>
								</span>
							)}
						</div>
						<div
							className={cx(
								entities.length === 0 ? classes.entitiesContainer : ''
							)}
						>
							<div className={fr.cx('fr-mt-2v')}>
								<div
									className={cx(
										fr.cx(
											'fr-grid-row',
											'fr-grid-row--gutters',
											'fr-grid-row--middle'
										)
									)}
								>
									<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-5')}>
										<span>Nom de l'organisation</span>
									</div>
									<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-2')}>
										<span>No. de référents</span>
									</div>
									<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-2')}>
										<span>No. produits rattachés</span>
									</div>
								</div>
							</div>
							{isRefetchingEntities ? (
								<div className={fr.cx('fr-py-20v', 'fr-mt-4w')}>
									<Loader />
								</div>
							) : (
								entities.map((entity, index) => (
									<EntityCard
										entity={entity}
										key={index}
										onButtonClick={handleModalOpening}
									/>
								))
							)}
							{!isRefetchingEntities && entities.length === 0 && (
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
										key: `pagination-link-entity-${pageNumber}`
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

const useStyles = tss.withName(DashBoardEntities.name).create(() => ({
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
	entitiesContainer: {
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

export default DashBoardEntities;
