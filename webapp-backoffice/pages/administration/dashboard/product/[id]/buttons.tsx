import ProductButtonCard from '@/components/dashboard/ProductButton/ProductButtonCard';
import ProductLayout from '@/layouts/Product/ProductLayout';
import { ProductWithButtons } from '@/pages/api/prisma/products/type';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { Button as PrismaButtonType } from '@prisma/client';
import { tss } from 'tss-react/dsfr';
import { getServerSideProps } from '.';
import { Pagination } from '../../../../../components/ui/Pagination';

import ButtonModal from '@/components/dashboard/ProductButton/ButtonModal';
import { Loader } from '@/components/ui/Loader';
import { getNbPages } from '@/utils/tools';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import React from 'react';

interface Props {
	product: ProductWithButtons;
}

const modal = createModal({
	id: 'button-modal',
	isOpenedByDefault: false
});

const ProductButtonsPage = (props: Props) => {
	const { product } = props;

	const [buttons, setButtons] = React.useState<PrismaButtonType[] | null>(null);
	const [currentPage, setCurrentPage] = React.useState(1);
	const [numberPerPage, setNumberPerPage] = React.useState(10);
	const [count, setCount] = React.useState(0);
	const [isLoading, setIsLoading] = React.useState(false);
	const [modalType, setModalType] = React.useState<string>('');
	const [currentButton, setCurrentButton] =
		React.useState<PrismaButtonType | null>(null);

	const [testFilter, setTestFilter] = React.useState<boolean>(false);

	const retrieveButtons = React.useCallback(async () => {
		setIsLoading(true);
		const url: string = `/api/prisma/buttons?product_id=${product.id}&numberPerPage=${numberPerPage}&page=${currentPage}&isTest=${testFilter}`;
		const response = await fetch(url);
		const res = await response.json();
		setButtons(res.data);
		setCount(res.count);
		setIsLoading(false);
	}, [numberPerPage, currentPage, testFilter]);

	React.useEffect(() => {
		retrieveButtons();
	}, [retrieveButtons]);

	const handlePageChange = (pageNumber: number) => {
		setCurrentPage(pageNumber);
	};

	const isModalOpen = useIsModalOpen(modal);

	const handleModalOpening = (modalType: string, button?: PrismaButtonType) => {
		setCurrentButton(button ? button : null);
		setModalType(modalType);
		modal.open();
	};

	const onButtonCreatedOrUpdated = () => {
		retrieveButtons();
		modal.close();
	};

	const { cx, classes } = useStyles();

	const nbPages = getNbPages(count, numberPerPage);

	return (
		<ProductLayout product={product}>
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
					<h2 className={fr.cx('fr-mb-2w')}>Gérer mes boutons</h2>
				</div>
				<div className={cx(fr.cx('fr-col-4'), classes.buttonRight)}>
					<Button
						priority="secondary"
						iconPosition="right"
						iconId="ri-add-box-line"
						onClick={() => handleModalOpening('create')}
					>
						Créer un bouton
					</Button>
				</div>
			</div>
			<div
				className={fr.cx(
					'fr-grid-row',
					'fr-grid-row--gutters',
					'fr-grid-row--right'
				)}
			>
				{buttons && nbPages > 1 && (
					<div className={fr.cx('fr-col-8')}>
						<p>
							Boutons de{' '}
							<span className={cx(classes.boldText)}>
								{numberPerPage * (currentPage - 1) + 1}
							</span>{' '}
							à{' '}
							<span className={cx(classes.boldText)}>
								{numberPerPage * (currentPage - 1) + buttons.length}
							</span>{' '}
							sur <span className={cx(classes.boldText)}>{count}</span>
						</p>
					</div>
				)}
				<div className={fr.cx('fr-col-4')}>
					<Checkbox
						options={[
							{
								label: 'Afficher les boutons de test',
								nativeInputProps: {
									name: 'test-buttons',
									onChange: e => {
										setTestFilter(e.currentTarget.checked);
										setCurrentPage(1);
									}
								}
							}
						]}
					/>
				</div>
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
			<div className={cx(classes.buttonsContainer)}>
				{!buttons || isLoading ? (
					<div className={fr.cx('fr-py-10v')}>
						<Loader />
					</div>
				) : (
					<>
						{!buttons.length && (
							<div className={cx(classes.noResults)}>
								<p role="status">Aucun bouton trouvé</p>
							</div>
						)}
						{buttons?.map((button, index) => (
							<ProductButtonCard
								key={index}
								button={button}
								onButtonClick={handleModalOpening}
							/>
						))}
					</>
				)}
				<div
					className={fr.cx('fr-grid-row--center', 'fr-grid-row', 'fr-mt-6v')}
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
			</div>
		</ProductLayout>
	);
};

export default ProductButtonsPage;

const useStyles = tss.withName(ProductButtonsPage.name).create({
	boldText: {
		fontWeight: 'bold'
	},
	buttonRight: {
		textAlign: 'right'
	},
	noResults: {
		...fr.spacing('padding', {
			topBottom: '10v'
		}),
		fontWeight: 'bold',
		textAlign: 'center'
	},
	buttonsContainer: {
		marginBottom: fr.spacing('16v')
	}
});

export { getServerSideProps };
