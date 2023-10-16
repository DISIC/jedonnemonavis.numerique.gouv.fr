import WhitelistCard from '@/src/components/dashboard/Whitelist/WhitelistCard';
import { Loader } from '@/src/components/ui/Loader';
import { Pagination } from '@/src/components/ui/Pagination';
import { getNbPages } from '@/src/utils/tools';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import { Button } from '@codegouvfr/react-dsfr/Button';
import Input from '@codegouvfr/react-dsfr/Input';
import SearchBar from '@codegouvfr/react-dsfr/SearchBar';
import Select from '@codegouvfr/react-dsfr/Select';
import React from 'react';
import { tss } from 'tss-react/dsfr';

const DashBoardWhitelistWhitelists = () => {
	const [filter, setFilter] = React.useState<string>('domain:asc');
	const [search, setSearch] = React.useState<string>('');
	const [validatedSearch, setValidatedSearch] = React.useState<string>('');

	const [currentPage, setCurrentPage] = React.useState(1);
	const [numberPerPage, _] = React.useState(10);

	const { cx, classes } = useStyles();

	const {
		data: whitelistsResult,
		isLoading: isLoadingWhitelists,
		isRefetching: isRefetchingWhitelists
	} = trpc.whitelist.getList.useQuery(
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
		data: whitelists,
		metadata: { count: whitelistsCount }
	} = whitelistsResult;

	const handlePageChange = (pageNumber: number) => {
		setCurrentPage(pageNumber);
	};

	const nbPages = getNbPages(whitelistsCount, numberPerPage);

	return (
		<>
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
				<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
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
									label="Rechercher un nom de whiteliste"
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
				{isLoadingWhitelists ? (
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
										{numberPerPage * (currentPage - 1) + whitelists.length}
									</span>{' '}
									de{' '}
									<span className={cx(classes.boldText)}>
										{whitelistsResult.metadata.count}
									</span>
								</span>
							)}
						</div>
						<div
							className={cx(
								whitelists.length === 0 ? classes.whitelistsContainer : ''
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
										<span>Nom de domaine</span>
									</div>
								</div>
							</div>
							{isRefetchingWhitelists ? (
								<div className={fr.cx('fr-py-20v', 'fr-mt-4w')}>
									<Loader />
								</div>
							) : (
								whitelists.map((whitelist, index) => (
									<WhitelistCard whitelist={whitelist} key={index} />
								))
							)}
							{whitelists.length === 0 && !isRefetchingWhitelists && (
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
										key: `pagination-link-whitelist-${pageNumber}`
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
	.withName(DashBoardWhitelistWhitelists.name)
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
		whitelistsContainer: {
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

export default DashBoardWhitelistWhitelists;
