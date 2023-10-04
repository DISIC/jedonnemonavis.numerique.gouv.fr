import ProductLayout from '@/layouts/Product/ProductLayout';
import { getServerSideProps } from '.';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { tss } from 'tss-react/dsfr';
import ProductAccessRightCard from '@/components/dashboard/ProductAccess/ProductAccessRightCard';
import React from 'react';
import { Product, UserProduct } from '@prisma/client';
import { UserProductUserWithUsers } from '@/pages/api/prisma/userProduct/type';
import { Pagination } from '@/components/ui/Pagination';
import { getNbPages } from '@/utils/tools';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { createModal } from '@codegouvfr/react-dsfr/Modal';

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

	const [currentUserProduct, setCurrentUserProduct] = React.useState<
		UserProduct | undefined
	>(undefined);
	const [modalType, setModalType] = React.useState<
		'add' | 'remove' | 'resend-email' | undefined
	>(undefined);

	const [currentPage, setCurrentPage] = React.useState(1);
	const [numberPerPage, _] = React.useState(10);
	const [carriersRemovedFilter, setCarriersRemovedFilter] =
		React.useState(false);

	const retrieveButtons = React.useCallback(async () => {
		console.log(carriersRemovedFilter);
		const response = await fetch(
			`/api/prisma/userProduct?product_id=${product.id}&numberPerPage=${numberPerPage}&page=${currentPage}&isRemoved=${carriersRemovedFilter}`
		);
		const res = await response.json();
		setUserProducts(res.data);
		setCount(res.count);
	}, [numberPerPage, currentPage, carriersRemovedFilter]);

	React.useEffect(() => {
		retrieveButtons();
	}, [retrieveButtons]);

	const handleModalOpening = (
		modalType: 'add' | 'remove' | 'resend-email',
		userProduct?: UserProduct
	) => {
		if (userProduct) {
			setCurrentUserProduct(userProduct);
		}
		setModalType(modalType);
		modal.open();
	};

	const handlePageChange = (pageNumber: number) => {
		setCurrentPage(pageNumber);
	};

	const nbPages = getNbPages(count, numberPerPage);

	return (
		<ProductLayout product={product}>
			<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
				<div className={fr.cx('fr-col-8')}>
					<h2 className={fr.cx('fr-mb-2w')}>Gérer les droits d'accès</h2>
				</div>
				<div className={cx(fr.cx('fr-col-4'), classes.buttonRight)}>
					<Button
						priority="secondary"
						iconPosition="right"
						iconId="ri-user-add-line"
						onClick={() => console.log('test')}
					>
						Inviter un porteur
					</Button>
				</div>
			</div>
			<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
				<div className={fr.cx('fr-col-8')}>
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
			<div className={fr.cx('fr-grid-row--center', 'fr-grid-row')}>
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
