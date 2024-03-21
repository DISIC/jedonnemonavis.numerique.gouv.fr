import EntityCard from '@/src/components/dashboard/Entity/EntityCard';
import EntityModal from '@/src/components/dashboard/Entity/EntityModal';
import EntityRightsModal from '@/src/components/dashboard/Entity/EntityRightsModal';
import EntitySearchModal from '@/src/components/dashboard/Entity/EntitySearchModal';
import { Loader } from '@/src/components/ui/Loader';
import { Pagination } from '@/src/components/ui/Pagination';
import { getNbPages } from '@/src/utils/tools';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import { Button } from '@codegouvfr/react-dsfr/Button';
import Input from '@codegouvfr/react-dsfr/Input';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { Select } from '@codegouvfr/react-dsfr/Select';
import { Entity } from '@prisma/client';
import { useSession } from 'next-auth/react';
import React, { useEffect } from 'react';
import { tss } from 'tss-react/dsfr';

export type OnButtonClickEntityParams =
	| { type: 'rights'; entity?: Entity }
	| { type: 'edit'; entity: Entity };

const entityRightsModal = createModal({
	id: 'entity-rights-modal',
	isOpenedByDefault: false
});

const entityModal = createModal({
	id: 'entity-modal',
	isOpenedByDefault: false
});

const entitySearchModal = createModal({
	id: 'entity-search-modal',
	isOpenedByDefault: false
});

const DashBoardEntities = () => {
	const { cx, classes } = useStyles();
	const { data: session } = useSession({ required: true });

	const [filter, setFilter] = React.useState<string>('name:asc');
	const [search, setSearch] = React.useState<string>('');
	const [validatedSearch, setValidatedSearch] = React.useState<string>('');
	const [fromSearch, setFromSearch] = React.useState<boolean>(false);

	const [currentPage, setCurrentPage] = React.useState(1);
	const [numberPerPage, _] = React.useState(10);

	const [currentEntity, setCurrentEntity] = React.useState<Entity>();
	const [isMine, setIsMine] = React.useState<boolean>(true);

	const {
		data: entitiesResult,
		isLoading: isLoadingEntities,
		refetch: refetchEntities,
		isRefetching: isRefetchingEntities
	} = trpc.entity.getList.useQuery(
		{
			search: validatedSearch,
			sort: filter,
			page: currentPage,
			isMine: isMine ? isMine : undefined,
			numberPerPage
		},
		{
			initialData: {
				data: [],
				metadata: {
					count: 0,
					myEntities: []
				}
			}
		}
	);

	const {
		data: entities,
		metadata: { count: entitiesCount, myEntities }
	} = entitiesResult;

	const nbPages = getNbPages(entitiesCount, numberPerPage);

	const deleteEntity = trpc.entity.delete.useMutation({
		onSuccess: () => refetchEntities()
	});

	const handlePageChange = (pageNumber: number) => {
		setCurrentPage(pageNumber);
	};

	const handleModalEntityRightsOpening = async ({
		type,
		entity
	}: OnButtonClickEntityParams) => {
		setFromSearch(false);
		setCurrentEntity(entity);
		// avoid flick switching entity
		setTimeout(() => {
			if (type === 'rights') {
				entityRightsModal.open();
			} else if (type === 'edit') {
				entityModal.open();
			}
		}, 100);
	};

	const onEntitySelected = (entity: Entity) => {
		setFromSearch(true);
		entitySearchModal.close();
		setCurrentEntity(entity);
		// avoid flick switching entity
		setTimeout(() => {
			entityRightsModal.open();
		}, 100);
	};

	const onCreateEntity = () => {
		setCurrentEntity(undefined);
		setTimeout(() => {
			entityModal.open();
		}, 100);
	};

	useEffect(() => {
		if (session?.user.role === 'admin') setIsMine(false);
	}, [session?.user.role]);

	useEffect(() => {
		setSearch('');
		setValidatedSearch('');
	}, [isMine]);

	if (!session) return;

	return (
		<>
			{!!entities.length && (
				<EntityRightsModal
					modal={entityRightsModal}
					entity={currentEntity || entities[0]}
					refetchEntities={refetchEntities}
					onClose={() => {
						if (fromSearch) entitySearchModal.open();
					}}
				/>
			)}
			<EntityModal
				modal={entityModal}
				entity={currentEntity}
				onSubmit={refetchEntities}
			/>
			<EntitySearchModal
				modal={entitySearchModal}
				onEntitySelected={onEntitySelected}
				onCreate={onCreateEntity}
			/>
			<div className={fr.cx('fr-container', 'fr-py-6w')}>
				<div
					className={fr.cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-mb-3w')}
				>
					<div className={fr.cx('fr-col-12', 'fr-col-md-5')}>
						<h1 className={fr.cx('fr-mb-0')}>Organisations</h1>
					</div>
					<div
						className={cx(
							fr.cx('fr-col-12', 'fr-col-md-7'),
							classes.buttonContainer
						)}
					>
						{session.user.role !== 'admin' ? (
							<Button
								priority="secondary"
								iconId="fr-icon-admin-line"
								iconPosition="right"
								type="button"
								onClick={() => {
									entitySearchModal.open();
								}}
							>
								Devenir administrateur
							</Button>
						) : (
							<Button
								priority="secondary"
								iconId="fr-icon-add-circle-line"
								iconPosition="right"
								type="button"
								onClick={onCreateEntity}
							>
								Créer une organisation
							</Button>
						)}
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
							<option value="name:asc">Nom A à Z</option>
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
									label="Rechercher"
									hideLabel
									nativeInputProps={{
										placeholder: 'Rechercher',
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
					{session.user.role !== 'admin' && (
						<div
							className={fr.cx(
								'fr-col-12',
								'fr-col-md-5',
								'fr-col--bottom',
								'fr-mt-2v'
							)}
						>
							<Button
								priority={isMine ? 'primary' : 'secondary'}
								size="large"
								onClick={() => {
									setIsMine(true);
									setCurrentPage(1);
								}}
							>
								Mes organisations
							</Button>
							<Button
								priority={isMine ? 'secondary' : 'primary'}
								size="large"
								onClick={() => {
									setIsMine(false);
									setCurrentPage(1);
								}}
							>
								Toutes les organisations
							</Button>
						</div>
					)}
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
									Organisation de{' '}
									<span className={cx(classes.boldText)}>
										{numberPerPage * (currentPage - 1) + 1}
									</span>{' '}
									à{' '}
									<span className={cx(classes.boldText)}>
										{numberPerPage * (currentPage - 1) + entities.length}
									</span>{' '}
									sur{' '}
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
							{isRefetchingEntities ? (
								<div className={fr.cx('fr-py-20v', 'fr-mt-4w')}>
									<Loader />
								</div>
							) : (
								entities.map((entity, index) => (
									<EntityCard
										entity={entity}
										key={index}
										onButtonClick={handleModalEntityRightsOpening}
										isMine={
											session.user.role === 'admin' ||
											myEntities
												.map(myEntity => myEntity.id)
												.includes(entity.id)
										}
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
										<p>Aucune organisation trouvée</p>
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
	boldText: {
		fontWeight: 'bold'
	},
	searchForm: {
		'.fr-search-bar': {
			'.fr-input-group': {
				width: '100%',
				marginBottom: 0
			}
		}
	}
}));

export default DashBoardEntities;
