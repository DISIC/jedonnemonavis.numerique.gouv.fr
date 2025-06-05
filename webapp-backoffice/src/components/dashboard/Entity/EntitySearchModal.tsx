import { Pagination } from '@/src/components/ui/Pagination';
import { getLastPage, getNbPages, removeAccents } from '@/src/utils/tools';
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
import Alert from '@codegouvfr/react-dsfr/Alert';
import Link from 'next/link';
import { push } from '@socialgouv/matomo-next';
import { CustomModalProps } from '@/src/types/custom';

export type AdminEntityRightActionType = 'add' | 'remove' | 'resend-email';


interface Props {
	modal: CustomModalProps;
	onEntitySelected: (entity: Entity) => void;
	onCreate: () => void;
}

type FormValues = {
	entity: Entity;
};

const EntitySearchModal = (props: Props) => {
	const { modal, onEntitySelected, onCreate } = props;
	const { data: session } = useSession();
	const { cx, classes } = useStyles();

	const [search, setSearch] = React.useState<string>('');
	const [submitedSearch, setSubmitedSearch] = React.useState<string>('');
	const [isSearchFocused, setIsSearchFocused] = React.useState(false);

	const [currentPage, setCurrentPage] = React.useState(1);
	const [numberPerPage, _] = React.useState(5);
	const [countEntititesSearch, setCountEntitiesSearch] = React.useState(0);
	const [entitiesSearch, setEntitiesSearch] = React.useState<Entity[]>([]);
	const [hasSubmitedOnce, setsHasSubmitedOnce] = React.useState(false);

	const showNoResult = search.length >= 3 && !hasSubmitedOnce;

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
	const lastPage = getLastPage(countEntititesSearch, numberPerPage);

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

	const onSubmit = () => {
		setCurrentPage(1);
		setsHasSubmitedOnce(true);
		setSubmitedSearch(search);
		entitiesSearchRefetch();
		push(['trackEvent', 'BO - Entities', `Search`]);
	};

	useEffect(() => {
		if (search === '') setsHasSubmitedOnce(false);
	}, [search]);

	useEffect(() => {
		if (currentPage && hasSubmitedOnce) entitiesSearchRefetch();
	}, [currentPage]);

	const notFound =
		!isRefetchingEntitiesSearch &&
		entitiesSearch.length === 0 &&
		hasSubmitedOnce;

	const displayModalContent = () => {
		// AVOID BUG ON AUTOCOMPLETE WHEN REFOCUS FIELD WITH SEARCH TEXT
		const filteredOptions = entityOptions.filter(eo =>
			new RegExp(removeAccents(search), 'i').test(removeAccents(eo.label))
		);
		return (
			<>
				<p>
					Les administrateurs ont accès à toutes les démarches de leur
					organisation.
				</p>
				<p>Pour devenir administrateur, rechercher l’organisation.</p>
				<form
					id="search-form"
					onSubmit={e => {
						e.preventDefault();
						onSubmit();
					}}
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
												search.length >= 3
													? 'Aucune organisation trouvée'
													: 'Écrivez au moins 3 caractères'
											}
											sx={{ width: '100%' }}
											options={showNoResult ? filteredOptions : []}
											open={showNoResult && isSearchFocused}
											onFocus={() => {
												setIsSearchFocused(true);
											}}
											onBlur={() => {
												setIsSearchFocused(false);
											}}
											onChange={(_, optionSelected) => {
												if (optionSelected?.value)
													onEntitySelected(optionSelected.value);
											}}
											isOptionEqualToValue={option => option.value === value}
											defaultValue={entityOptions.find(
												option => option.value === value
											)}
											componentsProps={{
												popper: {
													modifiers: [
														{
															name: 'flip',
															enabled: false
														},
														{
															name: 'preventOverflow',
															enabled: false
														}
													]
												}
											}}
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
					hasSubmitedOnce && (
						<div className={fr.cx('fr-mt-10v')}>
							<h6>
								{notFound
									? `Pas de résultats pour la recherche « ${submitedSearch} »`
									: `Résultats de la recherche « ${submitedSearch} »`}
							</h6>
							<div className={fr.cx('fr-col-8', 'fr-pt-2v')}>
								<span aria-live="assertive" className={fr.cx('fr-ml-0')}>
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
								{(lastPage === currentPage || notFound) && (
									<div role="status">
										<Alert
											className={fr.cx('fr-mb-4v')}
											description={
												<>
													Vous ne trouvez pas l'oganisation ?
													<Link
														className={fr.cx('fr-link', 'fr-ml-2v')}
														onClick={() => {
															onCreate();
														}}
														href="#"
													>
														Créer une organisation.
													</Link>
												</>
											}
											severity="info"
											title=""
										/>
									</div>
								)}
							</div>
							<div className={fr.cx('fr-grid-row--center', 'fr-grid-row')}>
								{nbPages > 1 && (
									<Pagination
										showFirstLast
										count={nbPages}
										maxVisiblePages={4}
										slicesSize={2}
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
					)
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

const useStyles = tss.withName(EntitySearchModal.name).create(() => ({
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
