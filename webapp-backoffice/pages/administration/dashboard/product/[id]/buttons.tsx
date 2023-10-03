import ProductLayout from '@/layouts/Product/ProductLayout';
import { getServerSideProps } from '.';
import { Button as PrismaButtonType, Product } from '@prisma/client';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { tss } from 'tss-react/dsfr';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import ProductButtonCard from '@/components/dashboard/ProductButton/ProductButtonCard';
import { ProductWithButtons } from '@/pages/api/prisma/products/type';
import { Pagination } from '../../../../../components/ui/Pagination';

import React from 'react';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import ButtonModal from '@/components/dashboard/ProductButton/ButtonModal';

interface Props {
	product: ProductWithButtons;
}

const modal = createModal({
	id: 'button-modal',
	isOpenedByDefault: false
});

const ProductButtonsPage = (props: Props) => {
	const { product } = props;

	const [buttons, setButtons] = React.useState<PrismaButtonType[]>([]);
	const [currentPage, setCurrentPage] = React.useState(1);
	const [numberPerPage, setNumberPerPage] = React.useState(10);
	const [modalType, setModalType] = React.useState<string>('');
	const [currentButton, setCurrentButton] =
		React.useState<PrismaButtonType | null>(null);

	const retrieveButtons = React.useCallback(async () => {
		const response = await fetch(
			`/api/prisma/buttons?product_id=${product.id}`
		);
		const data = await response.json();
		setButtons(data);
		setNumberPerPage(data.length);
	}, []);

	React.useEffect(() => {
		retrieveButtons();
	}, [retrieveButtons]);

	const handlePageChange = (pageNumber: number) => {
		setCurrentPage(pageNumber);
	};

	const isModalOpen = useIsModalOpen(modal);

	const handleModalOpening = (modalType: string, button?: PrismaButtonType) => {
		if (button) {
			setCurrentButton(button);
		}
		setModalType(modalType);
		modal.open();
	};

	const { cx, classes } = useStyles();

	return (
		<ProductLayout product={product}>
			<ButtonModal
				modal={modal}
				isOpen={isModalOpen}
				modalType={modalType}
				button={currentButton}
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
			<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
				<div className={fr.cx('fr-col-4')}>
					<p>
						Boutons de <span className={cx(classes.boldText)}>1</span> à{' '}
						<span className={cx(classes.boldText)}>{numberPerPage}</span> sur{' '}
						<span className={cx(classes.boldText)}>{buttons.length}</span>
					</p>
				</div>
				<div className={fr.cx('fr-col-4')}>
					<Checkbox
						options={[
							{
								label: 'Afficher les boutons de test',
								nativeInputProps: {
									name: 'test-buttons',
									value: 'test'
								}
							}
						]}
					/>
				</div>
				<div className={fr.cx('fr-col-4')}>
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
				</div>
			</div>
			<div>
				{buttons?.map((button, index) => (
					<ProductButtonCard
						key={index}
						button={button}
						onButtonClick={handleModalOpening}
					/>
				))}
			</div>
			<div className={fr.cx('fr-grid-row--center', 'fr-grid-row')}>
				<Pagination
					showFirstLast
					count={5}
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
			</div>
		</ProductLayout>
	);
};

export default ProductButtonsPage;

const useStyles = tss.create({
	boldText: {
		fontWeight: 'bold'
	},
	buttonRight: {
		textAlign: 'right'
	}
});

export { getServerSideProps };
