import DomainCard from '@/src/components/dashboard/Domain/DomainCard';
import { Loader } from '@/src/components/ui/Loader';
import { Pagination } from '@/src/components/ui/Pagination';
import OnConfirmModal from '@/src/components/ui/modal/OnConfirm';
import { getNbPages } from '@/src/utils/tools';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Alert from '@codegouvfr/react-dsfr/Alert';
import { Button } from '@codegouvfr/react-dsfr/Button';
import Input from '@codegouvfr/react-dsfr/Input';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import Select from '@codegouvfr/react-dsfr/Select';
import { WhiteListedDomain } from '@prisma/client';
import React from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { tss } from 'tss-react/dsfr';

type FormValues = {
	domain: string;
};

const onConfirmModal = createModal({
	id: 'domain-on-confirm-modal',
	isOpenedByDefault: false
});

const DashBoardDomainDomains = () => {
	const utils = trpc.useContext();

	const [filter, setFilter] = React.useState<string>('domain:asc');
	const [search, setSearch] = React.useState<string>('');
	const [validatedSearch, setValidatedSearch] = React.useState<string>('');

	const [currentDomain, setCurrentDomain] = React.useState<
		WhiteListedDomain & { type: 'create' | 'on-confirm' | 'delete' }
	>();

	const [currentPage, setCurrentPage] = React.useState(1);
	const [numberPerPage, _] = React.useState(10);

	const { cx, classes } = useStyles();

	const handleCurrentDomain = (
		domain: WhiteListedDomain & { type: 'create' | 'on-confirm' | 'delete' }
	) => {
		setCurrentDomain(domain);
		if (domain.type === 'on-confirm') {
			onConfirmModal.open();
		}
	};

	const createDomain = trpc.domain.create.useMutation({
		onSuccess: result => {
			refectDomains();
			reset({ domain: '' });
			setCurrentDomain({ ...result.data, type: 'create' });
		},
		onError: error => {
			if (error.data?.httpStatus == 409) {
				setError('domain', {
					type: 'Conflict domain',
					message: 'Ce domaine est déjà existant'
				});
			}
		}
	});

	const deleteDomain = trpc.domain.delete.useMutation({
		onSuccess: result => {
			utils.domain.getList.invalidate();
			setCurrentDomain({ ...result.data, type: 'delete' });
		}
	});

	const {
		control,
		reset,
		handleSubmit,
		setError,
		formState: { errors }
	} = useForm<FormValues>();

	const onSubmit: SubmitHandler<FormValues> = data => {
		data.domain = data.domain.replace('@', '');
		createDomain.mutate(data);
	};

	const {
		data: domainsResult,
		isLoading: isLoadingDomains,
		refetch: refectDomains,
		isRefetching: isRefetchingDomains
	} = trpc.domain.getList.useQuery(
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
		data: domains,
		metadata: { count: domainsCount }
	} = domainsResult;

	const handlePageChange = (pageNumber: number) => {
		setCurrentPage(pageNumber);
	};

	const nbPages = getNbPages(domainsCount, numberPerPage);

	const getAlertTitle = () => {
		if (currentDomain?.type === 'delete') {
			return `@${currentDomain?.domain} retiré de la liste !`;
		} else {
			return `@${currentDomain?.domain} ajouté sur la liste !`;
		}
	};

	return (
		<>
			<OnConfirmModal
				modal={onConfirmModal}
				title="Supprimer un nom de domaine"
				handleOnConfirm={() => {
					deleteDomain.mutate({ id: currentDomain?.id as number });
					onConfirmModal.close();
				}}
			>
				<div>
					<p>
						Vous êtes sûr de vouloir supprimer le nom de domaine{' '}
						<span className={classes.boldText}>@{currentDomain?.domain}</span> ?
					</p>
				</div>
			</OnConfirmModal>
			<div className={fr.cx('fr-container', 'fr-py-6w')}>
				<div
					className={fr.cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-mb-3w')}
				>
					<div className={fr.cx('fr-col-12', 'fr-col-md-12')}>
						<h1 className={fr.cx('fr-mb-0')}>
							Liste blanche des noms de domaines
						</h1>
					</div>
				</div>
				<div
					className={fr.cx(
						'fr-grid-row',
						'fr-grid-row--gutters',
						'fr-grid-row--top'
					)}
				>
					<div className={fr.cx('fr-col-12', 'fr-col-md-5')}>
						<form className={classes.formAdd} onSubmit={handleSubmit(onSubmit)}>
							<Controller
								control={control}
								name="domain"
								render={({ field: { onChange, value } }) => (
									<Input
										label="Ajouter un nom de domaine"
										style={{ width: '100%' }}
										state={errors.domain ? 'error' : 'default'}
										stateRelatedMessage={errors.domain?.message}
										nativeInputProps={{
											onChange,
											value
										}}
									/>
								)}
							/>
							<Button
								priority="primary"
								type="submit"
								className={cx(classes.buttonAdd, classes.labelHeight)}
							>
								Ajouter
							</Button>
						</form>
					</div>
					<div className={fr.cx('fr-col-12', 'fr-col-md-3')}>
						<Select
							label="Trier Par"
							nativeSelectProps={{
								name: 'my-select',
								onChange: event => setFilter(event.target.value)
							}}
						>
							<option value="domain:asc">Nom A à Z</option>
							<option value="created_at:desc">Date de création</option>
							<option value="updated_at:desc">Date de mise à jour</option>
						</Select>
					</div>
					<div className={fr.cx('fr-col-12', 'fr-col-md-4')}>
						<form
							className={cx(classes.searchForm)}
							onSubmit={e => {
								e.preventDefault();
								setValidatedSearch(search);
							}}
						>
							<div
								role="search"
								className={cx(fr.cx('fr-search-bar'), classes.labelHeight)}
							>
								<Input
									label="Rechercher un nom de domaine"
									hideLabel
									nativeInputProps={{
										placeholder: 'Rechercher un nom de domaine',
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
									Rechercher un domaine
								</Button>
							</div>
						</form>
					</div>
				</div>
				{currentDomain && currentDomain.type !== 'on-confirm' && (
					<Alert
						severity={currentDomain.type === 'create' ? 'success' : 'info'}
						description={getAlertTitle()}
						className={classes.alert}
						onClose={() => setCurrentDomain(undefined)}
						closable
						small
					/>
				)}
				{isLoadingDomains ? (
					<div className={fr.cx('fr-py-20v', 'fr-mt-4w')}>
						<Loader />
					</div>
				) : (
					<div>
						<div className={fr.cx('fr-col-8', 'fr-pt-3w')}>
							{nbPages > 1 && (
								<span className={fr.cx('fr-ml-0')}>
									Domaines de{' '}
									<span className={cx(classes.boldText)}>
										{numberPerPage * (currentPage - 1) + 1}
									</span>{' '}
									à{' '}
									<span className={cx(classes.boldText)}>
										{numberPerPage * (currentPage - 1) + domains.length}
									</span>{' '}
									de{' '}
									<span className={cx(classes.boldText)}>
										{domainsResult.metadata.count}
									</span>
								</span>
							)}
						</div>
						<div
							className={cx(
								domains.length === 0 ? classes.domainsContainer : ''
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
									<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-3')}>
										<span>Nom de domaine</span>
									</div>
								</div>
							</div>
							{isRefetchingDomains ? (
								<div className={fr.cx('fr-py-20v', 'fr-mt-4w')}>
									<Loader />
								</div>
							) : (
								domains.map((domain, index) => (
									<DomainCard
										key={index}
										domain={domain}
										setCurrentDomain={handleCurrentDomain}
									/>
								))
							)}
							{domains.length === 0 && !isRefetchingDomains && (
								<div className={fr.cx('fr-grid-row', 'fr-grid-row--center')}>
									<div
										className={cx(
											fr.cx('fr-col-12', 'fr-col-md-5', 'fr-mt-30v'),
											classes.textContainer
										)}
										role="status"
									>
										<p>Aucun domaine trouvé</p>
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
										key: `pagination-link-domain-${pageNumber}`
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

const useStyles = tss.withName(DashBoardDomainDomains.name).create(() => ({
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
	domainsContainer: {
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

export default DashBoardDomainDomains;
