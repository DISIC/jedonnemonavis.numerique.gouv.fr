import ProductButtonCard from '@/src/components/dashboard/ProductButton/ProductButtonCard';
import ProductLayout from '@/src/layouts/Product/ProductLayout';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { Button as PrismaButtonType, Product } from '@prisma/client';
import { tss } from 'tss-react/dsfr';
import { getServerSideProps } from '.';
import { Pagination } from '../../../../../components/ui/Pagination';

import ButtonModal from '@/src/components/dashboard/ProductButton/ButtonModal';
import { Loader } from '@/src/components/ui/Loader';
import { getNbPages } from '@/src/utils/tools';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import React, { useEffect } from 'react';
import { trpc } from '@/src/utils/trpc';
import Head from 'next/head';
import NoButtonsPanel from '@/src/components/dashboard/Pannels/NoButtonsPanel';
import { useRouter } from 'next/router';
import ProductBottomInfo from '@/src/components/dashboard/ProductButton/ProductBottomInfo';
import { useFilters } from '@/src/contexts/FiltersContext';
import Select from '@codegouvfr/react-dsfr/Select';
import { push } from '@socialgouv/matomo-next';

interface Props {
	product: Product;
}

const modal = createModal({
	id: 'button-modal',
	isOpenedByDefault: false
});

