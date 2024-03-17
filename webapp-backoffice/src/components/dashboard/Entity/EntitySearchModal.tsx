import { Pagination } from '@/src/components/ui/Pagination';
import { getNbPages } from '@/src/utils/tools';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { ModalProps } from '@codegouvfr/react-dsfr/Modal';
import Autocomplete from '@mui/material/Autocomplete';
import { Entity } from '@prisma/client';
import { useSession } from 'next-auth/react';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { tss } from 'tss-react/dsfr';
import { Loader } from '../../ui/Loader';
import EntityCard from './EntityCard';

export type AdminEntityRightActionType = 'add' | 'remove' | 'resend-email';

interface CustomModalProps {
	buttonProps: {
		id: string;
		'aria-controls': string;
		'data-fr-opened': boolean;
	};
	Component: (props: ModalProps) => JSX.Element;
	close: () => void;
	open: () => void;
	isOpenedByDefault: boolean;
	id: string;
}

interface Props {
	modal: CustomModalProps;
	onEntitySelected: (entity: Entity) => void;
}

type FormValues = {
	entity: Entity;
};

const EntitySearchModal = (props: Props) => {
	const { modal, onEntitySelected } = props;
	const { data: session } = useSession();

	const [search, setSearch] = React.useState<string>('');
	const [submitedSearch, setSubmitedSearch] = React.useState<string>('');
	const showNoResult = search.length >= 3;

	const [currentPage, setCurrentPage] = React.useState(1);
	const [numberPerPage, _] = React.useState(10);
	const [countEntititesSearch, setCountEntitiesSearch] = React.useState(0);
	const [entitiesSearch, setEntitiesSearch] = React.useState<Entity[]>([]);
	const [hasSubmitedOnce, setsHasSubmitedOnce] = React.useState(false);

	const { cx, classes } = useStyles({ showNoResult });

	const { control } = useForm<FormValues>({
		defaultValues: {}
	});

	const {
		isLoading: isLoadingEntitiesSearch,
		isRefetching: isRefetchingEntitiesSearch,
		refetch: entitiesSearchRefetch
	} = trpc.entity.getList.useQuery(
		{ page: currentPage, numberPerPage, search: search, isMine: false },
		{
			enabled: false,
			initialData: { data: [], metadata: { count: 0, myEntities: [] } },
			onSuccess: entitiesSearchResult => {
				const {
					data: entitiesSearch,
					metadata: { count: entitiesSearchCount }
				} = entitiesSearchResult;

				setEntitiesSearch(entitiesSearch);
				setCountEntitiesSearch(entitiesSearchCount);
			}
		}
	);
	const nbPages = getNbPages(countEntititesSearch, numberPerPage);

	const { data: entitiesResult, isLoading: isLoadingEntities } =
		trpc.entity.getList.useQuery(
			{ numberPerPage: 10000, isMine: false },
			{
				initialData: { data: [], metadata: { count: 0, myEntities: [] } }
			}
		);

	const { data: entities } = entitiesResult;

	const entityOptions = entities.map(entity => ({
		label: `${entity.name} (${entity.acronym})`,
		value: entity
	}));

	const handleModalClose = () => {
		modal.close();
	};

	const onSubmit = () => {
		setsHasSubmitedOnce(true);
		setSubmitedSearch(search);
		entitiesSearchRefetch();
	};

	useEffect(() => {
		if (currentPage && hasSubmitedOnce) entitiesSearchRefetch();
	}, [currentPage]);

	console.log(entitiesSearch);

	const displayModalContent = () => {
		return (
			<>
				<form
					id="search-form"
					onSubmit={e => {
						e.preventDefault();
						onSubmit();
					}}
					className={classes.form}
				>
					<div className={fr.cx('fr-mt-8v')}>
						{!isLoadingEntities && entityOptions.length > 0 && (
							<Controller
								name="entity"
								control={control}
								rules={{ required: 'Ce champ est obligatoire' }}
								render={({ field: { onChange, value, name } }) => (
									<div role="search" className={fr.cx('fr-search-bar')}>
										<Autocomplete
											// disablePortal
											id="entity-select-autocomplete"
											noOptionsText={
												search.length >= 3 ? 'Aucune organisation trouvée' : ''
											}
											sx={{ width: '100%' }}
											disablePortal
											options={showNoResult ? entityOptions : []}
											onChange={(_, optionSelected) => {
												if (optionSelected?.value)
													onEntitySelected(optionSelected.value);
											}}
											isOptionEqualToValue={option => option.value === value}
											defaultValue={entityOptions.find(
												option => option.value === value
											)}
											renderInput={params => (
												<div
													ref={params.InputProps.ref}
													className={fr.cx('fr-input-group')}
												>
													<input
														{...params.inputProps}
														className={cx(
															params.inputProps.className,
															fr.cx('fr-input')
														)}
														placeholder="Rechercher une organisation"
														type="search"
														value={search}
														onChange={e => {
															if (params.inputProps.onChange)
																params.inputProps.onChange(e);
															setSearch(e.target.value);
														}}
													/>
												</div>
											)}
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
								)}
							/>
						)}
					</div>
				</form>
				{isLoadingEntitiesSearch ? (
					<div className={fr.cx('fr-py-20v', 'fr-mt-4w')}>
						<Loader />
					</div>
				) : (
					<div className={fr.cx('fr-mt-10v')}>
						{hasSubmitedOnce && (
							<h6>Résultats de la recherche « {submitedSearch} »</h6>
						)}
						<div className={fr.cx('fr-col-8', 'fr-pt-2v')}>
							{nbPages > 1 && (
								<span className={fr.cx('fr-ml-0')}>
									Organisation de{' '}
									<span className={cx(classes.boldText)}>
										{numberPerPage * (currentPage - 1) + 1}
									</span>{' '}
									à{' '}
									<span className={cx(classes.boldText)}>
										{numberPerPage * (currentPage - 1) + entitiesSearch.length}
									</span>{' '}
									sur{' '}
									<span className={cx(classes.boldText)}>
										{countEntititesSearch}
									</span>
								</span>
							)}
						</div>
						<div>
							{isRefetchingEntitiesSearch ? (
								<div className={fr.cx('fr-py-20v', 'fr-mt-4w')}>
									<Loader />
								</div>
							) : (
								entitiesSearch.map((entity, index) => (
									<EntityCard
										fromSearch
										entity={entity}
										key={index}
										isMine={false}
										onButtonClick={() => onEntitySelected(entity)}
									/>
								))
							)}
							{!isRefetchingEntitiesSearch &&
								entitiesSearch.length === 0 &&
								hasSubmitedOnce && (
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
						<div className={fr.cx('fr-grid-row--center', 'fr-grid-row')}>
							{nbPages > 1 && (
								<Pagination
									showFirstLast
									count={nbPages}
									defaultPage={currentPage}
									getPageLinkProps={pageNumber => ({
										onClick: event => {
											event.preventDefault();
											setCurrentPage(pageNumber);
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
			</>
		);
	};

	return (
		<modal.Component
			title={'Devenir administrateur'}
			concealingBackdrop={false}
			size="large"
			className={fr.cx(
				'fr-grid-row',
				'fr-grid-row--center',
				'fr-grid-row--gutters',
				'fr-my-0'
			)}
		>
			{displayModalContent()}
		</modal.Component>
	);
};

const useStyles = tss
	.withName(EntitySearchModal.name)
	.withParams<{ showNoResult: boolean }>()
	.create(({ showNoResult }) => ({
		form: {
			'.base-Popper-root': {
				display: showNoResult ? 'inherit' : 'none',
				zIndex: 9999
			}
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
		}
	}));

export default EntitySearchModal;
