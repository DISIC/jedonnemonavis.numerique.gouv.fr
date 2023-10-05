import ProductLayout from '@/layouts/Product/ProductLayout';
import { getServerSideProps } from '.';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { tss } from 'tss-react/dsfr';
import ProductAccessRightCard from '@/components/dashboard/ProductAccess/ProductAccessRightCard';
import ProductAccessRightModal from '@/components/dashboard/ProductAccess/ProductAccessRightModal';
import React from 'react';
import { Product, UserProduct } from '@prisma/client';
import { UserProductUserWithUsers } from '@/pages/api/prisma/userProduct/type';
import { Pagination } from '@/components/ui/Pagination';
import { getNbPages } from '@/utils/tools';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import Alert from '@codegouvfr/react-dsfr/Alert';

interface Props {
	product: Product;
}

const modal = createModal({
	id: 'user-product-modal',
	isOpenedByDefault: false
});

const AccessManagement = (props: Props) => {
	const { cx, classes } = useStyles();

	const { product } = props;

	const [userProducts, setUserProducts] = React.useState<
		UserProductUserWithUsers[]
	>([]);
	const [count, setCount] = React.useState(0);

	const [currentUserProduct, setCurrentUserProduct] =
		React.useState<UserProductUserWithUsers>();
	const [modalType, setModalType] = React.useState<
		'add' | 'remove' | 'resend-email'
	>('add');

	const [currentPage, setCurrentPage] = React.useState(1);
	const [numberPerPage, _] = React.useState(10);
	const [carriersRemovedFilter, setCarriersRemovedFilter] =
		React.useState(false);

	const [isModalSubmitted, setIsModalSubmitted] = React.useState(false);
	const isModalOpen = useIsModalOpen(modal);

	const retrieveUsersProducts = React.useCallback(async () => {
		const response = await fetch(
			`/api/prisma/userProduct?product_id=${product.id}&numberPerPage=${numberPerPage}&page=${currentPage}&isRemoved=${carriersRemovedFilter}`
		);
		const res = await response.json();
		setUserProducts(res.data);
		setCount(res.count);
	}, [numberPerPage, currentPage, carriersRemovedFilter, isModalOpen]);

	React.useEffect(() => {
		retrieveUsersProducts();
	}, [retrieveUsersProducts]);

	const handleModalOpening = (
		modalType: 'add' | 'remove' | 'resend-email',
		userProduct?: UserProduct
	) => {
		if (userProduct) {
			setCurrentUserProduct({ ...userProduct, user: null });
		}
		setIsModalSubmitted(false);
		setModalType(modalType);
		modal.open();
	};

	const getAlertTitle = () => {
		switch (modalType) {
			case 'add':
				return `${currentUserProduct?.user?.firstName} ${currentUserProduct?.user?.lastName} a été ajouté comme porteur.`;
			case 'resend-email':
				return `Un e-mail d’invitation a été envoyé à ${currentUserProduct?.user_email}.`;
			case 'remove':
				return `${currentUserProduct?.user?.firstName} ${currentUserProduct?.user?.lastName} a été retiré comme porteur ou porteuse de ce produit numérique.`;
		}
	};

	const handlePageChange = (pageNumber: number) => {
		setCurrentPage(pageNumber);
	};

	const nbPages = getNbPages(count, numberPerPage);

	return (
		<ProductLayout product={product}>
			<ProductAccessRightModal
				modal={modal}
				isOpen={isModalOpen}
				modalType={modalType}
				productId={product.id}
				setIsModalSubmitted={setIsModalSubmitted}
				setCurrentUserProduct={setCurrentUserProduct}
			/>
			{isModalSubmitted && (
				<Alert
					closable
					description=""
					onClose={function noRefCheck() {
						setIsModalSubmitted(false);
					}}
					severity={modalType === 'remove' ? 'info' : 'success'}
					className={fr.cx('fr-mb-5w')}
					small
					title={getAlertTitle()}
				/>
			)}
			<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
				<div className={fr.cx('fr-col-8')}>
					<h2 className={fr.cx('fr-mb-2w')}>Gérer les droits d'accès</h2>
				</div>
				<div className={cx(fr.cx('fr-col-4'), classes.buttonRight)}>
					<Button
						priority="secondary"
						iconPosition="right"
						iconId="ri-user-add-line"
						onClick={() => handleModalOpening('add')}
					>
						Inviter un porteur
					</Button>
				</div>
			</div>
			<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
				<div className={fr.cx('fr-col-8')}>
					{nbPages > 1 && (
						<span className={fr.cx('fr-ml-0')}>
							Porteur de{' '}
							<span className={cx(classes.boldText)}>
								{numberPerPage * (currentPage - 1) + 1}
							</span>{' '}
							à{' '}
							<span className={cx(classes.boldText)}>
								{numberPerPage * (currentPage - 1) + count}
							</span>{' '}
							de <span className={cx(classes.boldText)}>{count}</span>
						</span>
					)}
				</div>
				<div className={fr.cx('fr-col-4')}>
					<Checkbox
						className={fr.cx('fr-ml-auto')}
						style={{ userSelect: 'none' }}
						options={[
							{
								label: 'Afficher les porteur retirés',
								nativeInputProps: {
									name: 'carriers-removed',
									onChange: () => {
										setCarriersRemovedFilter(!carriersRemovedFilter);
									}
								}
							}
						]}
					/>
				</div>
			</div>
			<div>
				{userProducts?.map((userProduct, index) => (
					<ProductAccessRightCard
						key={index}
						userProduct={userProduct}
						onButtonClick={handleModalOpening}
					/>
				))}
			</div>
			<div className={fr.cx('fr-grid-row--center', 'fr-grid-row', 'fr-mb-15w')}>
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
		</ProductLayout>
	);
};

export default AccessManagement;

const useStyles = tss.create({
	boldText: {
		fontWeight: 'bold'
	},
	buttonRight: {
		textAlign: 'right'
	}
});

export { getServerSideProps };