const ProductButtonsPage = (props: Props) => {
	const { product } = props;

	const [currentPage, setCurrentPage] = React.useState(1);
	const [numberPerPage, setNumberPerPage] = React.useState(10);
	const [modalType, setModalType] = React.useState<string>('');

	const [currentButton, setCurrentButton] =
		React.useState<PrismaButtonType | null>(null);
	const router = useRouter();

	const [testFilter, setTestFilter] = React.useState<boolean>(false);

	const { filters, updateFilters } = useFilters();
	const { cx, classes } = useStyles();

	const {
		data: buttonsResult,
		isLoading: isLoadingButtons,
		isRefetching: isRefetchingButtons,
		refetch: refetchButtons
	} = trpc.button.getList.useQuery(
		{
			numberPerPage,
			page: currentPage,
			product_id: product.id,
			isTest: testFilter,
			filterByTitle: filters.filter
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
		data: buttons,
		metadata: { count: buttonsCount }
	} = buttonsResult;

	const { data: reviewsCount } = trpc.review.getCounts.useQuery({
		product_id: product.id
	});

	const handlePageChange = (pageNumber: number) => {
		setCurrentPage(pageNumber);
	};

	const isModalOpen = useIsModalOpen(modal);

	const handleModalOpening = (modalType: string, button?: PrismaButtonType) => {
		setCurrentButton(button ? button : null);
		setModalType(modalType);
		modal.open();
	};

	const onButtonCreatedOrUpdated = (isTest: boolean) => {
		if (isTest) setTestFilter(true);
		refetchButtons();
		modal.close();
	};

	const nbPages = getNbPages(buttonsCount, numberPerPage);

	const displayFilters = nbPages > 1 || buttons.length > 0;

	React.useEffect(() => {
		if (router.query.autoCreate === 'true') {
			setTimeout(() => {
				handleModalOpening('create');
			}, 100);
		}
	}, [router.query]);

	return (
		<ProductLayout product={product}>
			<Head>
				<title>{product.title} | Gérer les boutons | Je donne mon avis</title>
				<meta
					name="description"
					content={`${product.title} | Gérer les boutons | Je donne mon avis`}
				/>
			</Head>
			<ButtonModal
				product_id={product.id}
				modal={modal}
				isOpen={isModalOpen}
				modalType={modalType}
				button={currentButton}
				onButtonCreatedOrUpdated={onButtonCreatedOrUpdated}
			/>
			<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
				<div className={fr.cx('fr-col-8')}>
					<h2 className={fr.cx('fr-mb-2w')}>Gérer les boutons</h2>
				</div>
				{buttons.length > 0 && (
					<div className={cx(fr.cx('fr-col-4'), classes.buttonRight)}>
						<Button
							priority="secondary"
							iconPosition="right"
							iconId="ri-add-box-line"
							onClick={() => {
								handleModalOpening('create');
								push(['trackEvent', 'Product', 'Modal-Create-button']);
							}}
						>
							Créer un bouton
						</Button>
					</div>
				)}
			</div>
			{buttonsCount > 0 && (
				<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
					<div className={fr.cx('fr-col-12')}>
						<p>
							Le bouton JDMA se place sur votre service numérique pour récolter
							l’avis de vos usagers.
						</p>
						<p>
							Vous pouvez{' '}
							<a
								href={`${process.env.NEXT_PUBLIC_FORM_APP_URL}/Demarches/${buttons[0]?.product_id}?button=${buttons[0]?.id}&iframe=true`}
								target="_blank"
							>
								prévisualiser le formulaire JDMA
							</a>
							. Les avis que vous déposerez ne seront pas pris en compte dans
							les statistiques.
						</p>
					</div>
				</div>
			)}
			<div
				className={fr.cx(
					'fr-grid-row',
					'fr-grid-row--gutters',
					'fr-grid-row--left'
				)}
			>
				{buttons && nbPages > 1 && (
					<div className={fr.cx('fr-col-8')}>
						<p className={fr.cx('fr-mb-0')}>
							Boutons de{' '}
							<span className={cx(classes.boldText)}>
								{numberPerPage * (currentPage - 1) + 1}
							</span>{' '}
							à{' '}
							<span className={cx(classes.boldText)}>
								{numberPerPage * (currentPage - 1) + buttons.length}
							</span>{' '}
							sur <span className={cx(classes.boldText)}>{buttonsCount}</span>
						</p>
					</div>
				)}
				{/* {buttons.length > 0 && (
					<div className={cx(fr.cx('fr-col-4'), classes.buttonRight)}>
						<Checkbox
							style={{ userSelect: 'none' }}
							options={[
								{
									label: 'Afficher les boutons de test',
									nativeInputProps: {
										name: 'test-buttons',
										checked: testFilter,
										onChange: e => {
											setTestFilter(e.currentTarget.checked);
											setCurrentPage(1);
										}
									}
								}
							]}
						/>
					</div>
				)} */}
				{/* <div className={fr.cx('fr-col-4')}>
					<Checkbox
						options={[
							{
								label: 'Afficher les boutons archivés',
								nativeInputProps: {
									name: 'archived-buttons',
									value: 'archived'
								}
							}
						]}
					/>
				</div> */}
			</div>

			<div>
				{isLoadingButtons ? (
					<div className={fr.cx('fr-py-10v')}>
						<Loader />
					</div>
				) : (
					<>
						<div className={cx(classes.btnContainer)}>
							{!buttons.length && !isRefetchingButtons && (
								<NoButtonsPanel
									onButtonClick={() => handleModalOpening('create')}
								/>
							)}
						</div>
						{buttons.length > 0 && (
							<div
								aria-live="assertive"
								className={fr.cx('fr-col-12', 'fr-pb-1w')}
							>
								Boutons de{' '}
								<span className={cx(classes.boldText)}>
									{numberPerPage * (currentPage - 1) + 1}
								</span>{' '}
								à{' '}
								<span className={cx(classes.boldText)}>
									{numberPerPage * (currentPage - 1) + buttons.length}
								</span>{' '}
								sur <span className={cx(classes.boldText)}>{buttonsCount}</span>
							</div>
						)}
						<ul className={classes.buttonList}>
							{buttons?.map((button, index) => (
								<li key={index}>
									<ProductButtonCard
										button={button}
										onButtonClick={handleModalOpening}
									/>
								</li>
							))}
						</ul>
					</>
				)}
				<div
					className={fr.cx(
						'fr-grid-row--center',
						'fr-grid-row',
						'fr-mt-6v',
						'fr-mb-6v'
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
								key: `pagination-link-${pageNumber}`
							})}
							className={fr.cx('fr-mt-1w')}
						/>
					)}
				</div>
				{/* {reviewsCount && (
					<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
						<div className={fr.cx('fr-col-12')}>
							<ProductBottomInfo
								background={buttons.length > 1 ? '#FFFFFF' : '#F3F6FE'}
								title={
									reviewsCount && reviewsCount.countAll > 0
										? 'Pour aller plus loin avec JDMA ...'
										: 'En attendant vos premiers avis...'
								}
								hasBorder={buttons.length > 1}
								contents={[
									{
										text: 'Nos conseils pour obtenir plus d’avis !',
										link: 'Améliorer le placement de votre bouton',
										image: '/assets/chat_picto.svg'
									},
									{
										text: "Vous souhaitez comprendre les différences entre un parcours sur mobile et un parcours sur ordinateur pour le même service? Réaliser un test A/B pour une fonctionnalité?  C'est possible en créant plusieurs boutons sur le même service.",
										link: 'En savoir plus sur les boutons multiples',
										image: '/assets/cone_picto.svg'
									}
								]}
							/>
						</div>
					</div>
				)} */}
			</div>
		</ProductLayout>
	);
};

export default ProductButtonsPage;

const useStyles = tss
	.withName(ProductButtonsPage.name)
	.withParams()
	.create({
		boldText: {
			fontWeight: 'bold'
		},
		buttonRight: {
			textAlign: 'right'
		},
		noResults: {
			paddingTop: fr.spacing('10v'),
			paddingBottom: fr.spacing('10v'),
			fontWeight: 'bold',
			textAlign: 'center'
		},
		btnContainer: {
			marginTop: '3rem'
		},
		buttonList: {
			paddingInlineStart: 0,
			listStyleType: 'none',
			li: {
				paddingBottom: 0
			},
			marginTop: '1rem'
		}
	});

export { getServerSideProps };
